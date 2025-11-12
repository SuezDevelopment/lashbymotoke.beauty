import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';

interface ResourceItem { _id?: string; title: string; slug: string; status?: string; updatedAt?: string; }

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('resources:read')) return { redirect: { destination: '/admin', permanent: false } };
  const canWrite = permissions.includes('resources:write');
  return { props: { canWrite } };
};

const AdminResourcesPage: NextPage<{ canWrite: boolean }> = ({ canWrite }) => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [form, setForm] = useState<ResourceItem>({ title: '', slug: '', status: 'draft' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/resources');
    const data = await res.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { if (!canWrite) return; setEditing(null); setForm({ title: '', slug: '', status: 'draft' }); setModalOpen(true); };
  const openEdit = (u: ResourceItem) => { if (!canWrite) return; setEditing(u); setForm({ title: u.title, slug: u.slug, status: u.status }); setModalOpen(true); };
  const saveForm = async () => {
    if (!canWrite) return;
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/resources?id=${editing._id || editing.slug}` : '/api/admin/resources';
    const payload: any = editing ? { title: form.title, slug: form.slug, status: form.status } : form;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.status) { setModalOpen(false); setEditing(null); await load(); }
  };
  const deleteItem = async (id?: string) => {
    if (!canWrite) return;
    if (!id) return;
    if (!confirm('Delete this resource?')) return;
    const res = await fetch(`/api/admin/resources?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.status) await load();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Resources</h1>
          {canWrite && <button onClick={openCreate} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Create Resource</button>}
        </div>
        <div className="rounded-xl bg-white/70 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5">
                <th className="p-3">Title</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
                <th className="p-3"/>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="p-3" colSpan={5}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td className="p-3" colSpan={5}>No resources found.</td></tr>}
              {items.map(u => (
                <tr key={u._id || u.slug} className="border-t border-black/10">
                  <td className="p-3">{u.title}</td>
                  <td className="p-3">{u.slug}</td>
                  <td className="p-3">{u.status || '-'}</td>
                  <td className="p-3 text-xs">{u.updatedAt || ''}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {canWrite && <button onClick={() => openEdit(u)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>}
                      {canWrite && u._id && <button onClick={() => deleteItem(u._id)} className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white text-black rounded-2xl p-6 shadow-xl max-w-[90%] md:max-w-[60%] w-full m-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{editing ? 'Edit Resource' : 'Create Resource'}</h2>
                <button onClick={() => setModalOpen(false)} className="px-3 py-1 rounded-full bg-black/10">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="rounded-xl border border-black/10 px-3 py-2" />
                <select value={form.status || 'draft'} onChange={e => setForm({ ...form, status: e.target.value })} className="rounded-xl border border-black/10 px-3 py-2">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-full bg-black/10">Cancel</button>
                <button onClick={saveForm} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminResourcesPage;