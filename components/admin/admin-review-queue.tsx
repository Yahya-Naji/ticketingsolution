'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminStore, useAuthStore } from '@/lib/store';
import { Idea } from '@/lib/types';
import { IdeaCard } from '@/components/ideas/idea-card';

export const AdminReviewQueue: React.FC = () => {
  const { user, isAdmin } = useAuthStore();
  const { 
    pendingReviews, 
    isLoading, 
    fetchPendingReviews,
    approveIdea,
    rejectIdea,
    bulkApprove,
    bulkReject
  } = useAdminStore();

  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'author'>('newest');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      fetchPendingReviews();
    }
  }, [isAdmin, fetchPendingReviews]);

  // Filter and sort ideas
  const filteredIdeas = pendingReviews
    .filter(idea => 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'author':
          return a.authorName.localeCompare(b.authorName);
        default:
          return 0;
      }
    });

  const handleSelectIdea = (ideaId: string, checked: boolean) => {
    if (checked) {
      setSelectedIdeas(prev => [...prev, ideaId]);
    } else {
      setSelectedIdeas(prev => prev.filter(id => id !== ideaId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIdeas(filteredIdeas.map(idea => idea.id));
    } else {
      setSelectedIdeas([]);
    }
  };

  const handleSingleApprove = async (ideaId: string) => {
    try {
      setIsProcessing(true);
      await approveIdea(ideaId);
    } catch (error) {
      console.error('Error approving idea:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleReject = async (ideaId: string) => {
    try {
      setIsProcessing(true);
      await rejectIdea(ideaId);
    } catch (error) {
      console.error('Error rejecting idea:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    try {
      setIsProcessing(true);
      await bulkApprove(selectedIdeas);
      setSelectedIdeas([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk approving ideas:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    try {
      setIsProcessing(true);
      await bulkReject(selectedIdeas);
      setSelectedIdeas([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk rejecting ideas:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAdmin()) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access the admin review queue.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
          <p className="text-gray-600">
            Review and manage submitted ideas waiting for approval.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {pendingReviews.length} pending
          </Badge>
          
          {selectedIdeas.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              Bulk Actions ({selectedIdeas.length})
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedIdeas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIdeas.length} ideas selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve All
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkReject}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject All
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedIdeas([]);
                    setShowBulkActions(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search ideas, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="author">By Author</SelectItem>
              </SelectContent>
            </Select>
            
            {filteredIdeas.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedIdeas.length === filteredIdeas.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ideas List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          <span className="ml-2 text-gray-600">Loading pending reviews...</span>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No matching ideas found' : 'No pending reviews'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Try adjusting your search terms.'
                : 'All submitted ideas have been reviewed.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <div key={idea.id} className="relative">
              {/* Selection checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <Checkbox
                  checked={selectedIdeas.includes(idea.id)}
                  onCheckedChange={(checked) => 
                    handleSelectIdea(idea.id, checked as boolean)
                  }
                />
              </div>
              
              {/* Idea card with admin actions */}
              <div className="ml-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <IdeaCard idea={idea} />
                  </div>
                  
                  {/* Quick action buttons */}
                  <div className="flex flex-col space-y-2 pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleSingleApprove(idea.id)}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleSingleReject(idea.id)}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={`/ideas/${idea.id}`} target="_blank">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
