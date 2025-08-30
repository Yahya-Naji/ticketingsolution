'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CredexLogo } from '@/components/ui/logo';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <CredexLogo />
          </div>
          
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Check your email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to your email address. Click the link to complete your registration.
              </p>
              <Button asChild variant="outline">
                <Link href="/login">Back to Sign In</Link>
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
              Sign up for Credex Systems Ideas Portal
            </h2>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-gray-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  {...register('email')}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="firstName" className="text-gray-700">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  {...register('firstName')}
                  className="mt-1"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="text-gray-700">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  {...register('lastName')}
                  className="mt-1"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p className="mb-4">
                You agree to our{' '}
                <Link href="/terms" className="text-green-700 hover:text-green-800">
                  Terms of service
                </Link>{' '}
                by using the ideas portal. The application may send you email updates on ideas you have submitted. You can opt-out from the emails at any time. Read our{' '}
                <Link href="/privacy" className="text-green-700 hover:text-green-800">
                  Privacy policy
                </Link>{' '}
                to learn more.
              </p>
              
              <p>
                Already registered?{' '}
                <Link href="/login" className="text-green-700 hover:text-green-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}