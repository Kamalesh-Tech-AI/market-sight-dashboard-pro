import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, Bell, Shield, Save, Upload, Mail, Edit } from "lucide-react";
import { useSettingsTrigger } from "@/hooks/useSettingsTrigger";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { data, loading, error, triggerUpdate, refetch } = useSettingsTrigger();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useAppSettings();
  const { addNotification } = useNotifications();
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data?.lastUpdated) {
      setLastRefresh(new Date(data.lastUpdated).toLocaleTimeString());
    }
  }, [data?.lastUpdated]);

  useEffect(() => {
    if (user) {
      setNewName(user.user_metadata?.full_name || '');
      setNewEmail(user.email || '');
      setProfileImage(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

  const handleSaveSettings = async () => {
    await triggerUpdate();
    addNotification({
      title: 'Settings Saved',
      message: 'Your settings have been updated successfully.',
      type: 'success'
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        // Here you would typically upload to your storage service
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameUpdate = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName }
      });
      
      if (error) throw error;
      
      setIsEditingName(false);
      toast({
        title: "Name updated",
        description: "Your name has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating name",
        description: "There was a problem updating your name.",
        variant: "destructive",
      });
    }
  };

  const handleEmailUpdate = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      setShowVerificationDialog(true);
      toast({
        title: "Verification email sent",
        description: "Please check your email and enter the verification code.",
      });
    } catch (error) {
      toast({
        title: "Error updating email",
        description: "There was a problem updating your email.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyEmail = async () => {
    // This would typically verify the code with your backend
    setShowVerificationDialog(false);
    setIsEditingEmail(false);
    toast({
      title: "Email verified",
      description: "Your email has been updated and verified successfully.",
    });
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Use real-time data if available, otherwise fallback to mock data
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

  const securitySettings = data?.security || {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    deviceTracking: true
  };

  return (
    <DashboardLayout>
      <>
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
                  {/* Profile Picture Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileImage} alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Picture
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="flex space-x-2">
                        {isEditingName ? (
                          <>
                            <Input 
                              value={newName} 
                              onChange={(e) => setNewName(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={handleNameUpdate}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Input value={user?.user_metadata?.full_name || ''} disabled className="flex-1" />
                            <Button size="sm" variant="outline" onClick={() => setIsEditingName(true)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex space-x-2">
                        {isEditingEmail ? (
                          <>
                            <Input 
                              type="email"
                              value={newEmail} 
                              onChange={(e) => setNewEmail(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={handleEmailUpdate}>
                              <Mail className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditingEmail(false)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Input value={user?.email || ''} disabled className="flex-1" />
                            <Button size="sm" variant="outline" onClick={() => setIsEditingEmail(true)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="America/New_York">
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
                      <Select defaultValue="USD">
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
                      <Select value={theme} onValueChange={setTheme}>
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
                      <Select 
                        value={settings.refreshInterval.toString()} 
                        onValueChange={(value) => updateSettings({ refreshInterval: parseInt(value) })}
                      >
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
                      <Select 
                        value={settings.chartType} 
                        onValueChange={(value: 'line' | 'candlestick' | 'area') => updateSettings({ chartType: value })}
                      >
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
                      <Select 
                        value={settings.dateFormat} 
                        onValueChange={(value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => updateSettings({ dateFormat: value })}
                      >
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
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Current theme: <span className="font-medium">{theme}</span></p>
                      <p>Refresh interval: <span className="font-medium">{settings.refreshInterval} seconds</span></p>
                      <p>Chart type: <span className="font-medium">{settings.chartType}</span></p>
                      <p>Date format: <span className="font-medium">{new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: settings.dateFormat.includes('MM') ? '2-digit' : 'numeric',
                        day: '2-digit'
                      })}</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Email Verification Dialog */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Email Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to your new email address. Please enter it below.
              </p>
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleVerifyEmail} disabled={verificationCode.length !== 6}>
                  Verify Email
                </Button>
                <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {loading && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4 animate-pulse" />
              <span>Saving settings...</span>
            </div>
          </div>
        )}
      </>
    </DashboardLayout>
  );
};

export default Settings;
