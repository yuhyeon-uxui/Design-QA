import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type UserRole = 'MASTER' | 'SUB_MASTER' | 'DEVELOPER' | 'GENERAL';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  role: UserRole;
  isMaster: boolean;
  canViewAdminMenu: boolean;
  canManageProjects: boolean;
  canManagePins: boolean;
  canEditDevFeedback: boolean;
  canComment: boolean;
  setUser: (user: User | null) => Promise<void>;
  initializeAuth: () => void;
  signOut: () => Promise<void>;
}

const MASTER_EMAIL = 'aayhh1127@gmail.com';

function computePermissions(role: UserRole) {
  return {
    isMaster: role === 'MASTER',
    canViewAdminMenu: role === 'MASTER',
    canManageProjects: role === 'MASTER' || role === 'SUB_MASTER',
    canManagePins: role === 'MASTER' || role === 'SUB_MASTER',
    canEditDevFeedback: role === 'MASTER' || role === 'SUB_MASTER' || role === 'DEVELOPER',
    canComment: true,
  };
}

const fetchRoleFromFirestore = async (email?: string): Promise<UserRole> => {
  if (!email) return 'GENERAL';
  if (email === MASTER_EMAIL) return 'MASTER'; // Hardcoded fallback for owner
  
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (['MASTER', 'SUB_MASTER', 'DEVELOPER', 'GENERAL'].includes(data.role)) {
        return data.role as UserRole;
      }
    }
  } catch (err) {
    console.error("Failed to fetch role:", err);
  }
  return 'GENERAL';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  role: 'GENERAL',
  ...computePermissions('GENERAL'),

  setUser: async (user) => {
    const role = await fetchRoleFromFirestore(user?.email);
    set({ user, role, ...computePermissions(role), isLoading: false });
  },

  initializeAuth: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const role = await fetchRoleFromFirestore(session?.user?.email);
      set({ user: session?.user ?? null, role, ...computePermissions(role), isLoading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const role = await fetchRoleFromFirestore(session?.user?.email);
      set({ user: session?.user ?? null, role, ...computePermissions(role), isLoading: false });
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: 'GENERAL', ...computePermissions('GENERAL') });
  }
}));

