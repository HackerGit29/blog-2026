import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePortfolioStore, ProfileData } from '../store/portfolio';

export function useProfile() {
  const { user } = useAuth();
  // Utilise ownProfile (profil auth) — jamais le profil du tenant visité
  const ownProfile = usePortfolioStore((s) => s.ownProfile);
  const updateOwnProfile = usePortfolioStore((s) => s.updateOwnProfile);
  const clearOwnProfile = usePortfolioStore((s) => s.clearOwnProfile);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      clearOwnProfile();
      return;
    }
    supabase
      .from('user_profiles_with_formatted_followers')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return;
        const d = data as any;
        updateOwnProfile({
          name: d.name || ownProfile?.name,
          title: d.title || ownProfile?.title,
          location: d.location || ownProfile?.location,
          avatarUrl: d.avatar_url || ownProfile?.avatarUrl,
          followerCount: d.follower_count || 0,
          formattedFollowers: d.formatted_followers || '0',
          socials: d.socials || ownProfile?.socials,
          isVerified: d.is_verified || false,
          username: d.username || ownProfile?.username,
          // Backward compatibility
          followers: d.followers || ownProfile?.followers || '0',
          following: d.following || ownProfile?.following || '0',
          likes: d.likes || ownProfile?.likes || '0',
        });
      });
  }, [user?.id]);

  const saveToSupabase = async (data: ProfileData) => {
    if (!user) return;
    await (supabase.from('user_profiles') as any).upsert({
      user_id: user.id,
      name: data.name,
      title: data.title,
      location: data.location,
      avatar_url: data.avatarUrl,
      description: data.description || '',
      socials: {
        discord: data.socials?.discord || '',
        github: data.socials?.github || '',
        instagram: data.socials?.instagram || '',
        linkedin: data.socials?.linkedin || '',
        twitter: data.socials?.twitter || '',
        website: data.socials?.website || '',
      },
      username: data.username,
      updated_at: new Date().toISOString(),
    });
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Non authentifié');
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  return { saveToSupabase, uploadAvatar, uploading, ownProfile };
}


