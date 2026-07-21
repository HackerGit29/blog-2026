interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface Article {
  slug: string;
  published_at: string | null;
  created_at: string | null;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const BASE = 'https://benji-aka-dev.site';

  try {
    const url = `${env.SUPABASE_URL}/rest/v1/admin_articles?select=slug,published_at,created_at&status=eq.published&order=published_at.desc`;

    const res = await fetch(url, {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    });

    const articles: Article[] = res.ok ? await res.json() : [];

    const urls = [
      { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: '' },
      { loc: '/blog', priority: '1.0', changefreq: 'weekly', lastmod: '' },
      { loc: '/blog/videos', priority: '0.9', changefreq: 'weekly', lastmod: '' },
      { loc: '/ressources', priority: '0.8', changefreq: 'weekly', lastmod: '' },
      { loc: '/admin', priority: '0.3', changefreq: 'monthly', lastmod: '' },
      ...articles.map((a) => ({
        loc: `/blog/${a.slug}`,
        priority: '0.9',
        changefreq: 'monthly',
        lastmod: a.published_at || a.created_at || '',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${BASE}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (e: any) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><error>${e.message}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
};
