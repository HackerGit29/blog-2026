import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  author?: string;
  tags?: string[];
}

const SITE_NAME = 'Benji AKA Dev';
const DEFAULT_DESC = 'Blog sur l\'IA, Microsoft Learn, Power Platform, Cloud, DevOps et développement web.';
const DEFAULT_IMG = 'https://benji-aka-dev.site/favicon.svg';

export function SEOHead({
  title,
  description,
  canonical,
  image = DEFAULT_IMG,
  type = 'website',
  publishedAt,
  author = 'Benji AKA Dev',
  tags,
}: SEOHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonical || `https://benji-aka-dev.site${window.location.pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
    </Helmet>
  );
}

export function BlogPostingJsonLd({
  title,
  description,
  url,
  image,
  publishedAt,
  author,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  author?: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: image || DEFAULT_IMG,
    url,
    datePublished: publishedAt,
    author: {
      '@type': 'Person',
      name: author || 'Benji AKA Dev',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: DEFAULT_IMG },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
