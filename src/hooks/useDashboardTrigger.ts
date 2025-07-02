import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: string;
  market_cap: string;
  sector: string;
  updated_at: string;
}

interface PredictionData {
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  target_price: number;
  timeframe: string;
  created_at: string;
}

interface DashboardData {
  stocks: StockData[];
  predictions: PredictionData[];
  lastUpdated: string;
}

export const useDashboardTrigger = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerDashboardUpdate = async (symbols?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the dashboard trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'dashboard-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            symbols: symbols,
            triggerType: 'dashboard'
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Fetch updated data from database
      await fetchDashboardData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger dashboard update');
      console.error('Dashboard trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch stocks data
      const { data: stocksData, error: stocksError } = await supabase
        .from('stocks')
        .select('*')
        .order('updated_at', { ascending: false });

      if (stocksError) throw stocksError;

      // Fetch predictions data
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (predictionsError) throw predictionsError;

      setData({
        stocks: stocksData || [],
        predictions: predictionsData || [],
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Fetch dashboard data error:', err);
    }
  };

  // Auto-trigger on component mount (when dashboard loads)
  useEffect(() => {
    triggerDashboardUpdate();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const stocksSubscription = supabase
      .channel('stocks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stocks' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const predictionsSubscription = supabase
      .channel('predictions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stocksSubscription);
      supabase.removeChannel(predictionsSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerUpdate: triggerDashboardUpdate,
    refetch: fetchDashboardData
  };
};
