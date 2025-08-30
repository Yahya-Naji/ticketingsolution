'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Lightbulb, 
  User, 
  Heart, 
  Pin,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore, useIdeasStore } from '@/lib/store';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, isAdmin } = useAuthStore();
  const { filters, updateFilters } = useIdeasStore();

  const navigationItems = [
    {
      name: 'All Ideas',
      href: '/ideas',
      icon: Lightbulb,
      count: 19,
    },
    {
      name: 'My Ideas',
      href: '/my-ideas',
      icon: User,
      count: 0,
    },
    {
      name: 'My Votes',
      href: '/my-votes',
      icon: Heart,
      count: 0,
    },
    {
      name: 'Pinned Ideas',
      href: '/pinned',
      icon: Pin,
      count: 1,
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...(isAdmin() ? [{ value: 'private', label: 'Private' }] : []),
    { value: 'needs_review', label: 'Needs Review' },
    { value: 'under_consideration', label: 'Under Consideration' },
    { value: 'planned', label: 'Planned' },
    { value: 'in_development', label: 'In Development' },
    { value: 'completed', label: 'Completed' },
    { value: 'wont_implement', label: "Won't Implement" },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recent', icon: Clock },
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'popular', label: 'Popular', icon: Star },
    { value: 'updated', label: 'Recently Updated', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-white border-r h-full">
      <div className="p-6">
        {/* Navigation */}
        <nav className="space-y-2 mb-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
              </Link>
            );
          })}
        </nav>

        {/* Add New Idea Button */}
        <Button asChild className="w-full bg-green-700 hover:bg-green-800 mb-6">
          <Link href="/ideas/new">
            <Plus className="w-4 h-4 mr-2" />
            ADD A NEW IDEA
          </Link>
        </Button>

        <Separator className="my-6" />

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Sort by
            </label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Filter by Status
            </label>
            <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value as any })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </aside>
  );
};