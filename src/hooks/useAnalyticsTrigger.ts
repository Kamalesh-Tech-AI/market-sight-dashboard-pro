import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceData {
  total_return: number;
  annualized_return: number;
  volatility: number;
  sharpe_ratio: number;
  beta: number;
  alpha: number;
  max_drawdown: number;
  var_95: number;
  updated_at: string;
}

interface SectorAllocation {
  sector: string;
  percentage: number;
  performance: number;
  risk: number;
}

interface AssetCorrelation {
  asset1: string;
  asset2: string;
  correlation: number;
}

interface AnalyticsData {
  performance: PerformanceData | null;
  sectorAllocation: SectorAllocation[];
  correlations: AssetCorrelation[];
  lastUpdated: string;
}

export const useAnalyticsTrigger = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAnalyticsUpdate = async (portfolioId = 'default', period = '6m') => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the analytics trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'analytics-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            portfolioId: portfolioId,
            period: period,
            includeRisk: true
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Fetch updated data from database
      await fetchAnalyticsData(user?.id || 'anonymous', portfolioId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger analytics update');
      console.error('Analytics trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async (userId: string, portfolioId = 'default') => {
    try {
      // Fetch portfolio performance data
      const { data: performanceData, error: performanceError } = await supabase
        .from('portfolio_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (performanceError && performanceError.code !== 'PGRST116') {
        throw performanceError;
      }

      // Fetch sector allocation data
      const { data: sectorData, error: sectorError } = await supabase
        .from('sector_allocation')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .order('percentage', { ascending: false });

      if (sectorError) throw sectorError;

      // Fetch correlation data
      const { data: correlationData, error: correlationError } = await supabase
        .from('asset_correlations')
        .select('*')
        .eq('user_id', userId)
        .eq('portfolio_id', portfolioId)
        .order('correlation', { ascending: false });

      if (correlationError) throw correlationError;

      setData({
        performance: performanceData || null,
        sectorAllocation: sectorData || [],
        correlations: correlationData || [],
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      console.error('Fetch analytics data error:', err);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const performanceSubscription = supabase
      .channel('portfolio-performance-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_performance' },
        () => {
          // Re-fetch data when performance updates
          const userId = 'anonymous'; // You might want to get this from auth context
          fetchAnalyticsData(userId);
        }
      )
      .subscribe();

    const sectorSubscription = supabase
      .channel('sector-allocation-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sector_allocation' },
        () => {
          const userId = 'anonymous';
          fetchAnalyticsData(userId);
        }
      )
      .subscribe();

    const correlationSubscription = supabase
      .channel('correlation-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'asset_correlations' },
        () => {
          const userId = 'anonymous';
          fetchAnalyticsData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(performanceSubscription);
      supabase.removeChannel(sectorSubscription);
      supabase.removeChannel(correlationSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerUpdate: triggerAnalyticsUpdate,
    refetch: () => fetchAnalyticsData('anonymous')
  };
};
