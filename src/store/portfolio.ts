import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfileData {
  name: string;
  title: string;
  location: string;
  description?: string;
  avatarUrl: string;
  socials: { discord: string; github: string; instagram: string; linkedin?: string; twitter?: string; website?: string };
  isVerified?: boolean;
  username?: string;
  followerCount?: number; // Nombre réel d'abonnés
  formattedFollowers?: string; // Format Instagram (1.2K, 100M, etc.)
  // Deprecated: kept for backward compatibility
  followers?: string;
  following?: string;
  likes?: string;
  memberSince?: string;

}

export const DEFAULT_TENANT = 'mopaossi';

const defaultProfile: ProfileData = {
  name: 'Mopaossi',
  title: 'Software Developer & Microsoft Community Contributor',
  location: 'Based on Earth, connected to the cloud.',
  avatarUrl: '',
  socials: {
    discord: 'https://discord.com/users/1373337350028923081',
    github: 'https://github.com/HackerGit29',
    instagram: 'https://instagram.com/mopaossi',
  },
  isVerified: true,
  username: DEFAULT_TENANT,
  followerCount: 0,
  formattedFollowers: '0',
};

interface PortfolioState {
  activeTab: number;
  /**
   * profile = profil du tenant actuellement consulté (/:user).
   * Mis à jour par usePublicProfile, jamais par useProfile (user auth).
   * Persisté en localStorage pour un accès offline au dernier tenant visité.
   */
  profile: ProfileData;
  /**
   * ownProfile = profil de l'utilisateur authentifié.
   * Mis à jour uniquement par useProfile quand user != null.
   * Null si non connecté.
   */
  ownProfile: ProfileData | null;
  magneticEnabled: boolean;
  cursorEnabled: boolean;
  setActiveTab: (index: number) => void;
  /** Met à jour le profil du tenant visité (/:user). */
  updateProfile: (data: Partial<ProfileData>) => void;
  /** Met à jour le profil de l'utilisateur authentifié. */
  updateOwnProfile: (data: Partial<ProfileData>) => void;
  /** Réinitialise ownProfile à null (déconnexion). */
  clearOwnProfile: () => void;
  setMagneticEnabled: (enabled: boolean) => void;
  setCursorEnabled: (enabled: boolean) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      activeTab: 0,
      profile: defaultProfile,
      ownProfile: null,
      magneticEnabled: true,
      cursorEnabled: true,
      setActiveTab: (index) => set({ activeTab: index }),
      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),
      updateOwnProfile: (data) =>
        set((state) => ({
          ownProfile: state.ownProfile
            ? { ...state.ownProfile, ...data }
            : { ...defaultProfile, ...data },
        })),
      clearOwnProfile: () => set({ ownProfile: null }),
      setMagneticEnabled: (enabled) => set({ magneticEnabled: enabled }),
      setCursorEnabled: (enabled) => set({ cursorEnabled: enabled }),
    }),
    { name: 'portfolio-store-v2' }
  )
);
