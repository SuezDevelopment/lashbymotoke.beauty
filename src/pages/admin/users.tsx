import React, { useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';
import type { Role, Permission } from '@/lib/types';

interface UserItem {
  _id?: string;
  email: string;
  name?: string;
  role?: Role;
  permissions?: Permission[];
  updatedAt?: string;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('users:read')) return { redirect: { destination: '/admin', permanent: false } };
  return { props: {} };
};

const AdminUsersPage: NextPage = () => {
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form, setForm] = useState<{ email: string; name?: string; role?: Role; password?: string; permissions?: Permission[]; newPassword?: string }>({ email: '', name: '', role: 'viewer', password: '' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ email: '', name: '', role: 'viewer', password: '' }); setModalOpen(true); };
  const openEdit = (u: UserItem) => {
    setEditing(u);
    setForm({ email: u.email, name: u.name, role: (u.role || 'viewer'), permissions: u.permissions });
    setModalOpen(true);
  };
  const saveForm = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/users?id=${editing._id}` : '/api/admin/users';
    const payload = editing ? { name: form.name, role: form.role, permissions: form.permissions, newPassword: form.newPassword } : { email: form.email, name: form.name, role: form.role, password: form.password, permissions: form.permissions };
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.status) { setModalOpen(false); setEditing(null); await load(); }
  };
  const deleteUser = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this user?')) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data?.status) await load();
  };

  const roles: Role[] = ['admin','manager','staff','viewer'];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Users</h1>
          <button onClick={openCreate} className="px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Create User</button>
        </div>
        <div className="rounded-xl bg-white/70 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5">
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Updated</th>
                <th className="p-3"/>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="p-3" colSpan={5}>Loading…</td></tr>}
              {!loading && items.length === 0 && <tr><td className="p-3" colSpan={5}>No users found.</td></tr>}
              {items.map(u => (
                <tr key={u._id || u.email} className="border-t border-black/10">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name || '-'}</td>
                  <td className="p-3">{u.role || 'viewer'}</td>
                  <td className="p-3 text-xs">{u.updatedAt || ''}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="px-3 py-1 rounded-full bg-pink-200 hover:bg-pink-300 text-black">Edit</button>
                      <button onClick={() => deleteUser(u._id)} className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-300 text-black">Delete</button>
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
                <h2 className="text-lg font-semibold">{editing ? 'Edit User' : 'Create User'}</h2>
                <button onClick={() => setModalOpen(false)} className="px-3 py-1 rounded-full bg-black/10">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-xl border border-black/10 px-3 py-2" disabled={!!editing} />
                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-xl border border-black/10 px-3 py-2" />
                <select value={form.role || 'viewer'} onChange={e => setForm({ ...form, role: e.target.value as Role })} className="rounded-xl border border-black/10 px-3 py-2">
                  {roles.map(r => (<option key={r} value={r}>{r}</option>))}
                </select>
                {!editing && (
                  <input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Initial password" className="rounded-xl border border-black/10 px-3 py-2" />
                )}
                {editing && (
                  <input type="password" value={form.newPassword || ''} onChange={e => setForm({ ...form, newPassword: e.target.value })} placeholder="Reset password" className="rounded-xl border border-black/10 px-3 py-2" />
                )}
                <textarea value={Array.isArray(form.permissions) ? form.permissions.join(',') : ''} onChange={e => setForm({ ...form, permissions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) as Permission[] })} placeholder="Permissions (comma-separated)" className="md:col-span-2 rounded-xl border border-black/10 px-3 py-2" rows={3} />
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

export default AdminUsersPage;