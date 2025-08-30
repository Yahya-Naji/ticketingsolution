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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/lib/store';
import { AuthDebug } from '@/components/debug/auth-debug';

const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a New Idea</h1>
          <p className="text-gray-600">
            Share your innovative ideas and suggestions to help improve Unity software.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Idea Details</h2>
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
                  Idea Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter a clear, descriptive title for your idea"
                  {...register('title')}
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your idea in detail. What problem does it solve? How would it work? What benefits would it provide?"
                  {...register('description')}
                  className="mt-1 min-h-[120px]"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-red-600 text-sm">{errors.description.message}</p>
                  )}
                  <span className="text-sm text-gray-500 ml-auto">
                    {description.length}/1000
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your idea will be submitted as private and reviewed by our team</li>
                  <li>• We&apos;ll send a notification to our development team</li>
                  <li>• Once approved, your idea will be visible to other users</li>
                  <li>• You&apos;ll receive updates on the status of your idea</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" asChild>
                  <Link href="/ideas">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Idea'}
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