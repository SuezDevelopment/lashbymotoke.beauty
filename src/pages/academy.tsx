import React from 'react';
import Link from 'next/link';
import SEO from '@/components/seo';
import { SERVICE_CATEGORIES, TRAINING_PROGRAMS } from '@/config/services';

const formatMoney = (amount?: number, currency: string = 'NGN') => {
  if (!amount) return '';
  const formatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
  return formatted.replace('NGN', '₦');
};

const AcademyPage = () => {
  const crafts = SERVICE_CATEGORIES.flatMap(c => c.services);
  return (
    <main className="pt-24 pb-28 px-6 sm:px-8 lg:px-20">
      <SEO
        title="LashByMotoke Academy"
        description="Studio-only beauty training and internships with ongoing enrollment. Learn multiple crafts and join curated programs and tracks."
        keywords="LashByMotoke Academy, beauty training, lash training, brow training, internships, workshops, masterclasses"
      />
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-black">LashByMotoke Academy</h1>
        <p className="mt-3 text-lg md:text-xl text-black/80">Studio-only | Ongoing enrollment | Learn multiple crafts</p>
        <div className="mt-6">
          <Link href="/academy/apply" className="inline-block px-5 py-3 rounded-full bg-pink-200 hover:bg-pink-300 text-black shadow-sm transition-colors">
            Apply Now
          </Link>
        </div>
      </section>

      {/* Learnable crafts */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">All learnable crafts</h2>
          <p className="text-black/70">Every service we offer can be learned through our tailored academy programs.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {crafts.map(svc => (
            <div key={svc.slug} className="p-5 rounded-2xl bg-white/70 shadow-sm">
              <h3 className="text-xl font-semibold text-black">{svc.name}</h3>
              {svc.summary && (
                <p className="mt-1 text-black/70">{svc.summary}</p>
              )}
              {svc.basePrice?.amount && (
                <p className="mt-2 text-black"><span className="text-black/60">From</span> {formatMoney(svc.basePrice.amount)}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Programs & tracks */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">Programs & tracks</h2>
          <p className="text-black/70">Choose internships, workshops, or masterclasses based on your goals.</p>
        </div>
        <div className="space-y-8">
          {TRAINING_PROGRAMS.map(program => (
            <div key={program.id} className="p-6 rounded-2xl bg-white/70 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-black">{program.name}</h3>
                  {program.description && (
                    <p className="text-black/70">{program.description}</p>
                  )}
                  {program.scheduleNote && (
                    <p className="mt-1 text-black/70">{program.scheduleNote}</p>
                  )}
                </div>
                <Link href="/academy/apply" className="inline-block px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black shadow-sm transition-colors">Apply for this</Link>
              </div>
              {program.levels && program.levels.length > 0 && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {program.levels.map(level => (
                    <div key={level.id} className="p-4 rounded-xl bg-pink-50">
                      <p className="text-sm text-black/60">{level.name}</p>
                      {level.duration?.min && (
                        <p className="mt-1 text-black/80">Duration: {level.duration.min} {level.duration.unit === 'hour' ? 'hours' : 'minutes'}</p>
                      )}
                      {level.price?.amount && (
                        <p className="mt-1 text-black"><span className="text-black/60">From</span> {formatMoney(level.price.amount)}</p>
                      )}
                      {level.syllabus && level.syllabus.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-black/80">
                          {level.syllabus.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Payment options */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black">Payment options</h2>
          <p className="text-black/70">Choose a one-time payment or a monthly plan that suits your pace.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white/70 shadow-sm">
            <h3 className="text-xl font-semibold text-black">One-time payment</h3>
            <p className="mt-1 text-black/70">Pay upfront and enjoy priority scheduling and materials setup.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/70 shadow-sm">
            <h3 className="text-xl font-semibold text-black">Monthly plan</h3>
            <p className="mt-1 text-black/70">Spread payments monthly. Flexible start dates with ongoing enrollment.</p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-pink-50 text-black/80">
          <p className="font-semibold text-black">Potential fees</p>
          <ul className="list-disc list-inside">
            <li>Starter kit and consumables (if required)</li>
            <li>Certification or assessment fees (where applicable)</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link href="/academy/apply" className="inline-block px-6 py-3 rounded-full bg-pink-200 hover:bg-pink-300 text-black shadow-sm transition-colors">
          Apply Now — Join the glam side
        </Link>
      </section>
    </main>
  );
};

export default AcademyPage;