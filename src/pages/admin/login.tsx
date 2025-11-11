import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const AdminLoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push('/admin');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white/80 backdrop-blur p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-black mb-4 text-center">Admin Sign In</h1>
        <label className="block text-sm text-black/70 mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full text-black/70 rounded-xl border border-black/10 px-3 py-2 mb-3" />
        <label className="block text-sm text-black/70 mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full text-black/70 rounded-xl border border-black/10 px-3 py-2 mb-3" />
        {error && <div className="mb-3 p-2 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-black shadow-sm transition-colors disabled:opacity-60">{loading ? 'Signing in…' : 'Sign In'}</button>
      </form>
    </main>
  );
};

export default AdminLoginPage;