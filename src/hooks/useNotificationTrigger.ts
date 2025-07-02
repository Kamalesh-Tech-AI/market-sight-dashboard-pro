import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  read: boolean;
  createdAt: string;
}

export const useNotificationTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const triggerNotification = async (notificationData: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    userId?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the notification trigger edge function
      const { data: triggerData, error: triggerError } = await supabase.functions.invoke(
        'notification-trigger',
        {
          body: {
            ...notificationData,
            userId: notificationData.userId || user?.id || 'anonymous',
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID()
          }
        }
      );

      if (triggerError) {
        throw new Error(triggerError.message);
      }

      // Add notification to local context
      addNotification({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type
      });

      return triggerData;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger notification');
      console.error('Notification trigger error:', err);
      
      // Still add to local context as fallback
      addNotification({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate demo notifications
  useEffect(() => {
    const generateDemoNotifications = () => {
      const demoNotifications = [
        {
          title: 'Portfolio Update',
          message: 'Your portfolio gained $1,247.85 today (+3.35%)',
          type: 'success' as const
        },
        {
          title: 'Price Alert',
          message: 'AAPL has reached your target price of $190',
          type: 'info' as const
        },
        {
          title: 'Market News',
          message: 'Tech stocks rally on positive earnings reports',
          type: 'info' as const
        }
      ];

      // Add notifications with delays
      demoNotifications.forEach((notification, index) => {
        setTimeout(() => {
          addNotification(notification);
        }, (index + 1) * 3000);
      });
    };

    // Generate demo notifications after 2 seconds
    const timer = setTimeout(generateDemoNotifications, 2000);
    return () => clearTimeout(timer);
  }, [addNotification]);

  return {
    triggerNotification,
    loading,
    error
  };
};
