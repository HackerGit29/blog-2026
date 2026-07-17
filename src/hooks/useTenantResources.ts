import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface TenantResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: string;
  sort_order: number;
}

async function fetchResourcesViaApi(username: string): Promise<TenantResource[] | null> {
  try {
    const res = await fetch(`/api/resources?username=${encodeURIComponent(username)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchResourcesViaSupabase(username: string): Promise<TenantResource[]> {
  // 1. Récupérer l'user_id depuis le username
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('username', username.toLowerCase())
    .limit(1)
    .single();

  if (!profile?.user_id) return [];

  // 2. Récupérer les ressources visibles
  const { data: resources } = await supabase
    .from('tenant_resources')
    .select('id,title,description,url,category,icon,sort_order')
    .eq('user_id', profile.user_id)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });

  return (resources as TenantResource[]) || [];
}

export function useTenantResources(username?: string) {
  return useQuery({
    queryKey: ['tenant-resources', username],
    queryFn: async (): Promise<TenantResource[]> => {
      if (!username) return [];

      // Essayer d'abord via la Cloudflare Function (production)
      const viaApi = await fetchResourcesViaApi(username);
      if (viaApi) return viaApi;

      // Fallback direct Supabase (dev local ou si API indisponible)
      return fetchResourcesViaSupabase(username);
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}
