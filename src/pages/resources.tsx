import React from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import SEO from '@/components/seo';
import Link from 'next/link';
import MongoDbConnection from '@/lib/db';
import type { Resource } from '@/lib/types';

interface ResourcesPageProps { items: Resource[] }

const ResourcesPage: NextPage<ResourcesPageProps> = ({ items }) => {
  const servicesJson = items.slice(0, 3).map(it => ({
    name: it.title,
    description: it.summary || it.content?.slice(0, 140) || '',
    providerName: 'LashByMotoke',
    providerUrl: 'https://lashbymotoke.beauty',
  }));

  return (
    <div>
      <SEO
        title="Resources"
        description="Guides, aftercare tips, and beauty resources from LashByMotoke Academy to help you get the most out of your lash and brow services."
        keywords="lash aftercare tips, lash extensions guide, brow lamination care, beauty resources, LashByMotoke Academy"
        services={servicesJson}
        faq={[
          { question: 'How do I care for fresh lash extensions?', answer: 'Avoid water and steam for 24 hours, do not rub your eyes, and brush lashes gently.' },
          { question: 'How long do extensions last?', answer: 'With proper care and refills, your extensions can last 4–6 weeks.' },
        ]}
      />
      <main className="min-h-screen bg-[#fafafa]">
        <section className="px-4 sm:px-6 pt-20 pb-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-black">Beauty Resources & Aftercare</h1>
            <p className="mt-3 text-black/70">Learn best practices, maintenance tips, and expert advice from LashByMotoke Academy.</p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/trainings/apply" className="px-5 py-3 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Join the Academy</Link>
              <Link href="/services" className="px-5 py-3 rounded-full bg-black/10 text-black">Book a Session</Link>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map(it => (
                <article key={it._id} className="rounded-2xl bg-white/80 shadow-sm overflow-hidden border border-black/5">
                  {it.heroImage && (
                    <img src={it.heroImage} alt={it.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-black"><Link href={`/resources/${it.slug}`}>{it.title}</Link></h2>
                    {it.category && <div className="text-xs text-black/50 mt-1">{it.category}</div>}
                    {Array.isArray(it.tags) && it.tags.length > 0 && (
                      <div className="text-xs text-black/50 mt-1">{it.tags.join(', ')}</div>
                    )}
                    <p className="text-black/70 mt-2">{it.summary || (it.content || '').slice(0, 160)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Link href={`/resources/${it.slug}`} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Read</Link>
                      {it.ctaHref && (
                        <a href={it.ctaHref} className="px-4 py-2 rounded-full bg-black/10 text-black" target="_blank" rel="noreferrer">{it.ctaLabel || 'Learn more'}</a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ResourcesPageProps> = async () => {
  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('resources');
    const items = await col.find({ status: 'published' }).sort({ createdAt: -1 }).limit(60).toArray();
    const normalized = items.map((it: any) => ({
      _id: it._id?.toString(),
      title: it.title,
      slug: it.slug,
      summary: it.summary,
      content: it.content,
      heroImage: it.heroImage,
      category: it.category,
      tags: it.tags || [],
      status: it.status,
      ctaLabel: it.ctaLabel,
      ctaHref: it.ctaHref,
      updatedAt: it.updatedAt,
    }));
    return { props: { items: normalized } };
  } catch (e) {
    console.warn('SSR resources fetch failed:', e);
    return { props: { items: [] } };
  }
};

export default ResourcesPage;