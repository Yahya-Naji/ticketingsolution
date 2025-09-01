'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/ui/global-search';
import { Badge } from '@/components/ui/badge'; // Import Badge component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CredexLogo } from '@/components/ui/logo';
import { useAuthStore } from '@/lib/store';
import { signOut } from '@/lib/auth';

export const Header = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="border-b bg-white">
      <div className="w-full px-4 sm:px-6 lg:pl-8 lg:pr-2">
        <div className="flex items-center justify-between h-56 max-w-none">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 min-w-0">
            <Link href="/ideas">
              <CredexLogo />
              
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-6">
            <GlobalSearch />
          </div>

          {/* User Menu */}
          <div className="flex items-center flex-shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm font-medium">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    {user.role === 'admin' && (
                      <Badge className="absolute bottom-0 right-0 h-3 px-0.5 text-[0.5rem] bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white leading-none transform translate-x-1/3 translate-y-1/3">
                        Admin
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/review">
                          <Settings className="mr-2 h-4 w-4" />
                          Review Queue
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-green-700 hover:bg-green-800">
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};