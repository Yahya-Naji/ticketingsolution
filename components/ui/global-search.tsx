'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, User, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIdeasStore } from '@/lib/store';
import { Idea } from '@/lib/types';
import Link from 'next/link';

interface SearchResult {
  type: 'idea' | 'user' | 'tag';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
}

export const GlobalSearch: React.FC = () => {
  const router = useRouter();
  const { ideas } = useIdeasStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search function
  const performSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    // Search ideas
    ideas.forEach(idea => {
      const titleMatch = idea.title.toLowerCase().includes(query);
      const descriptionMatch = idea.description.toLowerCase().includes(query);
      const authorMatch = idea.authorName.toLowerCase().includes(query);

      if (titleMatch || descriptionMatch || authorMatch) {
        searchResults.push({
          type: 'idea',
          id: idea.id,
          title: idea.title,
          subtitle: `by ${idea.authorName}`,
          url: `/ideas/${idea.id}`,
          badge: idea.status.replace('_', ' ')
        });
      }
    });

    // Search by author names (unique authors)
    const uniqueAuthors = new Set();
    ideas.forEach(idea => {
      if (idea.authorName.toLowerCase().includes(query) && !uniqueAuthors.has(idea.authorName)) {
        uniqueAuthors.add(idea.authorName);
        
        const authorIdeas = ideas.filter(i => i.authorName === idea.authorName);
        searchResults.push({
          type: 'user',
          id: `author-${idea.authorId}`,
          title: idea.authorName,
          subtitle: `${authorIdeas.length} ideas`,
          url: `/ideas?author=${encodeURIComponent(idea.authorName)}`
        });
      }
    });

    // Search by status/tags
    const statuses = ['needs_review', 'under_consideration', 'planned', 'in_development', 'completed'];
    statuses.forEach(status => {
      const statusLabel = status.replace('_', ' ');
      if (statusLabel.includes(query)) {
        const statusIdeas = ideas.filter(idea => idea.status === status);
        if (statusIdeas.length > 0) {
          searchResults.push({
            type: 'tag',
            id: `status-${status}`,
            title: `Status: ${statusLabel}`,
            subtitle: `${statusIdeas.length} ideas`,
            url: `/ideas?status=${status}`
          });
        }
      }
    });

    return searchResults.slice(0, 10); // Limit results
  }, [ideas]);

  // Update results when query changes
  useEffect(() => {
    const searchResults = performSearch(query);
    setResults(searchResults);
    setSelectedIndex(-1);
  }, [query, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(results[selectedIndex].url);
          setIsOpen(false);
          setQuery('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, router]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'idea':
        return <FileText className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search ideas, authors, status..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 w-full"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {results.length === 0 && query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? 'bg-green-50 border-l-2 border-green-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </p>
                          {result.badge && (
                            <Badge variant="outline" className="text-xs">
                              {result.badge}
                            </Badge>
                          )}
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search Tips */}
            {query.length === 0 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Search tips:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Type to search ideas, authors, or status</li>
                  <li>• Use ↑↓ arrows to navigate</li>
                  <li>• Press Enter to select</li>
                  <li>• Press Esc to close</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
