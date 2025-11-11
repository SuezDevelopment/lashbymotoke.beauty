import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import type { NextPage } from 'next';
import type { Resource } from '@/lib/types';

const AdminResourcesPage: NextPage = () => {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState<Partial<Resource>>({ title: '', slug: '', summary: '', content: '', category: 'General', tags: [], status: 'draft', ctaLabel: '', ctaHref: '' });

  const fetchItems = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', String(limit));
    const res = await fetch(`/api/admin/resources?${params.toString()}`);
    const data = await res.json();
    if (data?.status) setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [q, category, tag, status, page, limit]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', summary: '', content: '', category: 'General', tags: [], status: 'draft', ctaLabel: '', ctaHref: '' });
    setModalOpen(true);
  };
  const openEdit = (it: Resource) => {
    setEditing(it);
    setForm({ ...it });
    setModalOpen(true);
  };
  const saveForm = async () => {
    const payload = { ...form, tags: Array.isArray(form.tags) ? form.tags : [] };
    const url = editing ? `/api/admin/resources?id=${editing._id}` : '/api/admin/resources';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.status) {
      setModalOpen(false);
      setEditing(null);
      await fetchItems();
    }
  };
  const deleteItem = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this resource?')) return;
    const res = await fetch(`/api/admin/resources?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.status) await fetchItems();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Resources Management</h1>
          <button onClick={openCreate} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Create Resource</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="rounded-xl border border-black/10 px-3 py-2" />
          <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag" className="rounded-xl border border-black/10 px-3 py-2" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-black/10 px-3 py-2">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="rounded-xl bg-white/70 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Tags</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
                <th className="p-3"/>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="p-3" colSpan={6}>Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td className="p-3" colSpan={6}>No resources found.</td></tr>
              )}
              {items.map(it => (
                <tr key={it._id} className="border-t border-black/10">
                  <td className="p-3">
                    <div className="font-semibold">{it.title}</div>
                    <div className="text-xs text-black/50">/{it.slug}</div>
                  </td>
                  <td className="p-3">{it.category || '-'}</td>
                  <td className="p-3">{Array.isArray(it.tags) ? it.tags.join(', ') : '-'}</td>
                  <td className="p-3">{it.status}</td>
                  <td className="p-3 text-xs">{it.updatedAt}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <a className="px-3 py-1 rounded-full bg-black/10 hover:bg-black/20" href={`/resources/${it.slug}`} target="_blank" rel="noreferrer">Preview</a>
                      <button onClick={() => openEdit(it)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>
                      <button onClick={() => deleteItem(it._id)} className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1 rounded-full bg-black/10">Prev</button>
          <span className="text-sm">Page {page}</span>
          <button onClick={() => setPage(page + 1)} className="px-3 py-1 rounded-full bg-black/10">Next</button>
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
                <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug (unique)" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={(Array.isArray(form.tags) ? form.tags.join(',') : '')} onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Tags (comma-separated)" className="rounded-xl border border-black/10 px-3 py-2" />
                <select value={form.status || 'draft'} onChange={e => setForm({ ...form, status: e.target.value as any })} className="rounded-xl border border-black/10 px-3 py-2">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <input value={form.heroImage || ''} onChange={e => setForm({ ...form, heroImage: e.target.value })} placeholder="Hero image URL" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.ctaLabel || ''} onChange={e => setForm({ ...form, ctaLabel: e.target.value })} placeholder="CTA label" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.ctaHref || ''} onChange={e => setForm({ ...form, ctaHref: e.target.value })} placeholder="CTA link" className="rounded-xl border border-black/10 px-3 py-2" />
                <textarea value={form.summary || ''} onChange={e => setForm({ ...form, summary: e.target.value })} placeholder="Summary" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" rows={3} />
                <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Content (Markdown/HTML)" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" rows={8} />
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