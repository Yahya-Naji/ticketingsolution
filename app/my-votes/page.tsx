'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

// Mock voted ideas for development
const mockVotedIdeas: Idea[] = [
  {
    id: 'voted-1',
    title: 'Email Template Customization',
    description: 'Allow users to create and customize email templates for different types of communications with clients and prospects.',
    authorId: 'other-user',
    authorName: 'Sarah Wilson',
    status: 'under_consideration',
    isPublic: true,
    voteCount: 8,
    commentCount: 2,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-20'),
    lastStatusUpdate: new Date('2024-07-20'),
  },
  {
    id: 'voted-2',
    title: 'Calendar Integration',
    description: 'Integrate with popular calendar applications like Google Calendar, Outlook, and Apple Calendar for better scheduling.',
    authorId: 'another-user',
    authorName: 'Mike Chen',
    status: 'planned',
    isPublic: true,
    voteCount: 15,
    commentCount: 6,
    createdAt: new Date('2024-06-30'),
    updatedAt: new Date('2024-06-30'),
    lastStatusUpdate: new Date('2024-06-30'),
  }
];

export default function MyVotesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { voteOnIdea, unvoteIdea } = useIdeasStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [votedIdeas, setVotedIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  const fetchMyVotedIdeas = useCallback(async () => {
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
      
      // Use mock data if no voted ideas found or if Firebase fails
      if (votedIdeasList.length === 0) {
        console.log('No voted ideas from Firebase, using mock data');
        // Filter mock data for regular users (remove wont_implement)
        const { isAdmin } = useAuthStore.getState();
        const filteredMockIdeas = isAdmin() 
          ? mockVotedIdeas 
          : mockVotedIdeas.filter(idea => idea.status !== 'wont_implement');
        setVotedIdeas(filteredMockIdeas);
        setUseFallback(true);
      } else {
        setVotedIdeas(votedIdeasList);
      }
    } catch (error) {
      console.error('Error fetching voted ideas from Firebase:', error);
      console.log('Using mock data as fallback');
      // Filter mock data for regular users (remove wont_implement)
      const { isAdmin } = useAuthStore.getState();
      const filteredMockIdeas = isAdmin() 
        ? mockVotedIdeas 
        : mockVotedIdeas.filter(idea => idea.status !== 'wont_implement');
      setVotedIdeas(filteredMockIdeas);
      setUseFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      fetchMyVotedIdeas();
    }
  }, [isAuthenticated, user, router, authLoading, fetchMyVotedIdeas]);

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
                    <strong>Development Mode:</strong> Using mock data for voted ideas.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Votes</h1>
              <p className="text-gray-600 mt-1">
                Ideas you&apos;ve voted for
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
                    You haven&apos;t voted on any ideas yet. Browse ideas and vote for the ones you like!
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


