import React, { useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/admin/AdminLayout';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) return { redirect: { destination: '/admin/login', permanent: false } };
  const azureConfigured = Boolean(process.env.COMMUNICATION_SERVICE_CONNECTION_STRING);
  const senderConfigured = Boolean(process.env.SENDER_ADDRESS);
  return { props: { azureConfigured, senderConfigured } };
};

const AdminSettingsPage: NextPage<{ azureConfigured: boolean; senderConfigured: boolean }> = ({ azureConfigured, senderConfigured }) => {
  const [to, setTo] = useState('');
  const [template, setTemplate] = useState<'applications'|'bookings'|'raw'>('applications');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(null);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-black">Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black font-semibold mb-2">Email — Azure Communication Service</div>
            <div className="text-sm text-black/70 space-y-1">
              <div>Azure connection string: {azureConfigured ? <span className="text-green-700">Configured</span> : <span className="text-red-700">Not configured</span>}</div>
              <div>Sender address: {senderConfigured ? <span className="text-green-700">Configured</span> : <span className="text-red-700">Not configured</span>}</div>
            </div>
            <div className="text-sm text-black/60 mt-2">
              Configure credentials in your .env file and restart the server.
            </div>
            <div className="mt-3 text-xs text-black/50">
              Expected env keys: COMMUNICATION_SERVICE_CONNECTION_STRING, SENDER_ADDRESS
            </div>
            <div className="mt-4 p-3 border rounded-xl bg-white/60">
              <div className="font-medium mb-2">Send a test email</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-black/60">Recipient</label>
                  <input type="email" className="w-full p-2 border rounded" placeholder="you@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-black/60">Template</label>
                  <select className="w-full p-2 border rounded" value={template} onChange={(e) => setTemplate(e.target.value as any)}>
                    <option value="applications">Applications</option>
                    <option value="bookings">Bookings</option>
                    <option value="raw">Raw HTML</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-black/60">Subject (optional)</label>
                  <input type="text" className="w-full p-2 border rounded" placeholder="Test subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                {template === 'raw' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs text-black/60">Raw HTML content</label>
                    <textarea className="w-full p-2 border rounded" rows={6} placeholder="<p>Hello world</p>" value={content} onChange={(e) => setContent(e.target.value)} />
                  </div>
                )}
                <div className="md:col-span-2 flex items-center gap-3">
                  <button
                    className="px-4 py-2 rounded-full bg-pink-600 text-white disabled:opacity-60"
                    disabled={sending || !to || !azureConfigured}
                    onClick={async () => {
                      setSending(true);
                      setResult(null);
                      try {
                        const res = await fetch('/api/admin/testEmail', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ to, template, subject: subject || undefined, content: template === 'raw' ? content : undefined }),
                        });
                        const data = await res.json();
                        setResult({ ok: !!data.status, message: data.message });
                      } catch (e) {
                        setResult({ ok: false, message: 'Request failed' });
                      }
                      setSending(false);
                    }}
                  >{sending ? 'Sending…' : 'Send Test Email'}</button>
                  {!azureConfigured && (
                    <span className="text-xs text-red-700">Configure COMMUNICATION_SERVICE_CONNECTION_STRING in .env to enable sending.</span>
                  )}
                </div>
                {result && (
                  <div className={`md:col-span-2 p-2 rounded ${result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {result.message || (result.ok ? 'Sent' : 'Failed')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black font-semibold mb-2">Permissions & Roles</div>
            <div className="text-sm text-black/60">Future area to adjust role permissions and assign default RBAC for new users.</div>
          </div>

          <div className="rounded-2xl bg-white/70 shadow-sm p-4">
            <div className="text-black font-semibold mb-2">Site Configuration</div>
            <div className="text-sm text-black/60">We’ll add toggles for maintenance mode, caching strategies, and SEO defaults.</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;