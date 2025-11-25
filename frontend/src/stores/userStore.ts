import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  identity: string | null;
  hasOnboarded: boolean;
  setIdentity: (identity: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      identity: null,
      hasOnboarded: false,
      setIdentity: (identity) => set({ identity }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      reset: () => set({ identity: null, hasOnboarded: false }),
    }),
    {
      name: 'user-storage',
    }
  )
);
