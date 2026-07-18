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

async function supabaseFetch(url: string, env: Env, jwt: string, init?: RequestInit): Promise<Response> {
  const serviceKey = getServiceKey(env);
  const authHeader = serviceKey ? `Bearer ${serviceKey}` : `Bearer ${jwt}`;
  const apiKey = serviceKey ? serviceKey : getAnonKey(env);
  return fetch(url, {
    ...init,
    headers: { apikey: apiKey, Authorization: authHeader, Accept: 'application/json', ...init?.headers },
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

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADERS });
  }

  const token = authHeader.slice(7);
  const payload = decodeJwtPayload(token);
  const requesterId = payload?.sub as string;

  if (!await isAdmin(token, env)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: JSON_HEADERS });
  }

  let body: { user_id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: JSON_HEADERS });
  }

  if (!body.user_id || !body.action) {
    return new Response(JSON.stringify({ error: 'Missing user_id or action' }), { status: 400, headers: JSON_HEADERS });
  }

  if (body.user_id === requesterId) {
    return new Response(JSON.stringify({ error: 'Cannot toggle your own access' }), { status: 400, headers: JSON_HEADERS });
  }

  const base = getUrl(env);
  if (!base) {
    return new Response(JSON.stringify({ error: 'SUPABASE_URL not configured' }), { status: 500, headers: JSON_HEADERS });
  }

  try {
    const actions: Promise<Response>[] = [];

    switch (body.action) {
      case 'set_admin':
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_profiles?user_id=eq.${body.user_id}`,
            env, token,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
              body: JSON.stringify({ can_access_admin: true }),
            }
          )
        );
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_roles?user_id=eq.${body.user_id}`,
            env, token,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
              body: JSON.stringify({ role: 'admin' }),
            }
          )
        );
        break;

      case 'set_superadmin':
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_profiles?user_id=eq.${body.user_id}`,
            env, token,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
              body: JSON.stringify({ can_access_admin: true }),
            }
          )
        );
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_roles?user_id=eq.${body.user_id}`,
            env, token,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
              body: JSON.stringify({ role: 'superadmin' }),
            }
          )
        );
        break;

      case 'remove_admin':
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_profiles?user_id=eq.${body.user_id}`,
            env, token,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
              body: JSON.stringify({ can_access_admin: false }),
            }
          )
        );
        actions.push(
          supabaseFetch(
            `${base}/rest/v1/user_roles?user_id=eq.${body.user_id}`,
            env, token,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
              body: JSON.stringify({ role: 'user' }),
            }
          )
        );
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: JSON_HEADERS });
    }

    const results = await Promise.all(actions);
    for (const res of results) {
      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 502, headers: JSON_HEADERS });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: JSON_HEADERS });
  }
};
