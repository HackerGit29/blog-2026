import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfileData {
  name: string;
  title: string;
  location: string;
  followers: string;
  following: string;
  likes: string;
  avatarUrl: string;
  socials: { discord: string; github: string; instagram: string };
  isVerified?: boolean;
  username?: string;
}

const defaultProfile: ProfileData = {
  name: 'Irene Brooks',
  title: "Designer d'interface et de marque",
  location: 'basée à San Antonio',
  followers: '2,985',
  following: '132',
  likes: '548',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  socials: {
    discord: 'https://discord.com/users/1373337350028923081',
    github: 'https://github.com/HackerGit29',
    instagram: 'https://instagram.com/mopaossi',
  },
  isVerified: false,
  username: 'irene-brooks',
};

interface PortfolioState {
  activeTab: number;
  profile: ProfileData;
  setActiveTab: (index: number) => void;
  updateProfile: (data: Partial<ProfileData>) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      activeTab: 0,
      profile: defaultProfile,
      setActiveTab: (index) => set({ activeTab: index }),
      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),
    }),
    { name: 'portfolio-store' }
  )
);
