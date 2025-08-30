'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CredexLogo } from '@/components/ui/logo';
import { signIn } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      await signIn(data.email, data.password);
      router.push('/ideas');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <CredexLogo />
        </div>
        
        <Card>
          <CardHeader className="text-center pb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Sign in to Credex Systems Ideas Portal
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-green-700 hover:text-green-800">
                    Forgot password
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  {...register('password')}
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Log in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                I do not have an account yet.{' '}
                <Link href="/register" className="text-green-700 hover:text-green-800 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}