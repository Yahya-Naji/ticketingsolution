'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield,
  Lightbulb,
  Heart,
  MessageCircle,
  Settings,
  Bell
} from 'lucide-react';
import { useAuthStore, useIdeasStore } from '@/lib/store';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { myIdeas, fetchMyIdeas } = useIdeasStore();
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Set initial form data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || ''
    });

    // Load user's ideas
    fetchMyIdeas().catch(console.error);
  }, [user, router, fetchMyIdeas]);

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSaveProfile = () => {
    // Save profile logic here
    console.log('Saving profile:', formData);
    setEditMode(false);
  };

  const userStats = {
    totalIdeas: myIdeas.length,
    publicIdeas: myIdeas.filter(idea => idea.isPublic).length,
    privateIdeas: myIdeas.filter(idea => !idea.isPublic).length,
    totalVotes: myIdeas.reduce((sum, idea) => sum + idea.voteCount, 0),
    totalComments: myIdeas.reduce((sum, idea) => sum + idea.commentCount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge 
                  variant="secondary" 
                  className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                >
                  {user.role === 'admin' ? 'Administrator' : 'Client'}
                </Badge>
                <span className="text-sm text-gray-500">
                  Member since {user.createdAt?.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short' 
                  })}
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setEditMode(!editMode)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Lightbulb className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalIdeas}</div>
              <div className="text-xs text-gray-600">Total Ideas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold">{userStats.publicIdeas}</div>
              <div className="text-xs text-gray-600">Public</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold">{userStats.privateIdeas}</div>
              <div className="text-xs text-gray-600">Private</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalVotes}</div>
              <div className="text-xs text-gray-600">Votes Received</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalComments}</div>
              <div className="text-xs text-gray-600">Comments</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="ideas">My Ideas ({userStats.totalIdeas})</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={handleSaveProfile} className="bg-green-700 hover:bg-green-800 mr-2">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">First Name</Label>
                      <p className="mt-1 text-gray-900">{user.firstName || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                      <p className="mt-1 text-gray-900">{user.lastName || 'Not set'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                      <p className="mt-1 text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Role</Label>
                      <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                      <p className="mt-1 text-gray-900">
                        {user.createdAt?.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                      <p className="mt-1 text-gray-900">
                        {user.lastLoginAt?.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Ideas */}
          <TabsContent value="ideas">
            <Card>
              <CardHeader>
                <CardTitle>My Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                {myIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {myIdeas.map((idea) => (
                      <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{idea.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {idea.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge 
                              variant="outline"
                              className={idea.isPublic ? 'border-green-200 text-green-700' : 'border-gray-200 text-gray-600'}
                            >
                              {idea.isPublic ? 'Public' : 'Private'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {idea.voteCount} votes • {idea.commentCount} comments
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/ideas/${idea.id}`)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
                    <p className="text-gray-600 mb-4">Start by submitting your first idea!</p>
                    <Button onClick={() => router.push('/ideas/new')} className="bg-green-700 hover:bg-green-800">
                      Submit an Idea
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Idea Status Updates</h4>
                    <p className="text-sm text-gray-600">Get notified when your idea status changes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Comments</h4>
                    <p className="text-sm text-gray-600">Get notified of new comments on your ideas</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Digest</h4>
                    <p className="text-sm text-gray-600">Receive a weekly summary of portal activity</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
