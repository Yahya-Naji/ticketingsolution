'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useIdeasStore } from '@/lib/store';

interface VoteButtonProps {
  ideaId: string;
  voteCount: number;
  className?: string;
  showCount?: boolean;
}

export const VoteButton: React.FC<VoteButtonProps> = ({ 
  ideaId, 
  voteCount, 
  className = '',
  showCount = true 
}) => {
  const { user } = useAuthStore();
  const { voteOnIdea, unvoteIdea, checkUserVote } = useIdeasStore();
  
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(voteCount);

  useEffect(() => {
    const loadVoteStatus = async () => {
      if (user) {
        try {
          const voted = await checkUserVote(ideaId);
          setHasVoted(voted);
        } catch (error) {
          console.error('Error checking vote status:', error);
        }
      }
    };
    
    loadVoteStatus();
  }, [user, ideaId, checkUserVote]);

  // Update optimistic count when props change
  useEffect(() => {
    setOptimisticCount(voteCount);
  }, [voteCount]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (hasVoted) {
        // Optimistic update for unvoting
        setHasVoted(false);
        setOptimisticCount(prev => Math.max(0, prev - 1));
        await unvoteIdea(ideaId);
      } else {
        // Optimistic update for voting
        setHasVoted(true);
        setOptimisticCount(prev => prev + 1);
        await voteOnIdea(ideaId);
      }
    } catch (error) {
      console.error('Error voting:', error);
      
      // Revert optimistic update on error
      setHasVoted(!hasVoted);
      setOptimisticCount(voteCount);
      
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className={`flex items-center space-x-1 text-gray-400 ${className}`}
      >
        <Heart className="w-4 h-4" />
        {showCount && <span>{voteCount}</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
      className={`
        flex items-center space-x-1 transition-all duration-200
        ${hasVoted 
          ? 'text-red-600 hover:text-red-700' 
          : 'text-gray-600 hover:text-red-600'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <Heart 
        className={`w-4 h-4 transition-all duration-200 ${
          hasVoted ? 'fill-current scale-110' : ''
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
      {showCount && (
        <span className={`
          transition-all duration-200 
          ${hasVoted ? 'font-medium' : ''}
        `}>
          {optimisticCount}
        </span>
      )}
    </Button>
  );
};
