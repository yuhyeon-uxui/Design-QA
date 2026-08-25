import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isMaster: boolean;
  setUser: (user: User | null) => void;
  initializeAuth: () => void;
  signOut: () => Promise<void>;
}

const MASTER_EMAIL = 'aayhh1127@gmail.com';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isMaster: false,
  setUser: (user) => set({ 
    user, 
    isMaster: user?.email === MASTER_EMAIL,
    isLoading: false 
  }),
  initializeAuth: () => {
    // 1. 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ 
        user: session?.user ?? null, 
        isMaster: session?.user?.email === MASTER_EMAIL,
        isLoading: false 
      });
    });

    // 2. 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ 
        user: session?.user ?? null,
        isMaster: session?.user?.email === MASTER_EMAIL,
        isLoading: false 
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isMaster: false });
  }
}));
