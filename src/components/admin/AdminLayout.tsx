import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { pathname } = router;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const headerLinkCls = (href: string) => `px-3 py-1.5 rounded-full text-black ${isActive(href) ? 'bg-pink-300' : 'bg-pink-100 hover:bg-pink-200'}`;
  const asideLinkCls = (href: string) => `block px-3 py-2 rounded-lg text-black ${isActive(href) ? 'bg-pink-100' : 'hover:bg-pink-50'}`;
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur border-b border-black/10 flex items-center px-4 sm:px-6 z-30">
        <div className="font-bold text-black">Admin Dashboard</div>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/admin" className={headerLinkCls('/admin')}>Home</Link>
          <Link href="/admin/users" className={headerLinkCls('/admin/users')}>Users</Link>
          <Link href="/admin/services" className={headerLinkCls('/admin/services')}>Services</Link>
          <Link href="/admin/trainings" className={headerLinkCls('/admin/trainings')}>Academy</Link>
          <Link href="/admin/applications" className={headerLinkCls('/admin/applications')}>Applications</Link>
          <Link href="/admin/email-templates" className={headerLinkCls('/admin/email-templates')}>Email Templates</Link>
        </nav>
      </header>
      <div className="pt-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-auto p-4 rounded-xl bg-white/70 shadow-sm">
            <div className="space-y-2">
              <Link href="/admin/users" className={asideLinkCls('/admin/users')}>Users</Link>
              <Link href="/admin/services" className={asideLinkCls('/admin/services')}>Services</Link>
              <Link href="/admin/trainings" className={asideLinkCls('/admin/trainings')}>Academy</Link>
              <Link href="/admin/applications" className={asideLinkCls('/admin/applications')}>Applications</Link>
              <Link href="/admin/email-templates" className={asideLinkCls('/admin/email-templates')}>Email Templates</Link>
              <Link href="/admin/resources" className={asideLinkCls('/admin/resources')}>Resources</Link>
              <Link href="/admin/audit" className={asideLinkCls('/admin/audit')}>Audit Logs</Link>
              <Link href="/admin/analytics" className={asideLinkCls('/admin/analytics')}>Analytics</Link>
              <Link href="/admin/settings" className={asideLinkCls('/admin/settings')}>Settings</Link>
            </div>
          </aside>
          <main className="min-h-[60vh]">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;