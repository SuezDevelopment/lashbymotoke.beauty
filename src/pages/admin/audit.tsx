import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface AuditLog {
  _id?: string;
  createdAt: string;
  actorEmail: string;
  actorRole?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  message?: string;
  details?: any;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } };
  }
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('audit:read')) {
    return { redirect: { destination: '/admin', permanent: false } };
  }
  // SSR load initial logs
  const originProto = (ctx.req.headers['x-forwarded-proto'] || 'http') as string;
  const originHost = ctx.req.headers['host'] as string;
  const origin = `${originProto}://${originHost}`;
  try {
    const res = await fetch(`${origin}/api/admin/auditLogs?limit=50`);
    const data = await res.json();
    return { props: { initial: data.items || [] } };
  } catch (e) {
    return { props: { initial: [] } };
  }
};

const AuditPage = ({ initial }: { initial: AuditLog[] }) => {
  const [logs, setLogs] = useState<AuditLog[]>(initial);
  const [filters, setFilters] = useState<{ actorEmail?: string; action?: string; resource?: string; resourceId?: string; start?: string; end?: string; limit?: number; page?: number }>({ limit: 50, page: 1 });
  const [loading, setLoading] = useState(false);
  const [pruneDays, setPruneDays] = useState<number>(30);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (filters.actorEmail) params.set('actorEmail', filters.actorEmail);
    if (filters.action) params.set('actionContains', filters.action);
    if (filters.resource) params.set('resourceType', filters.resource);
    if (filters.resourceId) params.set('resourceId', filters.resourceId);
    if (filters.start) params.set('start', filters.start);
    if (filters.end) params.set('end', filters.end);
    params.set('limit', String(filters.limit || 50));
    params.set('page', String(filters.page || 1));
    return params;
  };

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/auditLogs?${buildParams().toString()}`);
    const data = await res.json();
    setLogs(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    // Client refresh on mount to ensure latest
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold text-black mb-4">Audit Logs</h1>
      <div className="p-4 rounded-xl bg-white/70 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm">Actor Email</label>
            <input className="w-full p-2 border rounded" value={filters.actorEmail || ''} onChange={(e) => setFilters({ ...filters, actorEmail: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Action contains</label>
            <input className="w-full p-2 border rounded" value={filters.action || ''} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Resource</label>
            <select className="w-full p-2 border rounded" value={filters.resource || ''} onChange={(e) => setFilters({ ...filters, resource: e.target.value })}>
              <option value="">All</option>
              <option value="user">User</option>
              <option value="service">Service</option>
              <option value="training">Training</option>
              <option value="template">Template</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Resource ID</label>
            <input className="w-full p-2 border rounded" value={filters.resourceId || ''} onChange={(e) => setFilters({ ...filters, resourceId: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">Start</label>
            <input type="datetime-local" className="w-full p-2 border rounded" value={filters.start || ''} onChange={(e) => setFilters({ ...filters, start: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm">End</label>
            <input type="datetime-local" className="w-full p-2 border rounded" value={filters.end || ''} onChange={(e) => setFilters({ ...filters, end: e.target.value })} />
          </div>
          <div className="flex items-end">
            <button onClick={load} className="bg-pink-600 text-white px-4 py-2 rounded w-full">Apply Filters</button>
          </div>
          <div className="flex items-end">
            <a
              href={`/api/admin/auditLogs?${(() => { const p = buildParams(); p.set('format','csv'); return p.toString(); })()}`}
              className="bg-black text-white px-4 py-2 rounded w-full text-center"
              target="_blank"
              rel="noopener noreferrer"
            >Export CSV</a>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm">Items per page</label>
            <input type="number" className="w-full p-2 border rounded" min={1} max={500} value={filters.limit || 50}
              onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })} />
          </div>
          <div>
            <label className="block text-sm">Page</label>
            <input type="number" className="w-full p-2 border rounded" min={1} value={filters.page || 1}
              onChange={(e) => setFilters({ ...filters, page: Number(e.target.value) })} />
          </div>
          <div className="flex items-end gap-2">
            <button className="px-3 py-2 border rounded" onClick={() => { if ((filters.page || 1) > 1) { setFilters({ ...filters, page: (filters.page || 1) - 1 }); setTimeout(load, 0); } }}>Prev</button>
            <button className="px-3 py-2 border rounded" onClick={() => { setFilters({ ...filters, page: (filters.page || 1) + 1 }); setTimeout(load, 0); }}>Next</button>
          </div>
        </div>
        <div className="mt-6 p-3 border rounded-xl bg-white/60">
          <h2 className="text-sm font-semibold mb-2">Retention: Prune old logs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm">Days</label>
              <input type="number" className="w-full p-2 border rounded" min={1} value={pruneDays} onChange={(e) => setPruneDays(Number(e.target.value))} />
            </div>
            <div className="flex items-end">
              <button className="bg-red-600 text-white px-4 py-2 rounded w-full" onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/api/admin/auditPrune', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: pruneDays }) });
                  const data = await res.json();
                  await load();
                  alert(`Pruned ${data.deletedCount || 0} logs before ${data.cutoff}`);
                } catch (e) {
                  alert('Failed to prune logs');
                }
                setLoading(false);
              }}>Prune</button>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-auto w-full">
        <table className="min-w-full bg-white/70 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-left">
              <th className="p-3">Time</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id || `${l.createdAt}_${l.action}`} className="border-t border-black/10">
                <td className="p-3 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-3">{l.actorEmail || '-'}</td>
                <td className="p-3">{l.action}</td>
                <td className="p-3">{[l.resource, l.resourceId].filter(Boolean).join(': ') || '-'}</td>
                <td className="p-3 text-xs">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(l.details || {}, null, 2)}</pre>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td className="p-6 text-center text-black/60" colSpan={5}>{loading ? 'Loading…' : 'No logs found'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AuditPage;