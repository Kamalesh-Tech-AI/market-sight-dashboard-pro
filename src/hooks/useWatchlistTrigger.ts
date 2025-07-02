import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WatchlistStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  addedDate: string;
}

interface WatchlistData {
  stocks: WatchlistStock[];
  lastUpdated: string;
}

export const useWatchlistTrigger = () => {
  const [data, setData] = useState<WatchlistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerWatchlistUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the watchlist trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'watchlist-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            updatePrices: true,
            includeMetrics: true
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Fetch updated data from database
      await fetchWatchlistData(user?.id || 'anonymous');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger watchlist update');
      console.error('Watchlist trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlistData = async (userId: string) => {
    try {
      // Fetch watchlist stocks with current prices
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('user_watchlist')
        .select(`
          *,
          stocks (
            symbol,
            name,
            price,
            change,
            change_percent,
            volume,
            market_cap
          )
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (watchlistError && watchlistError.code !== 'PGRST116') {
        throw watchlistError;
      }

      // Transform the data to match the expected format
      const transformedStocks = watchlistData?.map(item => ({
        symbol: item.stocks?.symbol || item.symbol,
        name: item.stocks?.name || '',
        price: item.stocks?.price || 0,
        change: item.stocks?.change || 0,
        changePercent: item.stocks?.change_percent || 0,
        volume: item.stocks?.volume || '0',
        marketCap: item.stocks?.market_cap || '0',
        addedDate: new Date(item.added_at).toISOString().split('T')[0]
      })) || [];

      setData({
        stocks: transformedStocks,
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch watchlist data');
      console.error('Fetch watchlist data error:', err);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const watchlistSubscription = supabase
      .channel('user-watchlist-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_watchlist' },
        () => {
          const userId = 'anonymous';
          fetchWatchlistData(userId);
        }
      )
      .subscribe();

    const stocksSubscription = supabase
      .channel('stocks-updates-watchlist')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stocks' },
        () => {
          const userId = 'anonymous';
          fetchWatchlistData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(watchlistSubscription);
      supabase.removeChannel(stocksSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerUpdate: triggerWatchlistUpdate,
    refetch: () => fetchWatchlistData('anonymous')
  };
};
