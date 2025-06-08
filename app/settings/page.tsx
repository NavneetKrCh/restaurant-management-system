"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { useTheme } from "next-themes"
import { Settings, Moon, Sun, Database, Bell, User, Shield, Clock, Save, Download, Upload } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newOrders: true,
    dailyReports: false,
    systemUpdates: true,
  })
  const [systemSettings, setSystemSettings] = useState({
    autoSync: true,
    syncInterval: 60, // minutes
    lowStockThreshold: 10,
    backupFrequency: "daily",
    sessionTimeout: 30, // minutes
  })
  const [userProfile, setUserProfile] = useState({
    name: "Restaurant Manager",
    email: "manager@restaurant.com",
    role: "Administrator",
    lastLogin: "2024-01-15 09:30:00",
  })

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentTheme = theme === "system" ? systemTheme : theme
  const isDarkMode = currentTheme === "dark"

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem("userNotifications", JSON.stringify(notifications))
    localStorage.setItem("systemSettings", JSON.stringify(systemSettings))
    alert("Settings saved successfully!")
  }

  const exportData = () => {
    // Export data functionality
    alert("Data export started. You will receive a download link shortly.")
  }

  const importData = () => {
    // Import data functionality
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.csv"
    input.onchange = () => {
      alert("Data import functionality would be implemented here.")
    }
    input.click()
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-50 dark:bg-gray-950">
      <Header title="Settings" subtitle="Manage your restaurant system preferences and configuration" />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Settings className="w-5 h-5" />
                General Preferences
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Customize your restaurant management experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Appearance</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                      Switch between light and dark themes
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Current theme: {theme} {theme === "system" && `(${systemTheme})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
                    <Moon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Language Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Language & Region</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-gray-900 dark:text-gray-100">
                      Language
                    </Label>
                    <select
                      id="language"
                      className="w-full p-2 border rounded-md bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                      defaultValue="en"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="it">Italian</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-900 dark:text-gray-100">
                      Timezone
                    </Label>
                    <select
                      id="timezone"
                      className="w-full p-2 border rounded-md bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                      defaultValue="UTC-5"
                    >
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                      <option value="UTC-7">Mountain Time (UTC-7)</option>
                      <option value="UTC-6">Central Time (UTC-6)</option>
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Currency Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Currency & Format</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-gray-900 dark:text-gray-100">
                      Currency
                    </Label>
                    <select
                      id="currency"
                      className="w-full p-2 border rounded-md bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                      defaultValue="USD"
                    >
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                      <option value="CAD">Canadian Dollar (C$)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat" className="text-gray-900 dark:text-gray-100">
                      Date Format
                    </Label>
                    <select
                      id="dateFormat"
                      className="w-full p-2 border rounded-md bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                      defaultValue="MM/DD/YYYY"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                      Get notified when ingredients are running low
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) => handleNotificationChange("lowStock", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">New Orders</Label>
                    <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                      Receive alerts for new customer orders
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newOrders}
                    onCheckedChange={(checked) => handleNotificationChange("newOrders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Daily Reports</Label>
                    <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                      Get daily sales and performance summaries
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) => handleNotificationChange("dailyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">System Updates</Label>
                    <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                      Notifications about system maintenance and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("systemUpdates", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Database className="w-5 h-5" />
                System Configuration
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Configure system behavior and performance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                      Automatically sync data with the database
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.autoSync}
                    onCheckedChange={(checked) => handleSystemSettingChange("autoSync", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syncInterval" className="text-gray-900 dark:text-gray-100">
                    Sync Interval (minutes)
                  </Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={systemSettings.syncInterval}
                    onChange={(e) => handleSystemSettingChange("syncInterval", Number.parseInt(e.target.value))}
                    className="w-full bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold" className="text-gray-900 dark:text-gray-100">
                    Low Stock Threshold (%)
                  </Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={systemSettings.lowStockThreshold}
                    onChange={(e) => handleSystemSettingChange("lowStockThreshold", Number.parseInt(e.target.value))}
                    className="w-full bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupFrequency" className="text-gray-900 dark:text-gray-100">
                    Backup Frequency
                  </Label>
                  <select
                    id="backupFrequency"
                    className="w-full p-2 border rounded-md bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                    value={systemSettings.backupFrequency}
                    onChange={(e) => handleSystemSettingChange("backupFrequency", e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="manual">Manual Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout" className="text-gray-900 dark:text-gray-100">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => handleSystemSettingChange("sessionTimeout", Number.parseInt(e.target.value))}
                    className="w-full bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">System Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Database</span>
                      <Badge variant="secondary">Connected</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">ML Engine</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto Sync</span>
                      <Badge variant={systemSettings.autoSync ? "secondary" : "destructive"}>
                        {systemSettings.autoSync ? "Running" : "Stopped"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Last Backup</span>
                      <span className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid gap-6">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Import, export, and manage your restaurant data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={exportData} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                  <Button onClick={importData} variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Data
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                  Export your data for backup or analysis. Import data from previous systems or backups.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Storage Usage</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Monitor your data storage and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900 dark:text-gray-100">Database Size</span>
                    <span className="text-gray-900 dark:text-gray-100">245 MB / 1 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "24.5%" }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Orders</p>
                    <p className="text-muted-foreground text-gray-600 dark:text-gray-400">1,234 records</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Dishes</p>
                    <p className="text-muted-foreground text-gray-600 dark:text-gray-400">89 items</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Ingredients</p>
                    <p className="text-muted-foreground text-gray-600 dark:text-gray-400">156 items</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Analytics</p>
                    <p className="text-muted-foreground text-gray-600 dark:text-gray-400">30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage your account details and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileName" className="text-gray-900 dark:text-gray-100">
                    Full Name
                  </Label>
                  <Input
                    id="profileName"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileEmail" className="text-gray-900 dark:text-gray-100">
                    Email Address
                  </Label>
                  <Input
                    id="profileEmail"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile((prev) => ({ ...prev, email: e.target.value }))}
                    className="bg-background dark:bg-gray-700 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-gray-100">Role</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{userProfile.role}</Badge>
                    <Shield className="w-4 h-4 text-muted-foreground text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-900 dark:text-gray-100">Last Login</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-muted-foreground text-gray-600 dark:text-gray-400">
                      {userProfile.lastLogin}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Security</h4>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
