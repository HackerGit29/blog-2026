import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface TenantResource {
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
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('username', username.toLowerCase())
    .limit(1)
    .single();

  if (!profile?.user_id) return [];

  const { data: bundle } = await supabase
    .from('tenant_resources_bundle')
    .select('resources')
    .eq('user_id', profile.user_id)
    .limit(1)
    .maybeSingle();

  return (bundle?.resources as unknown as TenantResource[]) || [];
}

export function useTenantResources(username?: string) {
  return useQuery({
    queryKey: ['tenant-resources', username],
    queryFn: async (): Promise<TenantResource[]> => {
      if (!username) return [];

      const viaApi = await fetchResourcesViaApi(username);
      if (viaApi) return viaApi;

      return fetchResourcesViaSupabase(username);
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
}
