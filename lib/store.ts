import { create } from 'zustand';
import { 
  User, 
  Idea, 
  IdeaFilters, 
  AuthState, 
  IdeasState, 
  AdminState,
  IdeaStatus,
  Comment,
  AdminStats
} from './types';
import { 
  signIn as firebaseSignIn, 
  signOut as firebaseSignOut, 
  getUserData,
  createUserProfile 
} from './auth';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Authentication Store
interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkRole: () => 'client' | 'admin' | null;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const firebaseUser = await firebaseSignIn(email, password);
      const userData = await getUserData(firebaseUser.uid);
      set({ 
        user: userData, 
        isAuthenticated: !!userData, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      throw error;
    }
  },

  setUser: (user: User | null) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  checkRole: () => {
    const { user } = get();
    return user?.role || null;
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin';
  }
}));

// Ideas Store
interface IdeasStore extends IdeasState {
  // Core CRUD operations
  fetchIdeas: () => Promise<void>;
  fetchMyIdeas: () => Promise<void>;
  submitIdea: (title: string, description: string) => Promise<string>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  
  // Voting system
  voteOnIdea: (ideaId: string) => Promise<void>;
  unvoteIdea: (ideaId: string) => Promise<void>;
  checkUserVote: (ideaId: string) => Promise<boolean>;
  
  // Filtering and search
  updateFilters: (filters: Partial<IdeaFilters>) => void;
  searchIdeas: (query: string) => Promise<void>;
  
  // State management
  setIdeas: (ideas: Idea[]) => void;
  setMyIdeas: (ideas: Idea[]) => void;
  setLoading: (loading: boolean) => void;
  addIdea: (idea: Idea) => void;
  updateIdeaInList: (id: string, updates: Partial<Idea>) => void;
  removeIdeaFromList: (id: string) => void;
}

