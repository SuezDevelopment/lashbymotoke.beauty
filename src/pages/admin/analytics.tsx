import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';

type CountSummary = {
  users: number;
  services: number;
  trainings: number;
  applications: number;
  templates: number;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  return { props: {} };
};

const AdminAnalyticsPage: NextPage = () => {
  const [summary, setSummary] = useState<CountSummary>({ users: 0, services: 0, trainings: 0, applications: 0, templates: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, s, t, a, e] = await Promise.all([
          fetch('/api/admin/users').then(r => r.json()).catch(() => ({ items: [] })),
          fetch('/api/admin/services').then(r => r.json()).catch(() => ({ items: [] })),
          fetch('/api/admin/trainingPrograms').then(r => r.json()).catch(() => ({ items: [] })),
          fetch('/api/admin/applications').then(r => r.json()).catch(() => ({ items: [] })),
          fetch('/api/admin/emailTemplates').then(r => r.json()).catch(() => ({ items: [] })),
        ]);
        setSummary({
          users: Array.isArray(u.items) ? u.items.length : 0,
          services: Array.isArray(s.items) ? s.items.length : 0,
          trainings: Array.isArray(t.items) ? t.items.length : 0,
          applications: Array.isArray(a.items) ? a.items.length : 0,
          templates: Array.isArray(e.items) ? e.items.length : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Analytics</h1>
        </div>
        {loading && <div className="mb-4 text-sm text-black/60">Loading metrics…</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black/60 text-sm">Users</div>
            <div className="text-2xl font-bold text-black">{summary.users}</div>
          </div>
          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black/60 text-sm">Services</div>
            <div className="text-2xl font-bold text-black">{summary.services}</div>
          </div>
          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black/60 text-sm">Training Programs</div>
            <div className="text-2xl font-bold text-black">{summary.trainings}</div>
          </div>
          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black/60 text-sm">Applications</div>
            <div className="text-2xl font-bold text-black">{summary.applications}</div>
          </div>
          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black/60 text-sm">Email Templates</div>
            <div className="text-2xl font-bold text-black">{summary.templates}</div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white/70 shadow-sm p-4">
          <div className="text-black font-semibold mb-2">Charts</div>
          <div className="text-black/60 text-sm">Coming soon — we will add charts for trends over time (users, applications, trainings).</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;