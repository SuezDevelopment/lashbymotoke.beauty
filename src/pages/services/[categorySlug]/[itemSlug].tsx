import React, { useRef } from 'react';
import Head from 'next/head';
import type { GetServerSideProps, NextPage } from 'next';
import MongoDbConnection from '@/lib/db';
import { SITE_CONFIG } from '@/config/site';

type ServiceItemDoc = {
  id?: string;
  name: string;
  slug: string;
  summary?: string;
  basePrice?: { amount: number; currency: string };
  duration?: { min: number; unit: string };
  tags?: string[];
  images?: string[];
  bookingLink?: string;
  position?: number;
  highlights?: string[];
  faqs?: Array<{ q: string; a: string }>;
  variants?: Array<{
    id?: string;
    name: string;
    slug: string;
    basePrice?: { amount: number; currency: string };
    duration?: { min: number; unit: string };
    tags?: string[];
    images?: string[];
    bookingLink?: string;
    position?: number;
  }>;
};

type ServiceCategoryDoc = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  services?: ServiceItemDoc[];
};

interface PageProps {
  category: ServiceCategoryDoc;
  item: ServiceItemDoc;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const { categorySlug, itemSlug } = ctx.params as { categorySlug: string; itemSlug: string };
  await MongoDbConnection.connect();
  const col = await MongoDbConnection.getCollection('service_categories');
  const cat: any = await col.findOne({ slug: String(categorySlug) });
  if (!cat) {
    return { notFound: true };
  }
  const items: ServiceItemDoc[] = Array.isArray(cat.services) ? cat.services : [];
  const item = items.find((s) => s.slug === String(itemSlug));
  if (!item) {
    return { notFound: true };
  }
  // Map minimal fields for safety
  const category: ServiceCategoryDoc = {
    _id: cat._id?.toString(),
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
  };
  return { props: { category, item } };
};

const withUTM = (url?: string, categorySlug?: string, itemSlug?: string) => {
  if (!url) return undefined;
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://lashbymotoke.beauty');
    const params = new URLSearchParams(u.search);
    params.set('utm_source', 'website');
    params.set('utm_medium', 'detail_page');
    params.set('utm_campaign', 'item_booking');
    if (categorySlug) params.set('utm_category', categorySlug);
    if (itemSlug) params.set('utm_content', itemSlug);
    u.search = params.toString();
    return u.toString();
  } catch {
    return url; // if invalid URL, return original
  }
};

