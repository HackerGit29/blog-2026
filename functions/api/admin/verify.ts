interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: JSON_HEADERS });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ canAccessAdmin: false }), { status: 200, headers: JSON_HEADERS });
  }

  const token = authHeader.slice(7);
  const payload = decodeJwtPayload(token);
  const userId = payload?.sub as string | undefined;

  if (!userId) {
    return new Response(JSON.stringify({ canAccessAdmin: false }), { status: 200, headers: JSON_HEADERS });
  }

  try {
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_profiles?select=can_access_admin&user_id=eq.${userId}&limit=1`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: authHeader, Accept: 'application/json' } }
    );

    const profiles: any[] = await res.json();
    const canAccessAdmin = profiles?.length > 0 ? !!profiles[0]?.can_access_admin : false;

    return new Response(JSON.stringify({ canAccessAdmin }), { status: 200, headers: JSON_HEADERS });
  } catch {
    return new Response(JSON.stringify({ canAccessAdmin: false }), { status: 200, headers: JSON_HEADERS });
  }
};
