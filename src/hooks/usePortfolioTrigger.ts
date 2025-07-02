import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HoldingData {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface TransactionData {
  id: number;
  type: string;
  symbol: string;
  shares: number;
  price: number;
  date: string;
  total: number;
}

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface PortfolioData {
  holdings: HoldingData[];
  transactions: TransactionData[];
  summary: PortfolioSummary;
  lastUpdated: string;
}

export const usePortfolioTrigger = () => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerPortfolioUpdate = async (portfolioId = 'default') => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the portfolio trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'portfolio-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            portfolioId: portfolioId,
            includeTransactions: true,
            includeAnalytics: true
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Fetch updated data from database
      await fetchPortfolioData(user?.id || 'anonymous', portfolioId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger portfolio update');
      console.error('Portfolio trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioData = async (userId: string, portfolioId = 'default') => {
    try {
      // Fetch portfolio holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .order('value', { ascending: false });

      if (holdingsError && holdingsError.code !== 'PGRST116') {
        throw holdingsError;
      }

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('portfolio_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .order('date', { ascending: false })
        .limit(10);

      if (transactionsError && transactionsError.code !== 'PGRST116') {
        throw transactionsError;
      }

      // Fetch portfolio summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('portfolio_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') {
        throw summaryError;
      }

      setData({
        holdings: holdingsData || [],
        transactions: transactionsData || [],
        summary: summaryData || null,
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      console.error('Fetch portfolio data error:', err);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const holdingsSubscription = supabase
      .channel('portfolio-holdings-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_holdings' },
        () => {
          const userId = 'anonymous';
          fetchPortfolioData(userId);
        }
      )
      .subscribe();

    const transactionsSubscription = supabase
      .channel('portfolio-transactions-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_transactions' },
        () => {
          const userId = 'anonymous';
          fetchPortfolioData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(holdingsSubscription);
      supabase.removeChannel(transactionsSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerUpdate: triggerPortfolioUpdate,
    refetch: () => fetchPortfolioData('anonymous')
  };
};
