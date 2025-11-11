import React, { useMemo, useState } from 'react';
import SEO from '@/components/seo';
import { SERVICE_CATEGORIES, TRAINING_PROGRAMS } from '@/config/services';

type PaymentPlan = 'one-time' | 'monthly';

const AcademyApplyPage = () => {
  const crafts = useMemo(() => SERVICE_CATEGORIES.flatMap(c => c.services), []);
  const programTypes = Array.from(new Set(TRAINING_PROGRAMS.map(p => p.type)));

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
  const [trainingType, setTrainingType] = useState<string>(programTypes[0] || 'internship');
  const [level, setLevel] = useState<string>('');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>('one-time');
  const [notes, setNotes] = useState('');
  const [consentFees, setConsentFees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const toggleCraft = (slug: string) => {
    setSelectedCrafts(prev => (
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/trainingApplications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          emailAddress,
          selectedCrafts,
          trainingType,
          level,
          paymentPlan,
          notes,
          consentFees,
          location: 'studio',
          schedule: 'ongoing',
          createdAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.status) {
        setStatus({ ok: true, message: 'Application submitted! Check your email for confirmation.' });
        setFullName(''); setPhoneNumber(''); setEmailAddress(''); setSelectedCrafts([]); setLevel(''); setNotes(''); setConsentFees(false);
      } else {
        setStatus({ ok: false, message: data.message || 'Something went wrong. Try again.' });
      }
    } catch (err) {
      setStatus({ ok: false, message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-24 pb-28 px-6 sm:px-8 lg:px-20">
      <SEO
        title="Academy Application"
        description="Apply to LashByMotoke Academy — studio-only programs with ongoing enrollment. Choose multiple crafts and flexible payment options."
        keywords="academy application, beauty training application, LashByMotoke Academy"
      />
      <section className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-black text-center">Academy Application</h1>
        <p className="mt-3 text-center text-black/80">Studio-only | Ongoing enrollment | Choose multiple crafts</p>

        <form onSubmit={handleSubmit} className="mt-8 p-6 rounded-2xl bg-white/70 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-black/70 mb-1">Full name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full rounded-xl border border-black/10 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-black/70 mb-1">Phone number</label>
              <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="w-full rounded-xl border border-black/10 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-black/70 mb-1">Email address</label>
              <input type="email" value={emailAddress} onChange={e => setEmailAddress(e.target.value)} required className="w-full rounded-xl border border-black/10 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-black/70 mb-1">Program type</label>
              <select value={trainingType} onChange={e => setTrainingType(e.target.value)} className="w-full rounded-xl border border-black/10 px-3 py-2">
                {programTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-black/70 mb-1">Level (optional)</label>
              <input value={level} onChange={e => setLevel(e.target.value)} placeholder="Beginner / Intermediate / Advanced" className="w-full rounded-xl border border-black/10 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-black/70 mb-1">Payment plan</label>
              <select value={paymentPlan} onChange={e => setPaymentPlan(e.target.value as PaymentPlan)} className="w-full rounded-xl border border-black/10 px-3 py-2">
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm text-black/70 mb-2">Select crafts (choose multiple)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {crafts.map(svc => (
                <label key={svc.slug} className="flex items-center gap-2 p-3 rounded-xl bg-pink-50">
                  <input type="checkbox" checked={selectedCrafts.includes(svc.slug)} onChange={() => toggleCraft(svc.slug)} />
                  <span className="text-black">{svc.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm text-black/70 mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full rounded-xl border border-black/10 px-3 py-2" />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input type="checkbox" checked={consentFees} onChange={e => setConsentFees(e.target.checked)} />
            <span className="text-black/80">I acknowledge potential fees for starter kits or certification.</span>
          </div>

          {status && (
            <div className={`mt-4 p-3 rounded-xl ${status.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{status.message}</div>
          )}

          <div className="mt-6 text-center">
            <button type="submit" disabled={submitting} className="inline-block px-6 py-3 rounded-full bg-pink-200 hover:bg-pink-300 text-black shadow-sm transition-colors disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default AcademyApplyPage;