const ItemDetailPage: NextPage<PageProps> = ({ category, item }) => {
  const title = `${item.name} — ${category.name} | ${SITE_CONFIG.seo.siteName}`;
  const desc = item.summary || category.description || SITE_CONFIG.seo.defaultDescription;
  const canonical = `${SITE_CONFIG.seo.canonicalUrl}/services/${category.slug}/${item.slug}`;
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: item.name,
    description: desc,
    areaServed: 'Lagos, NG',
    provider: {
      '@type': 'LocalBusiness',
      name: SITE_CONFIG.seo.siteName,
      url: SITE_CONFIG.seo.canonicalUrl,
    },
    offers: item.basePrice ? {
      '@type': 'Offer',
      price: item.basePrice.amount,
      priceCurrency: item.basePrice.currency,
      availability: 'https://schema.org/InStock',
      url: withUTM(item.bookingLink, category.slug, item.slug),
    } : undefined,
  };
  const faqLdJson = Array.isArray(item.faqs) && item.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: item.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  const bookingHref = withUTM(item.bookingLink, category.slug, item.slug);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) => {
    try { scrollerRef.current?.scrollBy({ left: dx, behavior: 'smooth' }); } catch {}
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_CONFIG.seo.og?.image || '/mbe.png'} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
        {faqLdJson && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLdJson) }} />
        )}
      </Head>

      {/* Hero */}
      <section className="px-6 md:px-20 py-10 border-l-8 border-black">
        <h1 className="text-2xl md:text-3xl font-bold">{item.name}</h1>
        <p className="text-lg md:text-xl mt-2 text-black/80">{desc}</p>
        <div className="flex items-center gap-3 mt-4">
          {item.basePrice && (
            <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm">{item.basePrice.amount} {item.basePrice.currency}</span>
          )}
          {item.duration && (
            <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm">{item.duration.min} {item.duration.unit}</span>
          )}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-sm">{item.tags.join(', ')}</span>
          )}
        </div>
        {bookingHref && (
          <div className="mt-6"><a href={bookingHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-pink-200 hover:bg-pink-300 px-4 py-2 text-black">Book Now</a></div>
        )}
      </section>

      {/* Gallery carousel */}
      {Array.isArray(item.images) && item.images.length > 0 && (
        <section className="px-6 md:px-20">
          <div className="relative">
            <div ref={scrollerRef} className="overflow-x-auto flex gap-4 py-4 scroll-smooth snap-x snap-mandatory">
              {item.images.map((src, idx) => (
                <img key={idx} src={src} alt={`${item.name} image ${idx+1}`} className="h-56 w-auto rounded-2xl border border-black/10 snap-start" />
              ))}
            </div>
            {/* gradient masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
            {/* controls */}
            <div className="absolute inset-y-0 left-2 flex items-center">
              <button onClick={() => scrollBy(-300)} className="px-2 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black shadow">◀</button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button onClick={() => scrollBy(300)} className="px-2 py-1 rounded-full bg-black/10 hover:bg-black/20 text-black shadow">▶</button>
            </div>
          </div>
        </section>
      )}

      {/* Variants */}
      {Array.isArray(item.variants) && item.variants.length > 0 && (
        <section className="px-6 md:px-20 py-8">
          <h2 className="text-xl font-semibold">Variants</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...item.variants].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((v) => {
              const vHref = withUTM(v.bookingLink, category.slug, `${item.slug}:${v.slug}`);
              return (
                <div key={v.id || v.slug} className="rounded-2xl border border-black/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-black">{v.name}</div>
                    <div className="text-sm text-black/70">{v.basePrice ? `${v.basePrice.amount} ${v.basePrice.currency}` : ''}</div>
                  </div>
                  <div className="text-sm text-black/70 mt-1">{v.duration ? `${v.duration.min} ${v.duration.unit}` : ''}</div>
                  {Array.isArray(v.tags) && v.tags.length > 0 && (
                    <div className="mt-2 text-xs text-black/60">Tags: {v.tags.join(', ')}</div>
                  )}
                  {vHref && (
                    <div className="mt-3">
                      <a href={vHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-pink-200 hover:bg-pink-300 px-3 py-1 text-sm text-black">Book {v.name}</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Highlights */}
      <section className="px-6 md:px-20 py-8">
        <h2 className="text-xl font-semibold">Highlights</h2>
        {Array.isArray(item.highlights) && item.highlights.length > 0 ? (
          <ul className="list-disc ml-6 mt-2 text-black/80">
            {item.highlights.map((h, i) => (<li key={i}>{h}</li>))}
          </ul>
        ) : (
          <ul className="list-disc ml-6 mt-2 text-black/80">
            <li>Expert lash application tailored to your look</li>
            <li>Premium materials for comfort and durability</li>
            <li>Aftercare guidance provided</li>
          </ul>
        )}
      </section>

      {/* FAQs */}
      <section className="px-6 md:px-20 pb-12">
        <h2 className="text-xl font-semibold">FAQs</h2>
        {Array.isArray(item.faqs) && item.faqs.length > 0 ? (
          <div className="mt-2 space-y-3">
            {item.faqs.map((f, i) => (
              <div key={i}>
                {f.q && <div className="font-medium">{f.q}</div>}
                {f.a && <div className="text-black/80">{f.a}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            <div>
              <div className="font-medium">How long does the session take?</div>
              <div className="text-black/80">Typical sessions range from 1 to 2 hours depending on the style.</div>
            </div>
            <div>
              <div className="font-medium">How should I prepare?</div>
              <div className="text-black/80">Arrive with clean lashes and avoid oil-based products before your appointment.</div>
            </div>
            <div>
              <div className="font-medium">How do I maintain results?</div>
              <div className="text-black/80">Follow the provided aftercare instructions and schedule refills every 2–3 weeks.</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ItemDetailPage;