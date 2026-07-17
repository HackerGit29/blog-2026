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
const SITE_URL = 'https://benji-aka-dev.site';
const DEFAULT_DESC = "Blog sur l'IA, Microsoft Learn, Power Platform, Cloud, DevOps et développement web. Tutoriels, ressources Microsoft et formations pour étudiants.";
const DEFAULT_IMG = `${SITE_URL}/android-chrome-512x512.png`;
const TWITTER_HANDLE = '@benjiakadev';

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
  const url = canonical || `${SITE_URL}${window.location.pathname}`;

  return (
    <Helmet>
      <html lang="fr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="author" content={author} />
      <meta name="referrer" content="strict-origin-when-cross-origin" />

      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="fr" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Search Console — ajoute ton code de vérification ici */}
      <meta name="google-site-verification" content="a084537dcebf8a31" />
      <meta name="msvalidate.01" content="AJOUTE_TA_CLE_BING_ICI" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter/X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Dublin Core (sémantique) */}
      <meta name="dcterms.title" content={fullTitle} />
      <meta name="dcterms.description" content={description} />
      <meta name="dcterms.language" content="fr" />
      <meta name="dcterms.creator" content={author} />
      <meta name="dcterms.subject" content={tags?.join(', ') || 'IA, Microsoft, Azure, DevOps, Power Platform'} />

      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
    </Helmet>
  );
}

export function WebSiteJsonLd({ url }: { url?: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: url || SITE_URL,
    description: DEFAULT_DESC,
    author: {
      '@type': 'Person',
      name: 'Benji AKA Dev',
      url: SITE_URL,
    },
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
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
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: DEFAULT_IMG },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
