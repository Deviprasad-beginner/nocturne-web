import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://nocturnesocial.in';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    /**
     * Pass a path like "/whispers" and the canonical will be built
     * as "https://nocturnesocial.in/whispers".
     * Omit (or leave undefined) to use window.location.pathname.
     */
    path?: string;
}

export function SEO({
    title = "Nocturne | The Night-Time Social Platform",
    description = "Step into Nocturne. The exclusive social space designed for the night. Share Whispers, curate your ambient vibe, and connect when the rest of the world goes quiet.",
    image = "https://nocturnesocial.in/social-preview.png",
    path,
}: SEOProps) {
    const siteTitle = title.includes("Nocturne") ? title : `${title} | Nocturne`;

    // Build canonical from the production base URL so mirrors/repos never outrank us.
    const canonicalPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />

            {/* Canonical – tells Google the definitive URL for this page */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Nocturne" />
            <meta property="og:url" content={canonicalUrl} />
            <script type="application/ld+json">
                {`
                    {
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Nocturne",
                        "url": "https://nocturnesocial.in/"
                    }
                `}
            </script>
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
}
