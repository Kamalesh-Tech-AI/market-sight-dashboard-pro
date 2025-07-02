import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Webhook, Save } from "lucide-react";
import { useSettingsTrigger } from "@/hooks/useSettingsTrigger";
import { useEffect, useState } from "react";

const Settings = () => {
  const { data, loading, error, triggerUpdate, refetch } = useSettingsTrigger();
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    // Auto-trigger on component mount
    triggerUpdate();
  }, []);

  useEffect(() => {
    if (data?.lastUpdated) {
      setLastRefresh(new Date(data.lastUpdated).toLocaleTimeString());
    }
  }, [data?.lastUpdated]);

  const handleSaveSettings = async () => {
    await triggerUpdate();
  };

  // Use real-time data if available, otherwise fallback to mock data
  const userSettings = data?.user || {
    name: "John Doe",
    email: "john.doe@example.com",
    timezone: "America/New_York",
    currency: "USD",
    language: "en"
  };

  const notificationSettings = data?.notifications || {
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    priceAlerts: true,
    newsAlerts: true,
    portfolioUpdates: true,
    marketOpen: false,
    marketClose: false
  };

  const apiSettings = data?.api || {
    webhookUrl: "",
    apiKey: "sk-1234567890abcdef",
    rateLimitEnabled: true,
    maxRequestsPerMinute: 100,
    enableLogging: true
  };

  const securitySettings = data?.security || {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    deviceTracking: true
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and application settings</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastRefresh && (
              <Badge variant="outline">
                Last updated: {lastRefresh}
              </Badge>
            )}
            <Button onClick={handleSaveSettings} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">
              Error loading settings: {error}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="api">API & Webhooks</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={userSettings.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={userSettings.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue={userSettings.timezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue={userSettings.currency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-alerts">Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
                    </div>
                    <Switch id="email-alerts" checked={notificationSettings.emailAlerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch id="push-notifications" checked={notificationSettings.pushNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-alerts">SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Text message notifications</p>
                    </div>
                    <Switch id="sms-alerts" checked={notificationSettings.smsAlerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="price-alerts">Price Alerts</Label>
                      <p className="text-sm text-muted-foreground">Stock price movement alerts</p>
                    </div>
                    <Switch id="price-alerts" checked={notificationSettings.priceAlerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="news-alerts">News Alerts</Label>
                      <p className="text-sm text-muted-foreground">Market news and updates</p>
                    </div>
                    <Switch id="news-alerts" checked={notificationSettings.newsAlerts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="portfolio-updates">Portfolio Updates</Label>
                      <p className="text-sm text-muted-foreground">Daily portfolio performance</p>
                    </div>
                    <Switch id="portfolio-updates" checked={notificationSettings.portfolioUpdates} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch id="two-factor" checked={securitySettings.twoFactorEnabled} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input 
                      id="session-timeout" 
                      type="number" 
                      defaultValue={securitySettings.sessionTimeout}
                      className="w-32"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="login-notifications">Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                    </div>
                    <Switch id="login-notifications" checked={securitySettings.loginNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="device-tracking">Device Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track login devices and locations</p>
                    </div>
                    <Switch id="device-tracking" checked={securitySettings.deviceTracking} />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline">Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="w-5 h-5 mr-2" />
                  API & Webhook Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      defaultValue={apiSettings.webhookUrl}
                    />
                    <p className="text-sm text-muted-foreground">
                      URL for receiving real-time data updates
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex space-x-2">
                      <Input 
                        id="api-key" 
                        type="password"
                        defaultValue={apiSettings.apiKey}
                        className="flex-1"
                      />
                      <Button variant="outline">Regenerate</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="rate-limit">Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">Enable API rate limiting</p>
                    </div>
                    <Switch id="rate-limit" checked={apiSettings.rateLimitEnabled} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-requests">Max Requests per Minute</Label>
                    <Input 
                      id="max-requests" 
                      type="number" 
                      defaultValue={apiSettings.maxRequestsPerMinute}
                      className="w-32"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="api-logging">API Logging</Label>
                      <p className="text-sm text-muted-foreground">Log API requests and responses</p>
                    </div>
                    <Switch id="api-logging" checked={apiSettings.enableLogging} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  Application Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue="system">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">Data Refresh Interval</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chart-type">Default Chart Type</Label>
                    <Select defaultValue="line">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select defaultValue="MM/DD/YYYY">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4 animate-pulse" />
              <span>Saving settings...</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
