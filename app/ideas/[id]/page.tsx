'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  ArrowLeft, 
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Share2,
  Calendar,
  User,
  Pin
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore, useIdeasStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { Idea, Comment, IdeaStatus } from '@/lib/types';
import { toast } from 'sonner';

// Mock comments data
const mockComments: Comment[] = [
  {
    id: 'comment-1',
    content: 'This is a great idea! I think this would really improve the workflow for our team. We often struggle with managing image files in our current system.',
    authorId: 'user-comment-1',
    authorName: 'Sarah Johnson',
    parentId: null,
    createdAt: new Date('2024-08-20T10:30:00'),
    updatedAt: new Date('2024-08-20T10:30:00'),
    isDeleted: false,
  },
  {
    id: 'comment-2', 
    content: 'I agree with Sarah. Additionally, it would be helpful if we could also preview the images before sending.',
    authorId: 'user-comment-2',
    authorName: 'Mike Chen',
    parentId: 'comment-1',
    createdAt: new Date('2024-08-20T14:45:00'),
    updatedAt: new Date('2024-08-20T14:45:00'),
    isDeleted: false,
  },
  {
    id: 'comment-3',
    content: 'What about file size limitations? We should consider the impact on performance.',
    authorId: 'user-comment-3',
    authorName: 'Alex Rivera',
    parentId: null,
    createdAt: new Date('2024-08-21T09:15:00'),
    updatedAt: new Date('2024-08-21T09:15:00'),
    isDeleted: false,
  }
];

const statusColors: Record<IdeaStatus, string> = {
  'private': 'bg-gray-100 text-gray-800',
  'needs_review': 'bg-yellow-100 text-yellow-800',
  'under_consideration': 'bg-blue-100 text-blue-800',
  'planned': 'bg-purple-100 text-purple-800',
  'in_development': 'bg-orange-100 text-orange-800',
  'completed': 'bg-green-100 text-green-800',
  'wont_implement': 'bg-red-100 text-red-800',
};

const statusLabels: Record<IdeaStatus, string> = {
  'private': 'Private',
  'needs_review': 'Needs Review',
  'under_consideration': 'Under Consideration',
  'planned': 'Planned',
  'in_development': 'In Development',
  'completed': 'Completed',
  'wont_implement': "Won't Implement",
};

export default function IdeaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ideaId = params.id as string;
  
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const { ideas, voteOnIdea, unvoteIdea, checkUserVote, pinIdea, unpinIdea, deleteIdea } = useIdeasStore();
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Find idea from store or mock data
    const foundIdea = ideas.find(i => i.id === ideaId);
    if (foundIdea) {
      setIdea(foundIdea);
      setIsLoading(false);
      
      // Check if user has voted
      if (user) {
        checkUserVote(ideaId).then(voted => setHasVoted(voted));
      }
    } else {
      // If not found in store, try to load it (in real app this would fetch from Firebase)
      setIsLoading(false);
      toast.error('Idea not found');
      router.push('/ideas');
    }
  }, [ideaId, ideas, isAuthenticated, user, router, checkUserVote]);

  const handleVote = async () => {
    if (!user || !idea || isVoting) return;
    
    try {
      setIsVoting(true);
      if (hasVoted) {
        await unvoteIdea(idea.id);
        setHasVoted(false);
        // Update local idea vote count
        setIdea(prev => prev ? { ...prev, voteCount: prev.voteCount - 1 } : null);
        toast.success('Vote removed');
      } else {
        await voteOnIdea(idea.id);
        setHasVoted(true);
        // Update local idea vote count
        setIdea(prev => prev ? { ...prev, voteCount: prev.voteCount + 1 } : null);
        toast.success('Vote added');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || isCommenting) return;

    try {
      setIsCommenting(true);
      
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName,
        parentId: replyTo,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      setComments(prev => [...prev, comment]);
      setNewComment('');
      setReplyTo(null);
      
      // Update comment count
      if (idea) {
        setIdea(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      }
      
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo(commentId);
    setNewComment(`@${authorName} `);
  };

  const handlePin = async () => {
    if (!idea || !isAdmin()) return;

    try {
      if (idea.isPinned) {
        await unpinIdea(idea.id);
        setIdea(prev => prev ? { ...prev, isPinned: false } : null);
        toast.success('Idea unpinned');
      } else {
        await pinIdea(idea.id);
        setIdea(prev => prev ? { ...prev, isPinned: true } : null);
        toast.success('Idea pinned');
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
      toast.error('Failed to update pin status');
    }
  };

  const handleDeleteIdea = async () => {
    if (!idea || !isAdmin()) return;

    if (!window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteIdea(idea.id);
      toast.success('Idea deleted successfully');
      router.push('/ideas');
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const isOwnIdea = user?.uid === idea?.authorId;

  const getCommentsTree = () => {
    const topLevel = comments.filter(comment => !comment.parentId);
    const replies = comments.filter(comment => comment.parentId);
    
    return topLevel.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.parentId === comment.id)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h1>
            <Button onClick={() => router.push('/ideas')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ideas
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Idea Detail Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {idea.isPinned && (
                  <Pin className="w-4 h-4 text-green-600" />
                )}
                <Badge className={`text-xs ${statusColors[idea.status]}`}>
                  {statusLabels[idea.status]}
                </Badge>
                {!idea.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>
              
              {(isAdmin() || isOwnIdea) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwnIdea && (
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Idea
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    {!isOwnIdea && (
                      <DropdownMenuItem>
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                    {isAdmin() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handlePin}>
                          <Pin className="w-4 h-4 mr-2" />
                          {idea.isPinned ? 'Unpin Idea' : 'Pin Idea'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={handleDeleteIdea}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mt-4">
              {idea.title}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-gray-100">
                    {getInitials(idea.authorName)}
                  </AvatarFallback>
                </Avatar>
                <span>{idea.authorName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(idea.createdAt, { addSuffix: true })}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>
            
            <Separator className="my-6" />
            
            {/* Voting and Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleVote}
                  disabled={isVoting}
                  className={`flex items-center space-x-2 transition-colors ${
                    hasVoted 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart 
                    className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} 
                  />
                  <span className="font-medium">{idea.voteCount}</span>
                </Button>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{idea.commentCount} comments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
            <Card>
              <CardHeader>
            <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment Form */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="text-xs bg-green-100 text-green-700">
                    {user ? getInitials(user.displayName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      {replyTo && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setReplyTo(null);
                            setNewComment('');
                          }}
                        >
                          Cancel Reply
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewComment('')}
                        disabled={!newComment.trim()}
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isCommenting}
                        className="bg-green-700 hover:bg-green-800"
                        size="sm"
                      >
                        {isCommenting ? 'Posting...' : replyTo ? 'Reply' : 'Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
                      </div>

            <Separator />

              {/* Comments List */}
            <div className="space-y-6">
              {getCommentsTree().map((comment) => (
                <div key={comment.id} className="space-y-4">
                  {/* Main Comment */}
                      <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="text-xs bg-gray-100">
                            {getInitials(comment.authorName)}
                          </AvatarFallback>
                        </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                            {comment.content}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(comment.id, comment.authorName)}
                        className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                      >
                            Reply
                          </Button>
                        </div>
                      </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-3">
                          <Avatar className="h-7 w-7 mt-1">
                            <AvatarFallback className="text-xs bg-gray-100">
                              {getInitials(reply.authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">
                                {reply.authorName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                              </span>
              </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {reply.content}
                            </p>
            </div>
          </div>
                      ))}
                  </div>
                  )}
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              )}
                </div>
              </CardContent>
            </Card>
      </main>
    </div>
  );
}