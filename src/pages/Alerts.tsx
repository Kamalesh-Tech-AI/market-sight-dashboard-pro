import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, TrendingUp, TrendingDown, Volume2, Plus, RefreshCw, Settings } from "lucide-react";
import { useAlertsTrigger } from "@/hooks/useAlertsTrigger";
import { useEffect, useState } from "react";

const Alerts = () => {
  const { data, loading, error, triggerUpdate, refetch } = useAlertsTrigger();
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

  const handleManualRefresh = async () => {
    await triggerUpdate();
  };

  // Use real-time data if available, otherwise fallback to mock data
  const activeAlerts = data?.alerts?.filter(alert => alert.status === 'active') || [
    { id: 1, symbol: "AAPL", type: "price", condition: "above", value: 190, currentValue: 189.95, status: "active", triggered: false },
    { id: 2, symbol: "TSLA", type: "price", condition: "below", value: 240, currentValue: 248.50, status: "active", triggered: false },
    { id: 3, symbol: "NVDA", type: "volume", condition: "above", value: 50000000, currentValue: 45200000, status: "active", triggered: false },
    { id: 4, symbol: "GOOGL", type: "change", condition: "above", value: 5, currentValue: 3.55, status: "active", triggered: false },
  ];

  const triggeredAlerts = data?.alerts?.filter(alert => alert.triggered) || [
    { id: 5, symbol: "MSFT", type: "price", condition: "above", value: 425, currentValue: 428.15, status: "triggered", triggered: true, triggeredAt: "2024-01-15 10:30:00" },
    { id: 6, symbol: "AMZN", type: "change", condition: "above", value: 3, currentValue: 7.48, status: "triggered", triggered: true, triggeredAt: "2024-01-15 09:15:00" },
  ];

  const alertSettings = data?.settings || {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    quietHours: { enabled: true, start: "22:00", end: "08:00" }
  };

  return (
    <DashboardLayout>
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Alerts</h1>
              <p className="text-muted-foreground">Set up price alerts and notifications for your stocks</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastRefresh && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Last updated: {lastRefresh}
                  </Badge>
                  {data?.alerts && data.alerts.length > 0 && (
                    <Badge variant="default">
                      Live Alerts
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Alert
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleManualRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Updating...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">
                Error loading alerts: {error}
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

          {/* Alert Summary */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAlerts.length}</div>
                <p className="text-xs text-muted-foreground">Currently monitoring</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Triggered Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{triggeredAlerts.length}</div>
                <p className="text-xs text-muted-foreground">Alerts fired</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price Alerts</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeAlerts.filter(alert => alert.type === 'price').length}
                </div>
                <p className="text-xs text-muted-foreground">Price-based alerts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Volume Alerts</CardTitle>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeAlerts.filter(alert => alert.type === 'volume').length}
                </div>
                <p className="text-xs text-muted-foreground">Volume-based alerts</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active Alerts</TabsTrigger>
              <TabsTrigger value="triggered">Triggered</TabsTrigger>
              <TabsTrigger value="create">Create Alert</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">{alert.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{alert.symbol}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.type} {alert.condition} {alert.type === 'volume' ? alert.value.toLocaleString() : alert.value}
                              {alert.type === 'price' && '$'}
                              {alert.type === 'change' && '%'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Current</div>
                          <div className="font-semibold">
                            {alert.type === 'volume' ? alert.currentValue.toLocaleString() : alert.currentValue}
                            {alert.type === 'price' && '$'}
                            {alert.type === 'change' && '%'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Active</Badge>
                          <Switch checked={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="triggered" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Triggered Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {triggeredAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Bell className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{alert.symbol}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.type} {alert.condition} {alert.value}
                              {alert.type === 'price' && '$'}
                              {alert.type === 'change' && '%'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Triggered at</div>
                          <div className="font-semibold">{alert.triggeredAt}</div>
                        </div>
                        <Badge variant="destructive">Triggered</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Alert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Stock Symbol</Label>
                      <Input id="symbol" placeholder="e.g., AAPL" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alertType">Alert Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price Alert</SelectItem>
                          <SelectItem value="change">Percentage Change</SelectItem>
                          <SelectItem value="volume">Volume Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value">Target Value</Label>
                      <Input id="value" type="number" placeholder="Enter value" />
                    </div>
                  </div>
                  <Button className="w-full">Create Alert</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch id="email" checked={alertSettings.emailNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch id="push" checked={alertSettings.pushNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Text message alerts</p>
                    </div>
                    <Switch id="sms" checked={alertSettings.smsNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sound">Sound Alerts</Label>
                      <p className="text-sm text-muted-foreground">Play sound when alert triggers</p>
                    </div>
                    <Switch id="sound" checked={alertSettings.soundEnabled} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {loading && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Updating alerts...</span>
            </div>
          </div>
        )}
      </>
    </DashboardLayout>
  );
};

export default Alerts;
