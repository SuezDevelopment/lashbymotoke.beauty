import React from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import SEO from '@/components/seo';
import MongoDbConnection from '@/lib/db';
import type { Resource } from '@/lib/types';
import Link from 'next/link';

const ResourceDetailPage: NextPage<{ item: Resource | null }> = ({ item }) => {
  const description = item?.summary || (item?.content || '').slice(0, 160);
  return (
    <div>
      <SEO
        title={item?.title || 'Resource'}
        description={description || 'Beauty resources and guidance from LashByMotoke Academy.'}
        keywords="lash aftercare, brow lamination care, lash extension guide, LashByMotoke resources"
      />
      <main className="min-h-screen bg-[#fafafa]">
        <section className="px-4 sm:px-6 pt-20 pb-10">
          <div className="max-w-3xl mx-auto">
            <Link href="/resources" className="inline-block mb-3 px-3 py-1 rounded-full bg-black/10 text-black">← Back to Resources</Link>
            <h1 className="text-3xl md:text-4xl font-bold text-black">{item?.title || 'Resource'}</h1>
            {item?.category && <div className="text-sm text-black/50 mt-1">{item.category}</div>}
            {Array.isArray(item?.tags) && item!.tags!.length > 0 && (
              <div className="text-xs text-black/50 mt-1">{item!.tags!.join(', ')}</div>
            )}
          </div>
        </section>
        <section className="px-4 sm:px-6 pb-20">
          <article className="max-w-3xl mx-auto rounded-2xl bg-white/80 shadow-sm p-4">
            {item?.heroImage && (
              <img src={item.heroImage} alt={item.title || ''} className="w-full h-56 object-cover rounded-xl" />
            )}
            <div className="prose prose-pink max-w-none mt-4" dangerouslySetInnerHTML={{ __html: item?.content || '' }} />
            <div className="mt-6">
              {item?.ctaHref && (
                <a href={item.ctaHref} className="px-5 py-3 rounded-full bg-pink-200 hover:bg-pink-300 text-black" target="_blank" rel="noreferrer">{item.ctaLabel || 'Learn more'}</a>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<{ item: Resource | null }> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('resources');
    const it = await col.findOne({ slug, status: 'published' });
    if (!it) return { notFound: true } as any;
    const normalized: Resource = {
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
    };
    return { props: { item: normalized } };
  } catch (e) {
    console.warn('SSR resource detail failed:', e);
    return { props: { item: null } };
  }
};

export default ResourceDetailPage;