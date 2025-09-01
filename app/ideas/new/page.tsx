'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor'; // Import the new component
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/lib/store';
import { AuthDebug } from '@/components/debug/auth-debug';
import { ArrowLeft } from 'lucide-react';
import { Lightbulb } from 'lucide-react';
import { Paperclip } from 'lucide-react';

const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required'),
});

type IdeaForm = z.infer<typeof ideaSchema>;

export default function NewIdeaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<IdeaForm>({
    resolver: zodResolver(ideaSchema),
  });

  const description = watch('description', '');

  const onSubmit = async (data: IdeaForm) => {
    if (!user) {
      console.log('FRONTEND: No user found, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('FRONTEND: Starting direct Firestore submission');
    console.log('FRONTEND: User data:', { uid: user.uid, displayName: user.displayName, email: user.email });
    console.log('FRONTEND: Form data:', data);

    setIsLoading(true);
    setError('');

    try {
      // Write directly to Firestore (preserves auth context)
      const ideaData = {
        title: data.title,
        description: data.description,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonymous',
        status: 'private',
        isPublic: false,
        voteCount: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastStatusUpdate: serverTimestamp(),
      };

      console.log('FRONTEND: Creating idea with data:', ideaData);
      const docRef = await addDoc(collection(db, 'ideas'), ideaData);
      console.log('FRONTEND: Idea created successfully with ID:', docRef.id);

      // Send notification email via API (optional, won't block idea creation)
      try {
        console.log('FRONTEND: Sending email notification...');
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ideaId: docRef.id,
            title: data.title,
            description: data.description,
            authorName: user.displayName || user.email || 'Anonymous',
          }),
        });
        console.log('FRONTEND: Email notification sent successfully');
      } catch (emailError) {
        console.warn('FRONTEND: Email notification failed:', emailError);
        // Don't fail the whole operation if email fails
      }

                  console.log('FRONTEND: Redirecting to ideas list and refreshing...');
            // Refresh ideas list after successful creation
            router.push('/ideas');
            // Force a refresh of the ideas list
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
    } catch (error: any) {
      console.error('FRONTEND: Error submitting idea:', error);
      setError(error.message || 'Failed to create idea');
    } finally {
      setIsLoading(false);
      console.log('FRONTEND: Submission process completed');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to submit an idea
          </h1>
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/ideas" className="inline-flex items-center text-green-700 hover:text-green-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all ideas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2"></h1>
        
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Add Idea</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="title" className="text-gray-700">
                  Your idea <span className="text-xs text-muted-foreground">(Required)</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="One sentence summary of the idea"
                  {...register('title')}
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Similar Ideas Section */}
              <div className="border border-gray-200 bg-gray-50 rounded-md p-4 flex items-center justify-center text-center space-x-2">
                <Lightbulb className="h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-500">
                  Any similar ideas will appear here when you start typing. Consider
                  voting for them before you create a new idea.
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">
                  Please add more details
                </Label>
                <RichTextEditor
                  value={description}
                  onChange={value => {
                    if (value === '<p><br></p>') {
                      setValue('description', '');
                    } else {
                      setValue('description', value);
                    }
                  }}
                  placeholder="Why is it useful, who would benefit from it, how should it work?"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <Link href="#" className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm mb-6">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach files
              </Link>

             

              <div className="flex items-center justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding Idea...' : 'ADD IDEA'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <AuthDebug />
    </div>
  );
}