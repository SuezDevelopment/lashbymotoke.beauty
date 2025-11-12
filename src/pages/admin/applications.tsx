import React, { useEffect, useMemo, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';

interface ApplicationItem {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  selectedCrafts: string[];
  trainingType: string;
  level?: string;
  paymentPlan: 'one-time' | 'monthly';
  notes?: string;
  location?: string;
  schedule?: string;
  createdAt?: string;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('applications:read')) return { redirect: { destination: '/admin', permanent: false } };
  return { props: {} };
};

const AdminApplicationsPage: NextPage = () => {
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/applications');
    const data = await res.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(a =>
      a.fullName?.toLowerCase().includes(q) ||
      a.emailAddress?.toLowerCase().includes(q) ||
      a.phoneNumber?.toLowerCase().includes(q) ||
      a.trainingType?.toLowerCase().includes(q) ||
      (a.level || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const exportCsv = () => {
    const headers = ['Full Name','Email','Phone','Training Type','Level','Payment Plan','Crafts','Location','Schedule','Notes','Submitted'];
    const rows = filtered.map(a => [
      a.fullName,
      a.emailAddress,
      a.phoneNumber,
      a.trainingType,
      a.level || '',
      a.paymentPlan,
      (a.selectedCrafts || []).join('; '),
      a.location || '',
      a.schedule || '',
      (a.notes || '').replace(/\n/g,' '),
      a.createdAt || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v || '').replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-xl font-semibold text-black">Training Applications</h1>
          <div className="flex items-center gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, phone, type, level" className="rounded-full border border-black/10 px-3 py-2 w-full md:w-96" />
            <button onClick={exportCsv} className="px-4 py-2 rounded-full bg-black/10">Export CSV</button>
          </div>
        </div>
        <div className="rounded-xl bg-white/70 shadow-sm overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead>
              <tr className="bg-black/5">
                <th className="p-3">Full Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Type</th>
                <th className="p-3">Level</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Crafts</th>
                <th className="p-3">Location</th>
                <th className="p-3">Schedule</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="p-3" colSpan={11}>Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td className="p-3" colSpan={11}>No applications found.</td></tr>}
              {filtered.map(a => (
                <tr key={a._id || `${a.emailAddress}-${a.createdAt}`} className="border-t border-black/10">
                  <td className="p-3">{a.fullName}</td>
                  <td className="p-3">{a.emailAddress}</td>
                  <td className="p-3">{a.phoneNumber}</td>
                  <td className="p-3">{a.trainingType}</td>
                  <td className="p-3">{a.level || '-'}</td>
                  <td className="p-3">{a.paymentPlan}</td>
                  <td className="p-3">{(a.selectedCrafts || []).join(', ')}</td>
                  <td className="p-3">{a.location || '-'}</td>
                  <td className="p-3">{a.schedule || '-'}</td>
                  <td className="p-3">{a.notes || '-'}</td>
                  <td className="p-3 text-xs">{a.createdAt || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminApplicationsPage;