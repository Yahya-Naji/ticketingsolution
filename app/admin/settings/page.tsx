 'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Mail, 
  Shield, 
  Palette,
  Bell,
  Database
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);
  const [allowAnonymousVoting, setAllowAnonymousVoting] = useState(false);
  const [moderationMode, setModerationMode] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin()) {
      router.push('/ideas');
      return;
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin()) {
    return null;
  }

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage portal settings, user permissions, and system configuration.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="portal-name">Portal Name</Label>
                    <Input 
                      id="portal-name" 
                      defaultValue="Credex Ideas Portal" 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="portal-description">Portal Description</Label>
                    <Input 
                      id="portal-description" 
                      defaultValue="Submit and vote on feature ideas for Unity software" 
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea 
                    id="welcome-message" 
                    placeholder="Enter a welcome message for new users..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="maintenance-mode" 
                    checked={false}
                  />
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">User Registration</h4>
                    <p className="text-sm text-gray-600">Allow new users to register</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Verification Required</h4>
                    <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Admin Approval for New Users</h4>
                    <p className="text-sm text-gray-600">Require admin approval for new user accounts</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div>
                  <Label htmlFor="default-role">Default User Role</Label>
                  <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Send email notifications for new ideas</p>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Real-time Notifications</h4>
                    <p className="text-sm text-gray-600">Show in-app notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Digest</h4>
                    <p className="text-sm text-gray-600">Send weekly summary emails</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation */}
          <TabsContent value="moderation">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Approval</h4>
                    <p className="text-sm text-gray-600">Automatically approve new ideas</p>
                  </div>
                  <Switch 
                    checked={autoApproval}
                    onCheckedChange={setAutoApproval}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Moderation Mode</h4>
                    <p className="text-sm text-gray-600">All ideas require approval before being public</p>
                  </div>
                  <Switch 
                    checked={moderationMode}
                    onCheckedChange={setModerationMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Anonymous Voting</h4>
                    <p className="text-sm text-gray-600">Allow users to vote without registration</p>
                  </div>
                  <Switch 
                    checked={allowAnonymousVoting}
                    onCheckedChange={setAllowAnonymousVoting}
                  />
                </div>

                <div>
                  <Label htmlFor="min-idea-length">Minimum Idea Description Length</Label>
                  <Input 
                    id="min-idea-length" 
                    type="number" 
                    defaultValue="50" 
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="from-email">From Email Address</Label>
                  <Input 
                    id="from-email" 
                    type="email"
                    placeholder="noreply@credexsystems.com" 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input 
                    id="notification-email" 
                    type="email"
                    placeholder="admin@credexsystems.com" 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email-template">Email Template</Label>
                  <Textarea 
                    id="email-template" 
                    placeholder="Email template for notifications..."
                    className="mt-1"
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="w-6 h-6 mb-2" />
                    Export Ideas
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    Export Users
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Shield className="w-6 h-6 mb-2" />
                    Backup Data
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                  <div className="space-y-4">
                    <Button variant="destructive" className="w-full">
                      Delete All Ideas
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Reset All Votes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button onClick={handleSaveSettings} className="bg-green-700 hover:bg-green-800">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
