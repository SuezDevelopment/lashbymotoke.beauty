// src/components/SEO.tsx
import Head from 'next/head'
import { useEffect, useState } from 'react';
import { SITE_CONFIG } from '@/config/site';

// Structured data prop types (component-local to avoid leaking across app)
interface OrganizationSD {
  name?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

interface PostalAddressSD {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

interface LocalBusinessSD {
  name?: string;
  image?: string;
  telephone?: string;
  url?: string;
  address?: PostalAddressSD;
}

interface ServiceOfferSD {
  price?: number;
  priceCurrency?: string;
  url?: string;
  availability?: string; // e.g., InStock, PreOrder
}

interface ServiceSD {
  name: string;
  description?: string;
  providerName?: string;
  providerUrl?: string;
  areaServed?: string;
  offers?: ServiceOfferSD;
}

interface FAQItemSD { question: string; answer: string }

interface ReviewSD {
  author?: string;
  datePublished?: string; // ISO
  reviewBody?: string;
  ratingValue?: number; // 1-5
}

interface HreflangLink { lang: string; href: string }

interface SEOProps {
  title?: string
  description?: string
  ogImage?: string
  keywords?: string
  canonicalOverride?: string
  hreflangs?: HreflangLink[]
  organization?: OrganizationSD
  localBusiness?: LocalBusinessSD
  services?: ServiceSD[]
  faq?: FAQItemSD[]
  reviews?: ReviewSD[]
}

export default function SEO(props: SEOProps) {
    const { title: titleProp, description: descProp, ogImage: ogImageProp, keywords: keywordsProp,
      canonicalOverride, hreflangs, organization, localBusiness, services, faq, reviews } = props;
    // Prefer values from typed site configuration, with sensible fallbacks
    const seo = SITE_CONFIG.seo;
    const defaultTitle = seo.defaultTitle;
    const defaultDescription = seo.defaultDescription;
    const defaultOGImage = seo.og?.image || '/mbe.png';
    const defaultKeywords = "lash extensions Lagos, brow shaping Lagos, lash lift Lagos, professional lash artist Lagos, LashByMotoke, beauty services Nigeria, volume lashes, classic lashes, hybrid lashes, brow lamination, lash and brow studio";
    const canonicalBase = seo.canonicalUrl || 'https://lashbymotoke.beauty';

    let title = titleProp || defaultTitle;
    let description = descProp || defaultDescription;
    let ogImage = ogImageProp || defaultOGImage;
    let keywords = (typeof keywordsProp === 'string' ? keywordsProp : defaultKeywords);

    const [pathname, setPathname] = useState('/');

    useEffect(() => {
        // This will only run on the client-side
        if (typeof window !== 'undefined') {
            setPathname(window.location.pathname);
        }
    }, []);

    // Build canonical URL safely, allowing page-level override
    const canonicalUrl = (typeof window !== 'undefined' && window.location?.href)
      ? (canonicalBase + pathname)
      : (canonicalBase + pathname);

    const finalCanonical = (typeof canonicalOverride === 'string' && canonicalOverride.length > 0)
      ? canonicalOverride
      : canonicalUrl;

    // Build JSON-LD structures with sensible defaults
    const socialsSameAs = SITE_CONFIG.socials.map(s => s.url).filter(Boolean);

    const organizationJson = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: (seo.siteName || defaultTitle),
      url: canonicalBase,
      logo: SITE_CONFIG.seo.og?.image || '/mbe.png',
      sameAs: socialsSameAs,
      ...(organization || {})
    };

    const addr = SITE_CONFIG.contact.address;
    const localBusinessJson = {
      '@context': 'https://schema.org',
      '@type': 'HealthAndBeautyBusiness',
      name: (seo.siteName || defaultTitle),
      image: SITE_CONFIG.seo.og?.image || '/mbe.png',
      '@id': finalCanonical,
      url: canonicalBase,
      telephone: SITE_CONFIG.contact.phone || SITE_CONFIG.contact.whatsapp || undefined,
      address: addr ? {
        '@type': 'PostalAddress',
        streetAddress: addr.line1,
        addressLocality: addr.city,
        addressRegion: addr.region,
        postalCode: addr.postalCode,
        addressCountry: addr.country,
      } : undefined,
      ...(localBusiness || {})
    };

    const servicesJson = (services || []).map(s => ({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.name,
      description: s.description,
      provider: {
        '@type': 'LocalBusiness',
        name: s.providerName || (seo.siteName || defaultTitle),
        url: s.providerUrl || canonicalBase,
      },
      areaServed: s.areaServed || 'Lagos, NG',
      offers: s.offers ? {
        '@type': 'Offer',
        price: typeof s.offers.price === 'number' ? s.offers.price : undefined,
        priceCurrency: s.offers.priceCurrency || 'NGN',
        url: s.offers.url || finalCanonical,
        availability: s.offers.availability || 'InStock',
      } : undefined,
    }));

    const faqJson = (faq && faq.length > 0) ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    } : null;

    const reviewsJson = (reviews || []).map(r => ({
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: r.author ? { '@type': 'Person', name: r.author } : undefined,
      datePublished: r.datePublished,
      reviewBody: r.reviewBody,
      reviewRating: typeof r.ratingValue === 'number' ? {
        '@type': 'Rating',
        ratingValue: r.ratingValue,
        bestRating: 5,
        worstRating: 1,
      } : undefined,
      itemReviewed: { '@type': 'LocalBusiness', name: (seo.siteName || defaultTitle) },
    }));

    return (
        <Head>
            <meta name="description" content={description || defaultDescription} />
            <meta property="keywords" content={keywords || defaultKeywords} />
            <meta property="og:keywords" content={keywords || defaultKeywords} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content={seo.siteName || defaultTitle} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={finalCanonical} />
            <meta property="og:title" content={title || defaultTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={ogImage || defaultOGImage} />
            <meta property="og:image:secure_url" content={ogImage || defaultOGImage} />
            <link rel="canonical" href={finalCanonical} />
            {Array.isArray(hreflangs) && hreflangs.map((h) => (
              <link key={`${h.lang}-${h.href}`} rel="alternate" hrefLang={h.lang} href={h.href} />
            ))}
            <title>{title ? `${title}` : defaultTitle}</title>
            <meta name="twitter:card" content="summary_large_image" />
            {seo.twitter?.site && (
                <meta name="twitter:site" content={seo.twitter.site} />
            )}
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
            {/* JSON-LD: Organization */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJson) }}
            />
            {/* JSON-LD: LocalBusiness */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJson) }}
            />
            {/* JSON-LD: Services */}
            {servicesJson.map((s, idx) => (
              <script key={`service-jsonld-${idx}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
            ))}
            {/* JSON-LD: FAQ (conditionally) */}
            {faqJson && (
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
            )}
            {/* JSON-LD: Reviews (optional) */}
            {reviewsJson.map((r, idx) => (
              <script key={`review-jsonld-${idx}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(r) }} />
            ))}
        </Head>
    )
}
