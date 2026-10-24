import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://nocturnesocial.in';

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  path?: string;
  noindex?: boolean;
  schema?: Record<string, unknown>;
}

const DEFAULT_TITLE = "Nocturne | The Night-Time Social Platform for Night Owls";
const DEFAULT_DESCRIPTION = "Nocturne is the anonymous late-night social platform and sanctuary for night owls. Share whispers, explore midnight diaries, join ambient audio rooms, and connect when the world goes quiet.";
const DEFAULT_IMAGE = "https://nocturnesocial.in/social-preview.png";
const DEFAULT_KEYWORDS = "nocturne, nocturne night social platform, night social platform, anonymous social platform, late night social network, night owls, midnight community, whispers, night diaries, ambient audio, night circles, mind maze";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  path,
  noindex = false,
  schema,
}: SEOProps) {
  // Format title properly
  const siteTitle = !title
    ? DEFAULT_TITLE
    : title.toLowerCase().includes("nocturne")
    ? title
    : `${title} | Nocturne`;

  // Build normalized canonical URL
  const pathname = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const cleanPath = pathname === '/' || !pathname ? '/' : pathname.replace(/\/+$/, '');
  const canonicalUrl = `${BASE_URL}${cleanPath}`;

  // Default Breadcrumb / WebPage schema for subpages
  const pageSchema = schema ?? (cleanPath !== '/' ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": siteTitle,
    "url": canonicalUrl,
    "description": description,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Nocturne",
      "url": "https://nocturnesocial.in/"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://nocturnesocial.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": title || cleanPath.replace(/^\//, ''),
          "item": canonicalUrl
        }
      ]
    }
  } : undefined);

  // Site‑wide WebSite schema (improves Knowledge Graph visibility)
  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": BASE_URL,
    "name": "Nocturne",
    "alternateName": "Nocturne Night Social Platform",
    "sameAs": [
      "https://github.com/Deviprasad-beginner/nocturne-web",
      "https://twitter.com/NocturneSocial"
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Crawlers / Indexing */}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />
      <meta
        name="googlebot"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Nocturne" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@NocturneSocial" />
      <meta name="twitter:creator" content="@NocturneSocial" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={siteTitle} />

      {/* Dynamic Structured Data for page */}
      {pageSchema && (
        <script type="application/ld+json">
          {JSON.stringify(pageSchema)}
        </script>
      )}
      {/* Site‑wide WebSite schema */}
      <script type="application/ld+json">{JSON.stringify(siteSchema)}</script>
    </Helmet>
  );
}
export default SEO;
