import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';

interface TemplateItem { _id?: string; name: string; content?: string; updatedAt?: string; source?: string }

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('templates:read')) return { redirect: { destination: '/admin', permanent: false } };
  const canWrite = permissions.includes('templates:write');
  return { props: { canWrite } };
};

const AdminEmailTemplatesPage: NextPage<{ canWrite: boolean }> = ({ canWrite }) => {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<TemplateItem | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/emailTemplates');
    const data = await res.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => { if (!canWrite) return; setEditing(null); setName(''); setContent(''); };
  const startEdit = (t: TemplateItem) => { if (!canWrite) return; setEditing(t); setName(t.name); setContent(t.content || ''); };
  const save = async () => {
    if (!canWrite) return;
    if (!name || !content) return alert('name and content are required');
    const res = await fetch('/api/admin/emailTemplates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, content }) });
    const data = await res.json();
    if (data?.status) { setEditing(null); setName(''); setContent(''); await load(); }
  };
  const refreshSingle = async (n: string) => {
    const res = await fetch(`/api/admin/emailTemplates?name=${encodeURIComponent(n)}`);
    const data = await res.json();
    if (data?.item) {
      setItems((prev) => {
        const others = prev.filter(p => p.name !== n);
        return [data.item as TemplateItem, ...others].sort((a,b) => a.name.localeCompare(b.name));
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Email Templates</h1>
          {canWrite && <button onClick={startCreate} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">New Template</button>}
        </div>

        {canWrite && (
          <div className="rounded-2xl bg-white/70 shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Template name (e.g. applications)" className="rounded-xl border border-black/10 px-3 py-2" />
              <div className="text-sm text-black/60 flex items-center">Use {"{{...}}"} placeholders supported by Handlebars.</div>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="HTML content" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2 font-mono text-sm" rows={12} />
            </div>
            <div className="flex items-center justify-end gap-3 mt-4">
              <button onClick={save} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Save Template</button>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-white/70 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5">
                <th className="p-3">Name</th>
                <th className="p-3">Source</th>
                <th className="p-3">Updated</th>
                <th className="p-3"/>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="p-3" colSpan={4}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td className="p-3" colSpan={4}>No templates found.</td></tr>}
              {items.map(t => (
                <tr key={t._id || t.name} className="border-t border-black/10">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3">{t.source || 'database'}</td>
                  <td className="p-3 text-xs">{t.updatedAt || ''}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => refreshSingle(t.name)} className="px-3 py-1 rounded-full bg-black/10">Refresh</button>
                      {canWrite && <button onClick={() => startEdit(t)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && canWrite && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <div className="relative bg-white text-black rounded-2xl p-6 shadow-xl max-w-[90%] md:max-w-[70%] w-full m-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Edit Template: {editing.name}</h2>
                <button onClick={() => setEditing(null)} className="px-3 py-1 rounded-full bg-black/10">Close</button>
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full rounded-xl border border-black/10 px-3 py-2 font-mono text-sm" rows={16} />
              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={save} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmailTemplatesPage;