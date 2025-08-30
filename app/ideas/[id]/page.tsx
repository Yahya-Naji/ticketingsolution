'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  Home, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Plus,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/lib/store';

// Mock data
const mockIdea = {
  id: 'CRED-I-20',
  title: 'Image file sending and receiving through Text messaging',
  description: 'Having the capabilities to send and receive an image file through credex text messaging. Mass texting and individual texting both.',
  authorName: 'Jessica Dickinson',
  status: 'future_consideration',
  voteCount: 6,
  commentCount: 1,
  createdAt: new Date('2024-07-08'),
};

const mockComments = [
  {
    id: '1',
    authorName: 'Mariam Manana',
    role: 'ADMIN',
    content: 'Hello Jessica,\n\nThank you for the great idea! After reviewing your request, we\'ve added it to our programming backlog as a planned enhancement for the future release of the Credex software.\n\nWe truly appreciate your input.',
    createdAt: new Date('2024-07-17'),
  },
];

export default function IdeaDetailPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [isVoted, setIsVoted] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleVote = () => {
    setIsVoted(!isVoted);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Add comment logic here
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/ideas" className="flex items-center hover:text-green-700">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/ideas" className="hover:text-green-700">
            All ideas
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{mockIdea.id}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{mockIdea.voteCount}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVote}
                        className={`mt-1 ${isVoted ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                      >
                        VOTE
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {mockIdea.title}
                      </h1>
                      <p className="text-gray-600 leading-relaxed">
                        {mockIdea.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Comments Section */}
            <div className="mt-8">
              <div className="flex items-center space-x-6 mb-6 border-b">
                <Button variant="ghost" className="border-b-2 border-green-700 text-green-700 rounded-none pb-3">
                  COMMENTS 1
                </Button>
                <Button variant="ghost" className="text-gray-500 pb-3">
                  VOTES {mockIdea.voteCount}
                </Button>
              </div>

              {/* Add Comment */}
              {user && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Plus className="w-5 h-5 text-green-700 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-3">Add a comment</h3>
                        <Textarea
                          placeholder="Share your thoughts..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-3"
                        />
                        <Button 
                          onClick={handleAddComment}
                          className="bg-green-700 hover:bg-green-800"
                          disabled={!newComment.trim()}
                        >
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                            {getInitials(comment.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{comment.authorName}</span>
                            {comment.role === 'ADMIN' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ADMIN
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <div className="text-gray-700 whitespace-pre-line mb-3">
                            {comment.content}
                          </div>
                          <Button variant="ghost" size="sm" className="text-green-700 p-0 h-auto">
                            <Reply className="w-4 h-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <div className="mt-1">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Future consideration
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Created by</span>
                  <div className="mt-1 text-sm text-gray-900">{mockIdea.authorName}</div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Created on</span>
                  <div className="mt-1 text-sm text-gray-900">
                    {mockIdea.createdAt.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Ideas */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">RELATED IDEAS</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <Link href="#" className="block text-gray-600 hover:text-green-700">
                    Mass Text Messages to All Customers that have opted in.
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-green-700">
                    Text Message Response
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-green-700">
                    Welcome Credex Customers!
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-green-700">
                    Equifax - My Decision Now
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-green-700">
                    Solicitation File Extraction
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-green-700">
                    Text message alerts
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-green-700">
                    Multiple calculations with and without insurances.
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          Idea management by <span className="text-blue-600 font-medium">Aha!</span>
        </div>
      </div>
    </div>
  );
}