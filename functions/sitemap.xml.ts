interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/admin_articles?select=slug,updated_at&status=eq.published&order=published_at.desc`,
    {
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    }
  );

  const articles = await res.json() as { slug: string; updated_at: string | null }[];

  const urls = [
    { loc: '/blog', priority: '1.0', changefreq: 'weekly' },
    { loc: '/blog/videos', priority: '0.8', changefreq: 'weekly' },
    ...articles.map((a) => ({
      loc: `/blog/${a.slug}`,
      priority: '0.9',
      changefreq: 'monthly' as const,
      lastmod: a.updated_at,
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
};
