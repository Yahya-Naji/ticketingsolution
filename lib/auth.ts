import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from './types';

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'client',
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const createUserProfile = async (
  uid: string, 
  email: string, 
  firstName: string, 
  lastName: string,
  role: 'client' | 'admin' = 'client'
) => {
  try {
    const userData = {
      email,
      displayName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      role,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };
    
    await setDoc(doc(db, 'users', uid), userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser.uid);
      callback(userData);
    } else {
      callback(null);
    }
  });
};