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
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const role = (session as any).role || (session as any).user?.role || 'viewer';
  const permissions: string[] = (session as any).permissions || (session as any).user?.permissions || [];
  return { props: { role, permissions } };
};

const AdminHomePage: NextPage<{ role: string; permissions: string[] }> = ({ role, permissions }) => {
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

  const cards = [
    { href: '/admin/users', title: 'Users', count: summary.users, desc: 'Manage admin users, roles, and permissions.', perm: 'users:read' },
    { href: '/admin/services', title: 'Services', count: summary.services, desc: 'Configure service categories and offerings.', perm: 'services:read' },
    { href: '/admin/trainings', title: 'Trainings', count: summary.trainings, desc: 'Manage training programs and levels.', perm: 'trainings:read' },
    { href: '/admin/applications', title: 'Applications', count: summary.applications, desc: 'View training applications and statuses.', perm: 'applications:read' },
    { href: '/admin/email-templates', title: 'Email Templates', count: summary.templates, desc: 'Edit and save email templates.', perm: 'templates:read' },
    { href: '/admin/resources', title: 'Resources', count: undefined, desc: 'Create and manage site resources.', perm: 'resources:read' },
    { href: '/admin/audit', title: 'Audit Logs', count: undefined, desc: 'Review admin actions and changes.', perm: 'audit:read' },
    { href: '/admin/analytics', title: 'Analytics', count: undefined, desc: 'View site analytics and admin KPIs.', perm: 'analytics:read' },
    { href: '/admin/settings', title: 'Settings', count: undefined, desc: 'Configure site and admin settings.' },
  ];

  const visibleCards = cards.filter(c => {
    // Settings is visible to all authenticated roles; others require specific read permissions
    if (!c.perm) return true;
    return permissions.includes(c.perm);
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-2">Admin Portal</h1>
        <p className="text-black/60 mb-6">Welcome back. Use the quick links below to manage content and operations.</p>
        {loading && (
          <div className="mb-4 text-sm text-black/60">Loading summary…</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCards.map((c) => (
            <a key={c.href} href={c.href} className="block rounded-2xl bg-white/70 shadow-sm p-4 hover:bg-white transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-black">{c.title}</div>
                  <div className="text-sm text-black/60">{c.desc}</div>
                </div>
                {typeof c.count === 'number' && (
                  <div className="text-2xl font-bold text-pink-600">{c.count}</div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHomePage;