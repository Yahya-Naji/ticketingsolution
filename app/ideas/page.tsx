'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Plus } from 'lucide-react';
import { useAuthStore, useIdeasStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function IdeasPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { ideas, isLoading, fetchIdeas, voteOnIdea } = useIdeasStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      fetchIdeas().catch(error => {
        console.error('Failed to fetch ideas:', error);
      });
    }
  }, [isAuthenticated, user, router, fetchIdeas, isLoading]);

  const handleVote = async (ideaId: string) => {
    try {
      await voteOnIdea(ideaId);
    } catch (error) {
      console.error('Error voting on idea:', error);
    }
  };

  const handleStatusChange = (ideaId: string, status: string) => {
    console.log('Status change:', ideaId, status);
    // This would be handled by admin functions
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Pinned Ideas Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pinned ideas</h2>
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start space-x-3">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  📌 PINNED
                </Badge>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Welcome Credex Customers!
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Our Credex team is constantly striving to improve Unity to better serve our users. We would love to hear your thoughts on how we can enhance the user experience. Please share your innovative ideas and suggestions. Key Areas to Consider: Feature Im...
                  </p>
                  <div className="flex items-center justify-between">
                    <Button variant="link" className="text-green-700 p-0 h-auto">
                      Share feedback
                    </Button>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>💬 0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* All Ideas Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">All ideas</h2>
              
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
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : ideas.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No ideas yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to submit an idea to the portal!
                  </p>
                  <Button asChild className="bg-green-700 hover:bg-green-800">
                    <Link href="/ideas/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit First Idea
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500 mb-4">
                  Showing {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
                </div>

                {/* Ideas Grid */}
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {ideas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onVote={handleVote}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}