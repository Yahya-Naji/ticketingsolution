'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Plus, Filter, SortAsc, Calendar, TrendingUp, Clock, Heart } from 'lucide-react';
import { useAuthStore, useIdeasStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Idea } from '@/lib/types';

// Mock data for development/fallback (filtered to exclude 'wont_implement' for regular users)
const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Image file sending and receiving through Text messaging',
    description: 'Having the capabilities to send and receive an image file through credex text messaging. Mass texting and individual texting both.',
    authorId: 'user1',
    authorName: 'Jessica Dickinson',
    status: 'under_consideration',
    isPublic: true,
    isPinned: true,
    voteCount: 6,
    commentCount: 1,
    createdAt: new Date('2024-07-08'),
    updatedAt: new Date('2024-07-08'),
    lastStatusUpdate: new Date('2024-07-08'),
  },
  {
    id: '2',
    title: 'Test Calc Idea',
    description: 'Instead of having a test calc save as a print screen in the documents, create a button where you can automatically return to that saved test calc at a later time and continue from there eliminating having to put all the calculation figures in all over again.',
    authorId: 'user1',
    authorName: 'Jessica Dickinson',
    status: 'needs_review',
    isPublic: true,
    isPinned: false,
    voteCount: 4,
    commentCount: 0,
    createdAt: new Date('2024-07-08'),
    updatedAt: new Date('2024-07-08'),
    lastStatusUpdate: new Date('2024-07-08'),
  },
  {
    id: '3',
    title: 'Notify Customers of Software update',
    description: 'Send out an email to all of your customers of any changes you have made to software updates such as bug fixes or improvements.',
    authorId: 'user2',
    authorName: 'Scott Rains',
    status: 'planned',
    isPublic: true,
    isPinned: false,
    voteCount: 6,
    commentCount: 3,
    createdAt: new Date('2024-04-08'),
    updatedAt: new Date('2024-04-08'),
    lastStatusUpdate: new Date('2024-04-08'),
  },
  {
    id: '4',
    title: 'Dark Mode Support',
    description: 'Add dark mode theme support to the Unity interface for better user experience during nighttime usage.',
    authorId: 'user3',
    authorName: 'Alex Johnson',
    status: 'in_development',
    isPublic: true,
    isPinned: false,
    voteCount: 12,
    commentCount: 5,
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-15'),
    lastStatusUpdate: new Date('2024-06-15'),
  },
  {
    id: '5',
    title: 'Mobile App Integration',
    description: 'Create a mobile app companion that syncs with the desktop version for on-the-go access.',
    authorId: 'user4',
    authorName: 'Maria Garcia',
    status: 'completed',
    isPublic: true,
    isPinned: false,
    voteCount: 18,
    commentCount: 8,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
    lastStatusUpdate: new Date('2024-03-20'),
  },
  {
    id: '6',
    title: 'Advanced Search and Filtering',
    description: 'Implement advanced search functionality with filters for better content discovery and organization.',
    authorId: 'user5',
    authorName: 'Emma Watson',
    status: 'under_consideration',
    isPublic: true,
    isPinned: false,
    voteCount: 9,
    commentCount: 2,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01'),
    lastStatusUpdate: new Date('2024-08-01'),
  }
];

