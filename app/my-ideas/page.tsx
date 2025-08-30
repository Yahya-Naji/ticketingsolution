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

export default function MyIdeasPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { myIdeas, isLoading, fetchMyIdeas } = useIdeasStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      fetchMyIdeas().catch(error => {
        console.error('Failed to fetch my ideas:', error);
      });
    }
  }, [isAuthenticated, user, router, fetchMyIdeas, isLoading]);

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

