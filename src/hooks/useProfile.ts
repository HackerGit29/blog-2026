import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePortfolioStore, ProfileData } from '../store/portfolio';

export function useProfile() {
  const { user } = useAuth();
  const profile = usePortfolioStore((s) => s.profile);
  const updateProfile = usePortfolioStore((s) => s.updateProfile);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return;
        const d = data as any;
        updateProfile({
          name: d.name || profile.name,
          title: d.title || profile.title,
          location: d.location || profile.location,
          avatarUrl: d.avatar_url || profile.avatarUrl,
          followers: d.followers || profile.followers,
          following: d.following || profile.following,
          likes: d.likes || profile.likes,
          socials: d.socials || profile.socials,
        });
      });
  }, [user]);

  const saveToSupabase = async (data: ProfileData) => {
    if (!user) return;
    await (supabase.from('user_profiles') as any).upsert({
      user_id: user.id,
      name: data.name,
      title: data.title,
      location: data.location,
      avatar_url: data.avatarUrl,
      socials: data.socials,
      followers: data.followers,
      following: data.following,
      likes: data.likes,
      updated_at: new Date().toISOString(),
    });
  };

  return { saveToSupabase };
}
