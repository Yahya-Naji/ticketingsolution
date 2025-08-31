'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Pin } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { Idea } from '@/lib/types';

// Mock pinned idea for now - in production this would come from Firebase
const mockPinnedIdea: Idea = {
  id: 'pinned-1',
  title: 'Welcome Credex Customers!',
  description: 'Our Credex team is constantly striving to improve Unity to better serve our users. We would love to hear your thoughts on how we can enhance the user experience. Please share your innovative ideas and suggestions. Key Areas to Consider: Feature Improvements, User Interface Enhancements, Performance Optimizations, Integration Capabilities, Mobile Experience, Reporting and Analytics, Security Features, Training and Support Resources.',
  authorId: 'system',
  authorName: 'Credex Team',
  status: 'pinned' as any,
  isPublic: true,
  voteCount: 0,
  commentCount: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastStatusUpdate: new Date('2024-01-01'),
};

export default function PinnedIdeasPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [pinnedIdeas] = useState<Idea[]>([mockPinnedIdea]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      // Simulate loading time
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [isAuthenticated, user, router, isLoading]);

  const handleVote = async (ideaId: string) => {
    // Pinned ideas typically don't have voting, but keeping for consistency
    console.log('Vote on pinned idea:', ideaId);
  };

  const handleStatusChange = (ideaId: string, status: string) => {
    // Handle status change if user is admin
    console.log('Status change:', ideaId, status);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pinned Ideas</h1>
              <p className="text-gray-600 mt-1">
                Important announcements and featured ideas
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 grid-cols-1">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : pinnedIdeas.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Pin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pinned ideas
                </h3>
                <p className="text-gray-600 mb-6">
                  There are currently no pinned ideas or announcements.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Showing {pinnedIdeas.length} pinned item{pinnedIdeas.length !== 1 ? 's' : ''}
              </div>

              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {pinnedIdeas.map((idea) => (
                  <div key={idea.id} className="bg-white rounded-lg border border-green-200 p-6 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        📌 PINNED
                      </Badge>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {idea.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {idea.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            by {idea.authorName}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>💬 {idea.commentCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}


