import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PredictionData {
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  target_price: number;
  timeframe: string;
  model: string;
  factors: string[];
  accuracy: number;
  created_at: string;
}

interface ModelPerformance {
  model_name: string;
  accuracy: number;
  total_predictions: number;
  last_updated: string;
}

interface PredictionsData {
  predictions: PredictionData[];
  modelPerformance: ModelPerformance[];
  lastUpdated: string;
}

export const usePredictionsTrigger = () => {
  const [data, setData] = useState<PredictionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerPredictionsUpdate = async (symbols?: string[], models?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the predictions trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'predictions-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            symbols: symbols,
            models: models,
            timeframe: '1w'
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Fetch updated data from database
      await fetchPredictionsData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger predictions update');
      console.error('Predictions trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictionsData = async () => {
    try {
      // Fetch predictions data
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (predictionsError) throw predictionsError;

      // Fetch model performance data
      const { data: modelData, error: modelError } = await supabase
        .from('model_performance')
        .select('*')
        .order('accuracy', { ascending: false });

      if (modelError) throw modelError;

      setData({
        predictions: predictionsData || [],
        modelPerformance: modelData || [],
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions data');
      console.error('Fetch predictions data error:', err);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const predictionsSubscription = supabase
      .channel('predictions-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          fetchPredictionsData();
        }
      )
      .subscribe();

    const modelSubscription = supabase
      .channel('model-performance-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'model_performance' },
        () => {
          fetchPredictionsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(predictionsSubscription);
      supabase.removeChannel(modelSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerUpdate: triggerPredictionsUpdate,
    refetch: fetchPredictionsData
  };
};