export const useIdeasStore = create<IdeasStore>((set, get) => ({
  ideas: [],
  myIdeas: [],
  filters: {
    status: 'all',
    sortBy: 'recent',
    searchQuery: '',
  },
  isLoading: false,
  hasMore: true,

  fetchIdeas: async () => {
    try {
      set({ isLoading: true });
      const { filters } = get();
      const { user, isAdmin } = useAuthStore.getState();
      
      if (!user) {
        set({ ideas: [], isLoading: false });
        return;
      }
      
      let allIdeas: Idea[] = [];
      
      if (isAdmin()) {
        // Admins see ALL ideas (public and private)
        let q = query(collection(db, 'ideas'));
        
        // Apply filters
        if (filters.status !== 'all') {
          q = query(q, where('status', '==', filters.status));
        }
        
        // Apply sorting
        switch (filters.sortBy) {
          case 'recent':
            q = query(q, orderBy('createdAt', 'desc'));
            break;
          case 'trending':
            q = query(q, orderBy('voteCount', 'desc'), orderBy('createdAt', 'desc'));
            break;
          case 'popular':
            q = query(q, orderBy('voteCount', 'desc'));
            break;
          case 'updated':
            q = query(q, orderBy('updatedAt', 'desc'));
            break;
        }
        
        q = query(q, limit(20));
        const snapshot = await getDocs(q);
        allIdeas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          lastStatusUpdate: doc.data().lastStatusUpdate?.toDate() || new Date(),
        })) as Idea[];
      } else {
        // Regular users see: public ideas + their own private ideas
        
        // Query 1: Get all public ideas
        let publicQuery = query(collection(db, 'ideas'), where('isPublic', '==', true));
        
        // Apply filters to public ideas
        if (filters.status !== 'all') {
          publicQuery = query(publicQuery, where('status', '==', filters.status));
        }
        
        // Query 2: Get user's own ideas (including private ones)
        let userQuery = query(collection(db, 'ideas'), where('authorId', '==', user.uid));
        
        // Apply filters to user's ideas
        if (filters.status !== 'all') {
          userQuery = query(userQuery, where('status', '==', filters.status));
        }
        
        // Execute both queries
        const [publicSnapshot, userSnapshot] = await Promise.all([
          getDocs(publicQuery),
          getDocs(userQuery)
        ]);
        
        // Combine results, avoiding duplicates
        const publicIdeas = publicSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          lastStatusUpdate: doc.data().lastStatusUpdate?.toDate() || new Date(),
        })) as Idea[];
        
        const userIdeas = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          lastStatusUpdate: doc.data().lastStatusUpdate?.toDate() || new Date(),
        })) as Idea[];
        
        // Merge and deduplicate
        const ideaMap = new Map();
        [...publicIdeas, ...userIdeas].forEach(idea => {
          ideaMap.set(idea.id, idea);
        });
        allIdeas = Array.from(ideaMap.values());
        
        // Apply sorting to combined results
        switch (filters.sortBy) {
          case 'recent':
            allIdeas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            break;
          case 'trending':
            allIdeas.sort((a, b) => {
              if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
              return b.createdAt.getTime() - a.createdAt.getTime();
            });
            break;
          case 'popular':
            allIdeas.sort((a, b) => b.voteCount - a.voteCount);
            break;
          case 'updated':
            allIdeas.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
            break;
        }
        
        // Limit results
        allIdeas = allIdeas.slice(0, 20);
      }
      
      set({ ideas: allIdeas, isLoading: false });
    } catch (error) {
      console.error('Error fetching ideas:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMyIdeas: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      set({ isLoading: true });
      
      const q = query(
        collection(db, 'ideas'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const myIdeas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastStatusUpdate: doc.data().lastStatusUpdate?.toDate() || new Date(),
      })) as Idea[];
      
      set({ myIdeas, isLoading: false });
    } catch (error) {
      console.error('Error fetching my ideas:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  submitIdea: async (title: string, description: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const ideaData = {
        title,
        description,
        authorId: user.uid,
        authorName: user.displayName,
        status: 'private' as IdeaStatus,
        isPublic: false,
        voteCount: 0,
        commentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastStatusUpdate: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'ideas'), ideaData);
      
      // Add to local state
      const newIdea: Idea = {
        id: docRef.id,
        ...ideaData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStatusUpdate: new Date(),
      };
      
      get().addIdea(newIdea);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting idea:', error);
      throw error;
    }
  },

  updateIdea: async (id: string, updates: Partial<Idea>) => {
    try {
      const docRef = doc(db, 'ideas', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      get().updateIdeaInList(id, updates);
    } catch (error) {
      console.error('Error updating idea:', error);
      throw error;
    }
  },

  deleteIdea: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ideas', id));
      get().removeIdeaFromList(id);
    } catch (error) {
      console.error('Error deleting idea:', error);
      throw error;
    }
  },

  voteOnIdea: async (ideaId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const batch = writeBatch(db);
      
      // Add vote to subcollection
      const voteRef = doc(collection(db, 'ideas', ideaId, 'votes'), user.uid);
      batch.set(voteRef, {
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      // Update vote count on idea
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);
      const currentVoteCount = ideaDoc.data()?.voteCount || 0;
      
      batch.update(ideaRef, {
        voteCount: currentVoteCount + 1,
        updatedAt: serverTimestamp(),
      });
      
      await batch.commit();
      
      // Update local state
      get().updateIdeaInList(ideaId, { 
        voteCount: currentVoteCount + 1 
      });
    } catch (error) {
      console.error('Error voting on idea:', error);
      throw error;
    }
  },

  unvoteIdea: async (ideaId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const batch = writeBatch(db);
      
      // Remove vote from subcollection
      const voteRef = doc(db, 'ideas', ideaId, 'votes', user.uid);
      batch.delete(voteRef);
      
      // Update vote count on idea
      const ideaRef = doc(db, 'ideas', ideaId);
      const ideaDoc = await getDoc(ideaRef);
      const currentVoteCount = ideaDoc.data()?.voteCount || 0;
      
      batch.update(ideaRef, {
        voteCount: Math.max(0, currentVoteCount - 1),
        updatedAt: serverTimestamp(),
      });
      
      await batch.commit();
      
      // Update local state
      get().updateIdeaInList(ideaId, { 
        voteCount: Math.max(0, currentVoteCount - 1) 
      });
    } catch (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
  },

  checkUserVote: async (ideaId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return false;
      
      const voteRef = doc(db, 'ideas', ideaId, 'votes', user.uid);
      const voteDoc = await getDoc(voteRef);
      return voteDoc.exists();
    } catch (error) {
      console.error('Error checking user vote:', error);
      return false;
    }
  },

  searchIdeas: async (query: string) => {
    // This would ideally use Algolia or similar for full-text search
    // For now, we'll filter client-side
    const { ideas } = get();
    const filteredIdeas = ideas.filter(idea =>
      idea.title.toLowerCase().includes(query.toLowerCase()) ||
      idea.description.toLowerCase().includes(query.toLowerCase())
    );
    set({ ideas: filteredIdeas });
  },

  updateFilters: (filters: Partial<IdeaFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  setIdeas: (ideas: Idea[]) => set({ ideas }),
  setMyIdeas: (myIdeas: Idea[]) => set({ myIdeas }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  addIdea: (idea: Idea) => set(state => ({
    ideas: [idea, ...state.ideas],
    myIdeas: idea.authorId === useAuthStore.getState().user?.uid 
      ? [idea, ...state.myIdeas] 
      : state.myIdeas
  })),
  
  updateIdeaInList: (id: string, updates: Partial<Idea>) => set(state => ({
    ideas: state.ideas.map(idea => 
      idea.id === id ? { ...idea, ...updates } : idea
    ),
    myIdeas: state.myIdeas.map(idea => 
      idea.id === id ? { ...idea, ...updates } : idea
    )
  })),
  
  removeIdeaFromList: (id: string) => set(state => ({
    ideas: state.ideas.filter(idea => idea.id !== id),
    myIdeas: state.myIdeas.filter(idea => idea.id !== id)
  }))
}));

