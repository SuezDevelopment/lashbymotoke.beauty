import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';

interface TrainingItem { _id?: string; name: string; type: string; level?: string; description?: string; updatedAt?: string; }

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('trainings:read')) return { redirect: { destination: '/admin', permanent: false } };
  const canWrite = permissions.includes('trainings:write');
  return { props: { canWrite } };
};

const AdminTrainingsPage: NextPage<{ canWrite: boolean }> = ({ canWrite }) => {
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingItem | null>(null);
  const [form, setForm] = useState<TrainingItem>({ name: '', type: '', level: '', description: '' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/trainingPrograms');
    const data = await res.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { if (!canWrite) return; setEditing(null); setForm({ name: '', type: '', level: '', description: '' }); setModalOpen(true); };
  const openEdit = (u: TrainingItem) => { if (!canWrite) return; setEditing(u); setForm({ name: u.name, type: u.type, level: u.level, description: u.description }); setModalOpen(true); };
  const saveForm = async () => {
    if (!canWrite) return;
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/trainingPrograms?id=${editing._id}` : '/api/admin/trainingPrograms';
    const payload: any = editing ? { name: form.name, type: form.type, level: form.level, description: form.description } : form;
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.status) { setModalOpen(false); setEditing(null); await load(); }
  };
  const deleteItem = async (id?: string) => {
    if (!canWrite) return;
    if (!id) return;
    if (!confirm('Delete this training program?')) return;
    const res = await fetch(`/api/admin/trainingPrograms?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.status) await load();
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Trainings — Programs</h1>
          {canWrite && <button onClick={openCreate} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Create Program</button>}
        </div>
        <div className="rounded-xl bg-white/70 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5">
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Level</th>
                <th className="p-3">Description</th>
                <th className="p-3">Updated</th>
                <th className="p-3"/>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="p-3" colSpan={6}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td className="p-3" colSpan={6}>No training programs found.</td></tr>}
              {items.map(u => (
                <tr key={u._id || u.name} className="border-t border-black/10">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.type}</td>
                  <td className="p-3">{u.level || '-'}</td>
                  <td className="p-3">{u.description || '-'}</td>
                  <td className="p-3 text-xs">{u.updatedAt || ''}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {canWrite && <button onClick={() => openEdit(u)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>}
                      {canWrite && <button onClick={() => deleteItem(u._id)} className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Delete</button>}
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
                <h2 className="text-lg font-semibold">{editing ? 'Edit Program' : 'Create Program'}</h2>
                <button onClick={() => setModalOpen(false)} className="px-3 py-1 rounded-full bg-black/10">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Program name" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Type (internship/workshop/masterclass)" className="rounded-xl border border-black/10 px-3 py-2" />
                <input value={form.level || ''} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="Level (optional)" className="rounded-xl border border-black/10 px-3 py-2" />
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" rows={4} />
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

export default AdminTrainingsPage;