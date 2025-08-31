// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin';
  createdAt: Date;
  lastLoginAt: Date;
}

// Idea Types
export type IdeaStatus = 
  | 'private' 
  | 'needs_review' 
  | 'under_consideration' 
  | 'planned' 
  | 'in_development' 
  | 'completed' 
  | 'wont_implement';

export interface Idea {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  status: IdeaStatus;
  isPublic: boolean;
  isPinned?: boolean;
  voteCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastStatusUpdate: Date;
}

// Vote Types (subcollection under ideas)
export interface Vote {
  userId: string;
  createdAt: Date;
}

// Comment Types (subcollection under ideas)
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  parentId: string | null; // for threading
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// Status Types (for admin customization)
export interface Status {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
}

// Filter and Sort Types
export interface IdeaFilters {
  status: IdeaStatus | 'all';
  sortBy: 'recent' | 'trending' | 'popular' | 'updated';
  searchQuery: string;
  authorId?: string;
}

// Admin Types
export interface AdminStats {
  totalIdeas: number;
  pendingReviews: number;
  totalUsers: number;
  activeUsers: number;
  ideasByStatus: Record<IdeaStatus, number>;
}

// State Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface IdeasState {
  ideas: Idea[];
  myIdeas: Idea[];
  filters: IdeaFilters;
  isLoading: boolean;
  hasMore: boolean;
}

export interface AdminState {
  pendingReviews: Idea[];
  statistics: AdminStats | null;
  isLoading: boolean;
}

export interface EmailVerificationToken {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}