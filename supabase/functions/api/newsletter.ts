interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  TURNSTILE_SECRET: string;
}

// ── Rate limiting (in-memory, resets entre les isolates Cloudflare) ──────────
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();

  // Rate limit check
  const entry = rateLimit.get(ip);
  if (entry && now < entry.reset) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return new Response(JSON.stringify({ error: 'Trop de tentatives. Réessayez plus tard.' }), {
        status: 429,
        headers: { ...SECURITY_HEADERS, 'Retry-After': `${Math.ceil((entry.reset - now) / 1000)}` },
      });
    }
    entry.count++;
  } else {
    rateLimit.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: SECURITY_HEADERS,
    });
  }

  try {
    const { email, turnstileToken } = await request.json() as {
      email: string;
      turnstileToken: string;
    };

    if (!email || !turnstileToken) {
      return new Response(JSON.stringify({ error: 'Email et token requis' }), {
        status: 400,
        headers: SECURITY_HEADERS,
      });
    }

    // ── Vérification Turnstile anti-bot ─────────────────────────────────────
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET)}&response=${encodeURIComponent(turnstileToken)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const verifyResult = await verify.json() as { success: boolean };

    if (!verifyResult.success) {
      return new Response(JSON.stringify({ error: 'Vérification anti-bot échouée' }), {
        status: 403,
        headers: SECURITY_HEADERS,
      });
    }

    // ── Insertion Supabase ───────────────────────────────────────────────────
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
        headers: SECURITY_HEADERS,
      });
    }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Erreur lors de l'inscription" }), {
        status: 500,
        headers: SECURITY_HEADERS,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: SECURITY_HEADERS,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Requête invalide' }), {
      status: 400,
      headers: SECURITY_HEADERS,
    });
  }
};
