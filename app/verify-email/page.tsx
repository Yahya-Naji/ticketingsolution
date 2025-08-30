'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CredexLogo } from '@/components/ui/logo';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/auth';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenData, setTokenData] = useState<any>(null);
  const [verifying, setVerifying] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid verification link');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error('Invalid or expired verification link');
        }

        const data = await response.json();
        setTokenData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: PasswordForm) => {
    if (!tokenData) return;

    setIsLoading(true);
    setError('');

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        tokenData.email,
        data.password
      );

      // Create user profile in Firestore
      await createUserProfile(
        userCredential.user.uid,
        tokenData.email,
        tokenData.firstName,
        tokenData.lastName
      );

      // Mark token as used
      await fetch('/api/verify-token', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      router.push('/ideas');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <CredexLogo />
          </div>
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">Verifying your email...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <CredexLogo />
          </div>
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Verification Failed
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <Button asChild variant="outline">
                <Link href="/register">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <CredexLogo />
        </div>
        
        <Card>
          <CardHeader className="text-center pb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Complete Your Registration
            </h2>
            <p className="text-gray-600">
              Welcome {tokenData?.firstName}! Please set your password to complete your account setup.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className="mt-1"
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}