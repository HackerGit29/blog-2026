interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const url = `${env.SUPABASE_URL}/rest/v1/admin_articles?select=slug,published_at,created_at&status=eq.published&order=published_at.desc`;

    const res = await fetch(url, {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      return new Response(`Supabase error: ${res.status}`, { status: 500 });
    }

    const articles = await res.json() as { slug: string; published_at: string | null; created_at: string | null }[];

    if (!Array.isArray(articles)) {
      return new Response(`Invalid response from Supabase`, { status: 500 });
    }

    const urls = [
      { loc: '/blog', priority: '1.0', changefreq: 'weekly' },
      { loc: '/blog/videos', priority: '0.8', changefreq: 'weekly' },
      ...articles.map((a) => ({
        loc: `/blog/${a.slug}`,
        priority: '0.9',
        changefreq: 'monthly' as const,
        lastmod: a.published_at || a.created_at,
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>https://benji-aka-dev.site${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
};
