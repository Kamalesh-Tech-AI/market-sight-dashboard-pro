import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserSettings {
  name: string;
  email: string;
  timezone: string;
  currency: string;
  language: string;
}

interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  portfolioUpdates: boolean;
  marketOpen: boolean;
  marketClose: boolean;
}

interface ApiSettings {
  webhookUrl: string;
  apiKey: string;
  rateLimitEnabled: boolean;
  maxRequestsPerMinute: number;
  enableLogging: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
  deviceTracking: boolean;
}

interface SettingsData {
  user: UserSettings;
  notifications: NotificationSettings;
  api: ApiSettings;
  security: SecuritySettings;
  lastUpdated: string;
}

export const useSettingsTrigger = () => {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerSettingsUpdate = async (settings?: Partial<SettingsData>) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the settings trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'settings-trigger',
        {
          body: {
            userId: user?.id || 'anonymous',
            settings: settings,
            action: settings ? 'update' : 'fetch'
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Fetch updated data from database
      await fetchSettingsData(user?.id || 'anonymous');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger settings update');
      console.error('Settings trigger error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettingsData = async (userId: string) => {
    try {
      // Fetch user settings
      const { data: userSettings, error: userError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Fetch notification settings
      const { data: notificationSettings, error: notificationError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (notificationError && notificationError.code !== 'PGRST116') {
        throw notificationError;
      }

      // Fetch API settings
      const { data: apiSettings, error: apiError } = await supabase
        .from('api_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (apiError && apiError.code !== 'PGRST116') {
        throw apiError;
      }

      // Fetch security settings
      const { data: securitySettings, error: securityError } = await supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (securityError && securityError.code !== 'PGRST116') {
        throw securityError;
      }

      setData({
        user: userSettings || null,
        notifications: notificationSettings || null,
        api: apiSettings || null,
        security: securitySettings || null,
        lastUpdated: new Date().toISOString()
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings data');
      console.error('Fetch settings data error:', err);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const settingsSubscription = supabase
      .channel('user-settings-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_settings' },
        () => {
          const userId = 'anonymous';
          fetchSettingsData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsSubscription);
    };
  }, []);

  return {
    data,
    loading,
    error,
    triggerUpdate: triggerSettingsUpdate,
    refetch: () => fetchSettingsData('anonymous')
  };
};
