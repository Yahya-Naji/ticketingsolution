'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Lightbulb, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuthStore, useAdminStore } from '@/lib/store';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const { statistics, pendingReviews, fetchPendingReviews, fetchStatistics } = useAdminStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin()) {
      router.push('/ideas');
      return;
    }

    // Load admin data
    fetchPendingReviews().catch(console.error);
    fetchStatistics().catch(console.error);
  }, [user, isAdmin, router, fetchPendingReviews, fetchStatistics]);

  if (!user || !isAdmin()) {
    return null;
  }

  const statsData = [
    {
      title: 'Pending Reviews',
      value: pendingReviews.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Ideas waiting for approval'
    },
    {
      title: 'Total Ideas',
      value: statistics?.totalIdeas || 0,
      icon: Lightbulb,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All submitted ideas'
    },
    {
      title: 'Total Users',
      value: statistics?.totalUsers || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Registered users'
    },
    {
      title: 'Completed Ideas',
      value: statistics?.ideasByStatus?.completed || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Successfully implemented'
    }
  ];

  const quickActions = [
    {
      title: 'Review Queue',
      description: 'Review and approve pending ideas',
      href: '/admin/review',
      icon: Eye,
      badge: pendingReviews.length > 0 ? pendingReviews.length : null
    },
    {
      title: 'All Ideas',
      description: 'View and manage all ideas',
      href: '/ideas',
      icon: Lightbulb,
      badge: null
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      href: '#',
      icon: BarChart3,
      badge: null
    },
    {
      title: 'Settings',
      description: 'Admin panel settings',
      href: '/admin/settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user.displayName}. Here's what's happening with your Ideas Portal.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor} mr-3`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {action.badge && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {action.badge}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={() => router.push(action.href)}>
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.slice(0, 5).map((idea) => (
                  <div key={idea.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {idea.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Submitted by {idea.authorName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  </div>
                ))}
                
                {pendingReviews.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No pending reviews
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ideas by Status */}
        {statistics?.ideasByStatus && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ideas by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Object.entries(statistics.ideasByStatus).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-600 capitalize">
                      {status.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
