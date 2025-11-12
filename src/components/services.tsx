import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ServiceItem { id?: string; name: string; slug: string; summary?: string; basePrice?: { amount: number; currency: string }; duration?: { min: number; unit: string }; tags?: string[]; position?: number; bookingLink?: string }
interface ServiceCategoryDoc { _id?: string; name: string; slug: string; description?: string; services?: ServiceItem[] }

const ServicesSection = () => {
  const [cats, setCats] = useState<ServiceCategoryDoc[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setCats(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        setCats([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="services" className="py-20 px-6 sm:px-8 lg:px-20">
      <motion.div
        className="flex flex-col lg:flex-row justify-between md:items-center gap-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, staggerChildren: 0.2 }}
      >
        <motion.div
          className="lg:w-1/3 h-[4rem] px-6 py-4 border-l-8 border-black"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-black text-left">MY SERVICES</h2>
        </motion.div>
        <motion.div
          className="lg:w-2/4 flex flex-col gap-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {loading && (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="animate-pulse h-8 w-64 bg-black/5 rounded-xl mb-2" />
                  <div className="animate-pulse h-5 w-full bg-black/5 rounded-xl" />
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(2)].map((__, j) => (
                      <div key={j} className="animate-pulse h-32 rounded-2xl border border-black/10 bg-black/5" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && cats.length === 0 && (
            <div className="text-black/70">
              Services are being updated. Please check back soon.
            </div>
          )}
          {!loading && cats.map((c) => {
            const items = Array.isArray(c.services) ? [...c.services] : [];
            items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            return (
              <div key={c._id || c.slug} className="flex flex-col gap-2.5">
                <h3 className="text-xl md:text-2xl font-bold text-black text-left">
                  {c.name}
                </h3>
                <p className="text-lg font-normal md:text-xl text-black text-left">
                  {c.description || 'Discover our premium offerings tailored to your needs.'}
                </p>
                {items.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(si => (
                      <div key={si.id || si.slug} className="rounded-2xl border border-black/10 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-black">
                            <Link href={`/services/${c.slug}/${si.slug}`}>{si.name}</Link>
                          </div>
                          <div className="text-sm text-black/70">{si.basePrice ? `${si.basePrice.amount} ${si.basePrice.currency}` : ''}</div>
                        </div>
                        <div className="text-sm text-black/70 mt-1">
                          {si.duration ? `${si.duration.min} ${si.duration.unit}${si.duration.min > 1 && si.duration.unit === 'hour' ? 's' : ''}` : ''}
                        </div>
                        {si.summary && <div className="text-sm text-black/80 mt-2">{si.summary}</div>}
                        <div className="mt-3 flex items-center gap-2">
                          <Link href={`/services/${c.slug}/${si.slug}`} className="inline-flex items-center rounded-full bg-black/5 hover:bg-black/10 px-3 py-1 text-sm text-black">View details</Link>
                          {si.bookingLink && (
                            <a href={si.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-pink-200 hover:bg-pink-300 px-3 py-1 text-sm text-black">Book Now</a>
                          )}
                        </div>
                        {Array.isArray(si.tags) && si.tags.length > 0 && (
                          <div className="mt-2 text-xs text-black/60">Tags: {si.tags.join(', ')}</div>
                        )}
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ServicesSection;