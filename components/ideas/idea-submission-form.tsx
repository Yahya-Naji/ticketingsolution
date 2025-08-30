'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Lightbulb, Send, AlertCircle } from 'lucide-react';
import { useIdeasStore, useAuthStore } from '@/lib/store';

interface IdeaSubmissionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { submitIdea } = useIdeasStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide both a title and description for your idea.');
      return;
    }

    if (formData.title.length < 10) {
      setError('Title must be at least 10 characters long.');
      return;
    }

    if (formData.description.length < 50) {
      setError('Description must be at least 50 characters long.');
      return;
    }

    if (!user) {
      setError('You must be logged in to submit an idea.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const ideaId = await submitIdea(formData.title, formData.description);
      
      // Reset form
      setFormData({ title: '', description: '' });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/ideas');
      }
    } catch (err) {
      console.error('Error submitting idea:', err);
      setError('Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-green-600" />
          <span>Submit a New Idea</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Share your feature suggestions for Unity software. Your idea will be reviewed by our team before being published.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">
              Idea Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a clear, descriptive title for your idea"
              value={formData.title}
              onChange={handleInputChange('title')}
              maxLength={100}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 characters (minimum 10)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of your idea. Include:&#10;• What problem does this solve?&#10;• How would this feature work?&#10;• Why would this be valuable?"
              value={formData.description}
              onChange={handleInputChange('description')}
              rows={8}
              maxLength={2000}
              className="w-full resize-none"
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/2000 characters (minimum 50)
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              What happens next?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your idea will be submitted as private initially</li>
              <li>• Our team will review and may make it public</li>
              <li>• Once public, other users can vote and comment</li>
              <li>• You'll be notified of status updates</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="bg-green-700 hover:bg-green-800"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Idea
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
