// src/components/SEO.tsx
import Head from 'next/head'
import { useEffect, useState } from 'react';
interface SEOProps {
    title?: string
    description?: string
    ogImage?: string
    keywords?: string
    // Add more props as needed
}

export default function SEO({ title, description, ogImage, keywords }: SEOProps) {
    const defaulName = "LashByMotoke";
    const defaultTitle = "LashByMotoke - Professional Lash Extensions & Brow Services in Lagos";
    const defaultDescription = "LashByMotoke specializes in premium lash extensions, lash lifts, and brow styling in Lagos. Our meticulous artistry delivers long-lasting, camera-ready results tailored to your features. Book your appointment today for timeless, confidence-boosting beauty."
    const defaultOGImage = '/mbe.png'
    const defaultKeywords = "lash extensions Lagos, brow shaping Lagos, lash lift Lagos, professional lash artist Lagos, LashByMotoke, beauty services Nigeria, volume lashes, classic lashes, hybrid lashes, brow lamination, lash and brow studio"
    title = title || defaultTitle
    description = description || defaultDescription
    ogImage = ogImage || defaultOGImage
    keywords = keywords ?? defaultKeywords

    const [pathname, setPathname] = useState('/');

    useEffect(() => {
        // This will only run on the client-side
        if (typeof window !== 'undefined') {
            setPathname(window.location.pathname);
        }
    }, []);

    return (
        <Head>
            <meta name="description" content={description || defaultDescription} />
            <meta property="keywords" content={keywords || defaultKeywords} />
            <meta property="og:keywords" content={keywords || defaultKeywords} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:site_name" content={defaultTitle} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`https://lashbymotoke.beauty${pathname}`} />
            <meta property="og:title" content={title || defaultTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={ogImage || defaultOGImage} />
            <meta property="og:image:secure_url" content={ogImage || defaultOGImage} />
            <title>{title ? `${title} - ${defaultTitle}` : defaultTitle}</title>
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
        </Head>
    )
}
