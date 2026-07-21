interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

function getUrl(env: Env): string {
  return env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
}

function getAnonKey(env: Env): string {
  return env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
}

function getServiceKey(env: Env): string {
  return env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

async function supabaseFetch(url: string, env: Env, jwt: string): Promise<Response> {
  const serviceKey = getServiceKey(env);
  const authHeader = serviceKey
    ? `Bearer ${serviceKey}`
    : `Bearer ${jwt}`;
  const apiKey = serviceKey ? serviceKey : getAnonKey(env);
  return fetch(url, {
    headers: { apikey: apiKey, Authorization: authHeader, Accept: 'application/json' },
  });
}

async function isAdmin(token: string, env: Env): Promise<boolean> {
  const payload = decodeJwtPayload(token);
  const userId = payload?.sub as string | undefined;
  if (!userId) return false;

  const base = getUrl(env);

  try {
    const [profileRes, roleRes] = await Promise.all([
      supabaseFetch(
        `${base}/rest/v1/user_profiles?select=can_access_admin&user_id=eq.${userId}&limit=1`,
        env, token
      ),
      supabaseFetch(
        `${base}/rest/v1/user_roles?select=role&user_id=eq.${userId}&limit=1`,
        env, token
      ),
    ]);

    const profile = await profileRes.json() as any[];
    const roleData = await roleRes.json() as any[];

    const canAccessAdmin = profile?.length > 0 && !!profile[0]?.can_access_admin;
    const role = roleData?.length > 0 ? roleData[0]?.role : null;

    return canAccessAdmin || role === 'superadmin' || role === 'admin';
  } catch {
    return false;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADERS });
  }

  const token = authHeader.slice(7);
  if (!await isAdmin(token, env)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: JSON_HEADERS });
  }

  const base = getUrl(env);
  if (!base) {
    return new Response(JSON.stringify({ error: 'SUPABASE_URL not configured' }), { status: 500, headers: JSON_HEADERS });
  }

  try {
    const res = await supabaseFetch(
      `${base}/rest/v1/user_profiles?select=id,user_id,username,name,can_access_admin,created_at&order=created_at.asc`,
      env, token
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 502, headers: JSON_HEADERS });
    }

    const profiles: any[] = await res.json();

    const withRoles = await Promise.all(
      (profiles || []).map(async (p) => {
        try {
          const roleRes = await supabaseFetch(
            `${base}/rest/v1/user_roles?select=role&user_id=eq.${p.user_id}&limit=1`,
            env, token
          );
          const roleData = await roleRes.json() as any[];
          return { ...p, role: roleData?.length > 0 ? roleData[0]?.role : null };
        } catch {
          return { ...p, role: null };
        }
      })
    );

    return new Response(JSON.stringify(withRoles), { status: 200, headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: JSON_HEADERS });
  }
};
