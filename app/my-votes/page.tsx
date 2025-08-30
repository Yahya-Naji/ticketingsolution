'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Button } from '@/components/ui/button';
import { Grid, List, Heart } from 'lucide-react';
import { useAuthStore, useIdeasStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { Idea } from '@/lib/types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MyVotesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { voteOnIdea, unvoteIdea } = useIdeasStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [votedIdeas, setVotedIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      fetchMyVotedIdeas();
    }
  }, [isAuthenticated, user, router]);

  const fetchMyVotedIdeas = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get all ideas that the user has voted on
      const allIdeasRef = collection(db, 'ideas');
      const allIdeasSnapshot = await getDocs(allIdeasRef);
      
      const votedIdeasList: Idea[] = [];
      
      for (const ideaDoc of allIdeasSnapshot.docs) {
        // Check if user has voted on this idea
        const voteRef = doc(db, 'ideas', ideaDoc.id, 'votes', user.uid);
        const voteDoc = await getDoc(voteRef);
        
        if (voteDoc.exists()) {
          const ideaData = ideaDoc.data();
          const idea: Idea = {
            id: ideaDoc.id,
            ...ideaData,
            createdAt: ideaData.createdAt?.toDate() || new Date(),
            updatedAt: ideaData.updatedAt?.toDate() || new Date(),
            lastStatusUpdate: ideaData.lastStatusUpdate?.toDate() || new Date(),
          } as Idea;
          
          // Only include public ideas or user's own private ideas
          if (idea.isPublic || idea.authorId === user.uid) {
            votedIdeasList.push(idea);
          }
        }
      }
      
      // Sort by vote date (most recent first)
      votedIdeasList.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      setVotedIdeas(votedIdeasList);
    } catch (error) {
      console.error('Error fetching voted ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (ideaId: string) => {
    try {
      await voteOnIdea(ideaId);
      // Don't need to refresh the list since this is votes page
    } catch (error) {
      console.error('Error voting on idea:', error);
    }
  };

  const handleUnvote = async (ideaId: string) => {
    try {
      await unvoteIdea(ideaId);
      // Remove from local state
      setVotedIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    } catch (error) {
      console.error('Error removing vote:', error);
    }
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Votes</h1>
              <p className="text-gray-600 mt-1">
                Ideas you've voted for
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : votedIdeas.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No votes yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't voted on any ideas yet. Browse ideas and vote for the ones you like!
                </p>
                <Button asChild className="bg-green-700 hover:bg-green-800">
                  <a href="/ideas">Browse Ideas</a>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Showing {votedIdeas.length} voted idea{votedIdeas.length !== 1 ? 's' : ''}
              </div>

              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {votedIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onVote={handleVote}
                    onUnvote={handleUnvote}
                    onStatusChange={handleStatusChange}
                    showVoteStatus={true}
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