export default function IdeasPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { ideas, isLoading, fetchIdeas, voteOnIdea, setIdeas } = useIdeasStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [useFallback, setUseFallback] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'trending' | 'updated'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'needs_review' | 'under_consideration' | 'planned' | 'in_development' | 'completed'>('all');

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      fetchIdeas()
        .catch(error => {
          console.error('Failed to fetch ideas from Firebase:', error);
          console.log('Using mock data as fallback');
          // Filter mock data for regular users (remove wont_implement)
          const { isAdmin } = useAuthStore.getState();
          const filteredMockIdeas = isAdmin() 
            ? mockIdeas 
            : mockIdeas.filter(idea => idea.status !== 'wont_implement');
          setIdeas(filteredMockIdeas);
          setUseFallback(true);
        });
    }
  }, [isAuthenticated, user, router, fetchIdeas, authLoading, setIdeas]);

  // Use mock data immediately if ideas array is empty after loading
  useEffect(() => {
    if (!isLoading && ideas.length === 0 && user && !useFallback) {
      console.log('Loading complete but no ideas found, using mock data');
      // Filter mock data for regular users (remove wont_implement)
      const { isAdmin } = useAuthStore.getState();
      const filteredMockIdeas = isAdmin() 
        ? mockIdeas 
        : mockIdeas.filter(idea => idea.status !== 'wont_implement');
      setIdeas(filteredMockIdeas);
      setUseFallback(true);
    }
  }, [isLoading, ideas.length, user, setIdeas, useFallback]);

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

  // Filter and sort ideas
  const filteredAndSortedIdeas = React.useMemo(() => {
    let filtered = ideas;

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(idea => idea.status === filterBy);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.voteCount - a.voteCount;
        case 'trending':
          // Ideas with recent votes/activity (simplified)
          const aActivity = new Date(a.updatedAt).getTime() + (a.voteCount * 86400000); // 1 day per vote
          const bActivity = new Date(b.updatedAt).getTime() + (b.voteCount * 86400000);
          return bActivity - aActivity;
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [ideas, filterBy, sortBy]);

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'newest':
      case 'oldest':
        return <Clock className="w-4 h-4" />;
      case 'popular':
        return <Heart className="w-4 h-4" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'updated':
        return <Calendar className="w-4 h-4" />;
      default:
        return <SortAsc className="w-4 h-4" />;
    }
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'popular':
        return 'Most Popular';
      case 'trending':
        return 'Trending';
      case 'updated':
        return 'Recently Updated';
      default:
        return 'Sort';
    }
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
                    <strong>Development Mode:</strong> Using mock data. Configure Firebase environment variables to connect to real database.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              <div>
                <h2 className="text-lg font-semibold text-gray-900">All ideas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredAndSortedIdeas.length} {filteredAndSortedIdeas.length === 1 ? 'idea' : 'ideas'}
                  {filterBy !== 'all' && ` filtered by ${filterBy.replace('_', ' ')}`}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Filter Controls */}
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                        <SelectTrigger className="w-40 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="needs_review">Needs Review</SelectItem>
                          <SelectItem value="under_consideration">Under Consideration</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_development">In Development</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Sort Controls */}
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center space-x-2">
                      {getSortIcon(sortBy)}
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-40 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="trending">Trending</SelectItem>
                          <SelectItem value="updated">Recently Updated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
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

            {/* Filter Tags (Active Filters Display) */}
            {(filterBy !== 'all' || sortBy !== 'newest') && (
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filterBy !== 'all' && (
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => setFilterBy('all')}
                  >
                    {filterBy.replace('_', ' ')} ×
                  </Badge>
                )}
                {sortBy !== 'newest' && (
                  <Badge 
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setSortBy('newest')}
                  >
                    {getSortLabel(sortBy)} ×
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => {
                    setFilterBy('all');
                    setSortBy('newest');
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-6 grid-cols-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredAndSortedIdeas.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filterBy !== 'all' || sortBy !== 'newest' ? 'No ideas found' : 'No ideas yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filterBy !== 'all' || sortBy !== 'newest' 
                      ? 'Try adjusting your filters or clear all filters to see more ideas.'
                      : 'Be the first to submit an idea to the portal!'}
                  </p>
                  {filterBy === 'all' && sortBy === 'newest' ? (
                    <Button asChild className="bg-green-700 hover:bg-green-800">
                      <Link href="/ideas/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Submit First Idea
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setFilterBy('all');
                        setSortBy('newest');
                      }}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Ideas Grid */}
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredAndSortedIdeas.map((idea) => (
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