// Admin Store
interface AdminStore extends AdminState {
  fetchPendingReviews: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  approveIdea: (ideaId: string) => Promise<void>;
  rejectIdea: (ideaId: string) => Promise<void>;
  updateIdeaStatus: (ideaId: string, status: IdeaStatus) => Promise<void>;
  bulkApprove: (ideaIds: string[]) => Promise<void>;
  bulkReject: (ideaIds: string[]) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  pendingReviews: [],
  statistics: null,
  isLoading: false,

  fetchPendingReviews: async () => {
    try {
      set({ isLoading: true });
      
      const q = query(
        collection(db, 'ideas'),
        where('status', '==', 'private'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const pendingReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastStatusUpdate: doc.data().lastStatusUpdate?.toDate() || new Date(),
      })) as Idea[];
      
      set({ pendingReviews, isLoading: false });
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchStatistics: async () => {
    try {
      // This would typically be done with Cloud Functions for better performance
      const ideasSnapshot = await getDocs(collection(db, 'ideas'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const ideas = ideasSnapshot.docs.map(doc => doc.data()) as Idea[];
      const ideasByStatus = ideas.reduce((acc, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {} as Record<IdeaStatus, number>);
      
      const statistics: AdminStats = {
        totalIdeas: ideas.length,
        pendingReviews: ideas.filter(idea => idea.status === 'private').length,
        totalUsers: usersSnapshot.docs.length,
        activeUsers: usersSnapshot.docs.length, // Would calculate based on recent activity
        ideasByStatus,
      };
      
      set({ statistics });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  approveIdea: async (ideaId: string) => {
    try {
      await get().updateIdeaStatus(ideaId, 'needs_review');
      
      const ideaRef = doc(db, 'ideas', ideaId);
      await updateDoc(ideaRef, {
        isPublic: true,
        lastStatusUpdate: serverTimestamp(),
      });
      
      // Remove from pending reviews
      set(state => ({
        pendingReviews: state.pendingReviews.filter(idea => idea.id !== ideaId)
      }));
    } catch (error) {
      console.error('Error approving idea:', error);
      throw error;
    }
  },

  rejectIdea: async (ideaId: string) => {
    try {
      await get().updateIdeaStatus(ideaId, 'wont_implement');
      
      // Remove from pending reviews
      set(state => ({
        pendingReviews: state.pendingReviews.filter(idea => idea.id !== ideaId)
      }));
    } catch (error) {
      console.error('Error rejecting idea:', error);
      throw error;
    }
  },

  updateIdeaStatus: async (ideaId: string, status: IdeaStatus) => {
    try {
      const ideaRef = doc(db, 'ideas', ideaId);
      await updateDoc(ideaRef, {
        status,
        lastStatusUpdate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Update in ideas store as well
      useIdeasStore.getState().updateIdeaInList(ideaId, { status });
    } catch (error) {
      console.error('Error updating idea status:', error);
      throw error;
    }
  },

  bulkApprove: async (ideaIds: string[]) => {
    try {
      const batch = writeBatch(db);
      
      ideaIds.forEach(ideaId => {
        const ideaRef = doc(db, 'ideas', ideaId);
        batch.update(ideaRef, {
          status: 'needs_review',
          isPublic: true,
          lastStatusUpdate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      
      // Remove from pending reviews
      set(state => ({
        pendingReviews: state.pendingReviews.filter(
          idea => !ideaIds.includes(idea.id)
        )
      }));
    } catch (error) {
      console.error('Error bulk approving ideas:', error);
      throw error;
    }
  },

  bulkReject: async (ideaIds: string[]) => {
    try {
      const batch = writeBatch(db);
      
      ideaIds.forEach(ideaId => {
        const ideaRef = doc(db, 'ideas', ideaId);
        batch.update(ideaRef, {
          status: 'wont_implement',
          lastStatusUpdate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
      
      // Remove from pending reviews
      set(state => ({
        pendingReviews: state.pendingReviews.filter(
          idea => !ideaIds.includes(idea.id)
        )
      }));
    } catch (error) {
      console.error('Error bulk rejecting ideas:', error);
      throw error;
    }
  },

  setLoading: (isLoading: boolean) => set({ isLoading })
}));