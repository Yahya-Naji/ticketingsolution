'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Pin, 
  Eye, 
  EyeOff,
  Trash2,
  Edit,
  CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Idea, IdeaStatus } from '@/lib/types';
import { useAuthStore, useIdeasStore } from '@/lib/store';

interface IdeaCardProps {
  idea: Idea;
  showAdminActions?: boolean;
  showOwnerActions?: boolean;
  showVoteStatus?: boolean;
  onVote?: (ideaId: string) => void;
  onUnvote?: (ideaId: string) => void;
  onStatusChange?: (ideaId: string, status: string) => void;
  onDelete?: (ideaId: string) => void;
}

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

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  showAdminActions = false,
  showOwnerActions = false,
  showVoteStatus = false,
  onVote,
  onUnvote,
  onStatusChange,
  onDelete 
}) => {
  const { user, isAdmin } = useAuthStore();
  const { voteOnIdea, unvoteIdea, checkUserVote } = useIdeasStore();
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const loadVoteStatus = async () => {
      if (user) {
        const voted = await checkUserVote(idea.id);
        setHasVoted(voted);
      }
    };
    loadVoteStatus();
  }, [user, idea.id, checkUserVote]);

  const handleVote = async () => {
    if (!user || isVoting) return;
    
    try {
      setIsVoting(true);
      if (hasVoted) {
        // Use custom unvote handler if provided, otherwise use default
        if (onUnvote) {
          onUnvote(idea.id);
        } else {
          await unvoteIdea(idea.id);
        }
        setHasVoted(false);
      } else {
        // Use custom vote handler if provided, otherwise use default
        if (onVote) {
          onVote(idea.id);
        } else {
          await voteOnIdea(idea.id);
        }
        setHasVoted(true);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isOwnIdea = user?.uid === idea.authorId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {!idea.isPublic && (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
            <Badge 
              className={`text-xs ${statusColors[idea.status] || 'bg-gray-100 text-gray-800'}`}
            >
              {statusLabels[idea.status] || idea.status}
            </Badge>
          </div>
          
          {(isAdmin() || isOwnIdea) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnIdea && idea.status === 'private' && (
                  <DropdownMenuItem asChild>
                    <Link href={`/ideas/edit/${idea.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Idea
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {isAdmin() && (
                  <>
                    <DropdownMenuItem>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {idea.isPublic ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Make Public
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDelete?.(idea.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Idea
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <Link href={`/ideas/${idea.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-green-700 transition-colors">
            {idea.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {truncateDescription(idea.description)}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-100">
                  {getInitials(idea.authorName)}
                </AvatarFallback>
              </Avatar>
              <span>{idea.authorName}</span>
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(idea.createdAt, { addSuffix: true })}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className={`flex items-center space-x-1 transition-colors ${
                hasVoted 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart 
                className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} 
              />
              <span>{idea.voteCount}</span>
            </Button>
            
            <Link href={`/ideas/${idea.id}#comments`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                <span>{idea.commentCount}</span>
              </Button>
            </Link>
          </div>
          
          {idea.status === 'completed' && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};