'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore, useIdeasStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { Idea } from '@/lib/types';

// Mock ideas for current user (development fallback)
const mockMyIdeas: Idea[] = [
  {
    id: 'my-1',
    title: 'Integration with Third-party APIs',
    description: 'Add support for popular third-party service integrations like Zapier, Microsoft Power Automate, and IFTTT to automate workflows.',
    authorId: 'current-user',
    authorName: 'Current User',
    status: 'private',
    isPublic: false,
    voteCount: 0,
    commentCount: 0,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15'),
    lastStatusUpdate: new Date('2024-08-15'),
  },
  {
    id: 'my-2',
    title: 'Advanced Reporting Dashboard',
    description: 'Create comprehensive reporting dashboards with customizable widgets, charts, and export capabilities for better business intelligence.',
    authorId: 'current-user',
    authorName: 'Current User',
    status: 'needs_review',
    isPublic: true,
    voteCount: 3,
    commentCount: 1,
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-10'),
    lastStatusUpdate: new Date('2024-08-10'),
  }
];

export default function MyIdeasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { myIdeas, isLoading, fetchMyIdeas, setMyIdeas } = useIdeasStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      fetchMyIdeas()
        .then(() => {
          // If Firebase returns no ideas, use mock data as fallback
          if (myIdeas.length === 0) {
            console.log('No my ideas from Firebase, using mock data');
            setMyIdeas(mockMyIdeas);
            setUseFallback(true);
          }
        })
        .catch(error => {
          console.error('Failed to fetch my ideas from Firebase:', error);
          console.log('Using mock data as fallback');
          // Filter mock data for regular users (remove wont_implement) 
          const { isAdmin } = useAuthStore.getState();
          const filteredMockIdeas = isAdmin() 
            ? mockMyIdeas 
            : mockMyIdeas.filter(idea => idea.status !== 'wont_implement');
          setMyIdeas(filteredMockIdeas);
          setUseFallback(true);
        });
    }
  }, [isAuthenticated, user, router, fetchMyIdeas, authLoading]);

  // Use mock data immediately if ideas array is empty after loading
  useEffect(() => {
    if (!isLoading && myIdeas.length === 0 && user && !useFallback) {
      console.log('Loading complete but no my ideas found, using mock data');
      // Filter mock data for regular users (remove wont_implement) 
      const { isAdmin } = useAuthStore.getState();
      const filteredMockIdeas = isAdmin() 
        ? mockMyIdeas 
        : mockMyIdeas.filter(idea => idea.status !== 'wont_implement');
      setMyIdeas(filteredMockIdeas);
      setUseFallback(true);
    }
  }, [isLoading, myIdeas.length, user, setMyIdeas, useFallback]);

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
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleVote = async (ideaId: string) => {
    // This shouldn't happen on my ideas page, but keeping for consistency
    console.log('Vote on idea:', ideaId);
  };

  const handleStatusChange = (ideaId: string, status: string) => {
    // Handle status change if user is admin
    console.log('Status change:', ideaId, status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
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
                    <strong>Development Mode:</strong> Using mock data for your ideas.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
              <p className="text-gray-600 mt-1">
                Ideas you've submitted to the portal
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button asChild className="bg-green-700 hover:bg-green-800">
                <Link href="/ideas/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Idea
                </Link>
              </Button>
              
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : myIdeas.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No ideas yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any ideas yet. Start by creating your first idea!
                </p>
                <Button asChild className="bg-green-700 hover:bg-green-800">
                  <Link href="/ideas/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Idea
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Showing {myIdeas.length} idea{myIdeas.length !== 1 ? 's' : ''}
              </div>

              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {myIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onVote={handleVote}
                    onStatusChange={handleStatusChange}
                    showOwnerActions={true}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

