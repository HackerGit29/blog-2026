interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

function getUrl(env: Env): string {
  return env.SUPABASE_URL || env.VITE_SUPABASE_URL || '';
}

function getKey(env: Env): string {
  return env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return new Response(JSON.stringify({ error: 'username required' }), { status: 400, headers: JSON_HEADERS });
  }

  const base = getUrl(env);
  const anonKey = getKey(env);

  const anonHeaders = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Accept': 'application/json',
  };

  try {
    const profileRes = await fetch(
      `${base}/rest/v1/user_profiles?select=user_id&username=eq.${encodeURIComponent(username.toLowerCase())}&limit=1`,
      { headers: anonHeaders }
    );

    if (!profileRes.ok) {
      console.error(`[resources API] Profile lookup failed for username: ${username}, status: ${profileRes.status}`);
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 502, headers: JSON_HEADERS });
    }

    const profiles = await profileRes.json();
    const userId = profiles[0]?.user_id;

    if (!userId) {
      return new Response(JSON.stringify([]), { status: 200, headers: JSON_HEADERS });
    }

    const bundleRes = await fetch(
      `${base}/rest/v1/tenant_resources_bundle?select=resources&user_id=eq.${userId}&limit=1`,
      { headers: anonHeaders }
    );

    if (!bundleRes.ok) {
      console.error(`[resources API] Bundle lookup failed for user_id: ${userId}, status: ${bundleRes.status}`);
      return new Response(JSON.stringify([]), { status: 200, headers: JSON_HEADERS });
    }

    const bundle = await bundleRes.json();
    const resources = bundle?.[0]?.resources || [];

    return new Response(JSON.stringify(resources), {
      status: 200,
      headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=300' },
    });
  } catch (error) {
    console.error('[resources API] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: JSON_HEADERS });
  }
};
