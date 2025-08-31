'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  User,
  Plus, 
  Mail, 
  Shield, 
  Trash2,
  UserPlus,
  Key,
  Globe
} from 'lucide-react';
import { useAuthStore, useAdminStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock users data - in production this would come from Firebase
const mockUsers = [
  {
    uid: '1',
    email: 'admin@credexsystems.com',
    displayName: 'Admin User',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-08-30'),
    status: 'active'
  },
  {
    uid: '2', 
    email: 'client1@example.com',
    displayName: 'John Smith',
    role: 'client',
    createdAt: new Date('2024-02-15'),
    lastLoginAt: new Date('2024-08-29'),
    status: 'active'
  }
];

interface InviteUser {
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin';
}

interface InviteAdmin {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin';
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const { users, isLoadingUsers, fetchUsers, inviteUser, deleteUser, updateUserRole } = useAdminStore();
  const [useFallback, setUseFallback] = useState(false);
  
  // User Management State
  const [inviteUserDialogOpen, setInviteUserDialogOpen] = useState(false);
  const [inviteUserForm, setInviteUserForm] = useState<InviteUser>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'client'
  });
  const [isInvitingUser, setIsInvitingUser] = useState(false);

  // Admin Management State  
  const [inviteAdminDialogOpen, setInviteAdminDialogOpen] = useState(false);
  const [inviteAdminForm, setInviteAdminForm] = useState<InviteAdmin>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'admin'
  });
  const [isInvitingAdmin, setIsInvitingAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin()) {
      router.push('/ideas');
      return;
    }

    // Fetch users from Firebase
    fetchUsers().catch(error => {
      console.error('Failed to fetch users from Firebase:', error);
      setUseFallback(true);
    });
  }, [user, isAdmin, router, fetchUsers]);

  const handleInviteUser = async () => {
    if (!inviteUserForm.email || !inviteUserForm.firstName || !inviteUserForm.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsInvitingUser(true);
      
      await inviteUser(inviteUserForm);
      
      toast.success(`User invitation sent to ${inviteUserForm.email}`);
      setInviteUserDialogOpen(false);
      setInviteUserForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'client'
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send user invitation');
    } finally {
      setIsInvitingUser(false);
    }
  };

  const handleInviteAdmin = async () => {
    if (!inviteAdminForm.email || !inviteAdminForm.firstName || !inviteAdminForm.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsInvitingAdmin(true);
      
      await inviteUser(inviteAdminForm);
      
      toast.success(`Admin invitation sent to ${inviteAdminForm.email}`);
      setInviteAdminDialogOpen(false);
      setInviteAdminForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'admin'
      });
    } catch (error) {
      console.error('Error inviting admin:', error);
      toast.error('Failed to send admin invitation');
    } finally {
      setIsInvitingAdmin(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'client' | 'admin') => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole === 'admin' ? 'Administrator' : 'Client'}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage system settings and user accounts
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Admin Management</span>
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Development Mode Indicator */}
              {useFallback && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Development Mode:</strong> Using mock user data. Configure Firebase environment variables to connect to real user database.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Management Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <p className="text-gray-600">Manage user accounts and permissions</p>
                </div>
                
                <Dialog open={inviteUserDialogOpen} onOpenChange={setInviteUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite New User</DialogTitle>
                      <DialogDescription>
                        Send an invitation email to add a new client user to the Ideas Portal.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="userFirstName">First Name</Label>
                          <Input
                            id="userFirstName"
                            value={inviteUserForm.firstName}
                            onChange={(e) => setInviteUserForm({...inviteUserForm, firstName: e.target.value})}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <Label htmlFor="userLastName">Last Name</Label>
                          <Input
                            id="userLastName"
                            value={inviteUserForm.lastName}
                            onChange={(e) => setInviteUserForm({...inviteUserForm, lastName: e.target.value})}
                            placeholder="Smith"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="userEmail">Email Address</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={inviteUserForm.email}
                          onChange={(e) => setInviteUserForm({...inviteUserForm, email: e.target.value})}
                          placeholder="john.smith@example.com"
                        />
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Client User</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Can submit ideas, vote, and comment. Cannot access admin features.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteUser} disabled={isInvitingUser}>
                        {isInvitingUser ? 'Sending...' : 'Send User Invitation'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Client Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Users ({users.filter(u => u.role === 'client').length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <div className="flex space-x-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-12" />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.filter(u => u.role === 'client').map((user) => (
                      <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{user.displayName}</h4>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Client User
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeRole(user.uid, 'admin')}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Promote to Admin
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.uid, user.email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                      {users.filter(u => u.role === 'client').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No client users found</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Management Tab */}
          <TabsContent value="admin">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Admin Management</h2>
                  <p className="text-gray-600">Manage administrators and system-wide settings</p>
                </div>
                
                <Dialog open={inviteAdminDialogOpen} onOpenChange={setInviteAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Invite Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite New Administrator</DialogTitle>
                      <DialogDescription>
                        Send an invitation email to add a new administrator with full system access.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="adminFirstName">First Name</Label>
                          <Input
                            id="adminFirstName"
                            value={inviteAdminForm.firstName}
                            onChange={(e) => setInviteAdminForm({...inviteAdminForm, firstName: e.target.value})}
                            placeholder="Jane"
                          />
                        </div>
                        <div>
                          <Label htmlFor="adminLastName">Last Name</Label>
                          <Input
                            id="adminLastName"
                            value={inviteAdminForm.lastName}
                            onChange={(e) => setInviteAdminForm({...inviteAdminForm, lastName: e.target.value})}
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="adminEmail">Email Address</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={inviteAdminForm.email}
                          onChange={(e) => setInviteAdminForm({...inviteAdminForm, email: e.target.value})}
                          placeholder="jane.doe@credexsystems.com"
                        />
                      </div>
                      <div className="bg-red-50 p-3 rounded-md border border-red-200">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">Administrator</span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Full system access including user management, idea moderation, and system configuration.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteAdminDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteAdmin} disabled={isInvitingAdmin} className="bg-red-600 hover:bg-red-700">
                        {isInvitingAdmin ? 'Sending...' : 'Send Admin Invitation'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Current Administrators List */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Administrators ({users.filter(u => u.role === 'admin').length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg bg-red-50">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                            <div className="flex space-x-2">
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-12" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-8" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.filter(u => u.role === 'admin').map((admin) => (
                      <div key={admin.uid} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{admin.displayName}</h4>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <Badge variant="default" className="bg-red-600">
                                Administrator
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {admin.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteUser(admin.uid, admin.email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                      {users.filter(u => u.role === 'admin').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No administrators found</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      System Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        defaultValue="Credex Ideas Portal"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        defaultValue="tech@credexsystems.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxIdeasPerUser">Max Ideas Per User</Label>
                      <Input
                        id="maxIdeasPerUser"
                        type="number"
                        defaultValue="10"
                        className="mt-1"
                      />
                    </div>
                    <Button className="w-full">
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>

                {/* Email Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Email Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        placeholder="smtp.sendgrid.net"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        placeholder="587"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="noreply@credexsystems.com"
                        className="mt-1"
                      />
                    </div>
                    <Button className="w-full">
                      Save Email Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        defaultValue="60"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        defaultValue="5"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        defaultChecked
                        className="rounded"
                      />
                      <Label htmlFor="requireEmailVerification">
                        Require email verification for new users
                      </Label>
                    </div>
                    <Button className="w-full">
                      Save Security Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* API Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      API Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="apiVersion">API Version</Label>
                      <Input
                        id="apiVersion"
                        defaultValue="v1"
                        className="mt-1"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="rateLimitPerMinute">Rate Limit (requests/minute)</Label>
                      <Input
                        id="rateLimitPerMinute"
                        type="number"
                        defaultValue="100"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enableApiLogging"
                        defaultChecked
                        className="rounded"
                      />
                      <Label htmlFor="enableApiLogging">
                        Enable API request logging
                      </Label>
                    </div>
                    <Button className="w-full">
                      Save API Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
