import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AlertData {
  id: number;
  symbol: string;
  type: string;
  condition: string;
  value: number;
  currentValue: number;
  status: string;
  triggered: boolean;
  triggeredAt?: string;
}

interface AlertSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  soundEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface AlertsData {
  alerts: AlertData[];
  settings: AlertSettings;
  lastUpdated: string;
}

export const useAlertsTrigger = () => {
  const [data, setData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAlertsUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the alerts trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'alerts-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            checkTriggers: true,
            updatePrices: true
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Fetch updated data from database
      await fetchAlertsData(user?.id || 'anonymous');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger alerts update');
      console.error('Alerts trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertsData = async (userId: string) => {
    try {
      // Fetch user alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (alertsError && alertsError.code !== 'PGRST116') {
        throw alertsError;
      }

      // Fetch alert settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('alert_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      setData({
        alerts: alertsData || [],
        settings: settingsData || null,
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts data');
      console.error('Fetch alerts data error:', err);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const alertsSubscription = supabase
      .channel('user-alerts-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_alerts' },
        () => {
          const userId = 'anonymous';
          fetchAlertsData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerUpdate: triggerAlertsUpdate,
    refetch: () => fetchAlertsData('anonymous')
  };
};
