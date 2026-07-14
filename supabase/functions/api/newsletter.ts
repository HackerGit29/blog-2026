interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  TURNSTILE_SECRET: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email, turnstileToken } = await request.json() as {
      email: string;
      turnstileToken: string;
    };

    if (!email || !turnstileToken) {
      return new Response(JSON.stringify({ error: 'Email and Turnstile token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET)}&response=${encodeURIComponent(turnstileToken)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const verifyResult = await verify.json() as { success: boolean };

    if (!verifyResult.success) {
      return new Response(JSON.stringify({ error: 'Turnstile verification échouée' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ email, source: 'blog' }),
    });

    if (res.status === 409) {
      return new Response(JSON.stringify({ error: 'Vous êtes déjà inscrit à la newsletter.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Erreur lors de l\'inscription' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
