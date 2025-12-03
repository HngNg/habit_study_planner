import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  identity: string | null;
  hasOnboarded: boolean;
  identityProgress: number;
  setIdentity: (identity: string) => void;
  incrementIdentityProgress: (amount?: number) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      identity: null,
      hasOnboarded: false,
      identityProgress: 0,
      setIdentity: (identity) =>
        set((state) => ({
          identity,
          // If the text changed meaningfully, reset progress to 0
          identityProgress: state.identity === identity ? state.identityProgress : 0,
        })),
      incrementIdentityProgress: (amount = 1) =>
        set((state) => ({
          identityProgress: Math.min(100, state.identityProgress + amount),
        })),
      completeOnboarding: () => set({ hasOnboarded: true }),
      reset: () => set({ identity: null, hasOnboarded: false, identityProgress: 0 }),
    }),
    {
      name: 'user-storage',
    }
  )
);
