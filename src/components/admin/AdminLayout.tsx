import React from 'react';
import Link from 'next/link';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur border-b border-black/10 flex items-center px-4 sm:px-6 z-30">
        <div className="font-bold text-black">Admin Dashboard</div>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/admin" className="px-3 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-black">Home</Link>
          <Link href="/admin/users" className="px-3 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-black">Users</Link>
          <Link href="/admin/applications" className="px-3 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-black">Applications</Link>
        </nav>
      </header>
      <div className="pt-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-auto p-4 rounded-xl bg-white/70 shadow-sm">
            <div className="space-y-2">
              <Link href="/admin/services" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Services</Link>
              <Link href="/admin/trainings" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Academy</Link>
              <Link href="/admin/resources" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Resources</Link>
              <Link href="/admin/email-templates" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Email Templates</Link>
              <Link href="/admin/audit" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Audit Logs</Link>
              <Link href="/admin/bookings" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Bookings</Link>
              <Link href="/admin/analytics" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Analytics</Link>
              <Link href="/admin/settings" className="block px-3 py-2 rounded-lg hover:bg-pink-50 text-black">Settings</Link>
            </div>
          </aside>
          <main className="min-h-[60vh]">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;