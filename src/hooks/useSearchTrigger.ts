import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  marketCap: string;
}

interface PopularStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector: string;
  marketCap: string;
}

interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  reason: string;
}

interface SearchData {
  results: SearchResult[];
  popular: PopularStock[];
  trending: TrendingStock[];
  lastUpdated: string;
}

export const useSearchTrigger = () => {
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerSearch = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the search trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'search-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            query: query,
            limit: 20,
            includePopular: true,
            includeTrending: true
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Update data with search results
      setData({
        results: triggerData.results || [],
        popular: triggerData.popular || [],
        trending: triggerData.trending || [],
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search stocks');
      console.error('Search trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularAndTrending = async () => {
    try {
      // Fetch popular stocks
      const { data: popularData, error: popularError } = await supabase
        .from('popular_stocks')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(10);

      if (popularError && popularError.code !== 'PGRST116') {
        throw popularError;
      }

      // Fetch trending stocks
      const { data: trendingData, error: trendingError } = await supabase
        .from('trending_stocks')
        .select('*')
        .order('trend_score', { ascending: false })
        .limit(10);

      if (trendingError && trendingError.code !== 'PGRST116') {
        throw trendingError;
      }

      setData(prevData => ({
        results: prevData?.results || [],
        popular: popularData || [],
        trending: trendingData || [],
        lastUpdated: new Date().toISOString()
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular and trending stocks');
      console.error('Fetch popular/trending error:', err);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const popularSubscription = supabase
      .channel('popular-stocks-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'popular_stocks' },
        () => {
          fetchPopularAndTrending();
        }
      )
      .subscribe();

    const trendingSubscription = supabase
      .channel('trending-stocks-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'trending_stocks' },
        () => {
          fetchPopularAndTrending();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(popularSubscription);
      supabase.removeChannel(trendingSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerSearch,
    refetch: fetchPopularAndTrending
  };
};
