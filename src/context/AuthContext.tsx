import { createContext, useEffect, useMemo, useState } from 'react';
import {
  auth,
  db,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithPopup,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  setDoc,
  doc,
  getDoc
} from '../firebase';
import { AppUser, UserRole } from '../types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  signOut: async () => {}
});

const USERS_COLLECTION = 'users';

async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as AppUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (profile) {
        setUser(profile);
      } else {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: 'worker'
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (name: string, email: string, password: string, role: UserRole) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    const ref = doc(db, USERS_COLLECTION, credential.user.uid);
    await setDoc(ref, {
      uid: credential.user.uid,
      name,
      email,
      role,
      photoURL: credential.user.photoURL || null,
      createdAt: new Date().toISOString()
    });
  };

  const signInWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const ref = doc(db, USERS_COLLECTION, credential.user.uid);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      await setDoc(ref, {
        uid: credential.user.uid,
        name: credential.user.displayName,
        email: credential.user.email,
        role: 'worker',
        photoURL: credential.user.photoURL || null,
        createdAt: new Date().toISOString()
      });
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ user, loading, signInWithEmail, signUp, signInWithGoogle, resetPassword, signOut }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
