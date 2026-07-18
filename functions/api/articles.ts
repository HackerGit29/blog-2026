interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: HEADERS });
  }

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const per_page = Math.min(50, Math.max(1, parseInt(url.searchParams.get('per_page') || '9')));
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('category_id') || '';
    const mediaType = url.searchParams.get('media_type') || 'all';
    const username = url.searchParams.get('username') || '';

    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    let apiUrl = `${env.SUPABASE_URL}/rest/v1/article_list?select=*&order=published_at.desc`;

    if (username) {
      const esc = username.replace(/'/g, "''");
      apiUrl += `&author->>username=eq.${esc}`;
    }
    if (search) {
      const esc = search.replace(/'/g, "''");
      apiUrl += `&or=(title.ilike.*${esc}*,summary.ilike.*${esc}*)`;
    }
    if (categoryId) {
      apiUrl += `&category_id=eq.${categoryId}`;
    }
    if (mediaType === 'video') {
      apiUrl += `&media_type=eq.video`;
    } else if (mediaType === 'image') {
      apiUrl += `&or=(media_type.eq.image,media_type.is.null)`;
    }

    const reqHeaders: Record<string, string> = {
      'apikey': env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
      'Range': `${from}-${to}`,
      'Prefer': 'count=exact',
    };

    const res = await fetch(apiUrl, { headers: reqHeaders });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Supabase error', details: await res.text() }), { status: 502, headers: HEADERS });
    }

    const cr = res.headers.get('content-range');
    const total = cr ? parseInt(cr.split('/')[1] || '0') : 0;
    const data = await res.json();

    // Fetch category counts for filter badges
    const catBaseUrl = `${env.SUPABASE_URL}/rest/v1/article_list?select=category_id`;
    const catFilter = username ? `&author->>username=eq.${username.replace(/'/g, "''")}` : '';
    const catUrl = `${catBaseUrl}${catFilter}`;
    const catRes = await fetch(catUrl, {
      headers: { 'apikey': env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}` },
    });
    const catRows = catRes.ok ? (await catRes.json() as { category_id: string | null }[]) : [];
    const category_counts: Record<string, number> = {};
    for (const r of catRows) {
      if (r.category_id) category_counts[r.category_id] = (category_counts[r.category_id] || 0) + 1;
    }

    const totalAll = Object.values(category_counts).reduce((a, b) => a + b, 0);

    return new Response(JSON.stringify({
      data,
      total,
      total_all: totalAll,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
      category_counts,
    }), { headers: HEADERS });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: HEADERS });
  }
};
