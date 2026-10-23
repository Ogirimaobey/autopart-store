'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  FolderTree,
  Tags,
  Users,
  CheckSquare,
  BarChart3,
  ArrowLeft,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login?redirect=/admin');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-neutral-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-xl font-bold text-neutral-900">Access Restricted</h2>
        <p className="font-body text-xs text-neutral-500">
          This portal requires Administrator credentials. Please sign in with an administrative account.
        </p>
        <Link
          href="/login"
          className="font-ui inline-block px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs hover:bg-orange-700 transition-colors"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: BarChart3 },
    { label: 'Categories CRUD', href: '/admin/categories', icon: FolderTree },
    { label: 'Vehicle & Part Brands', href: '/admin/brands', icon: Tags },
    { label: 'Supplier Approvals', href: '/admin/suppliers', icon: Users },
    { label: 'Product Moderation', href: '/admin/moderation', icon: CheckSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Admin Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-black text-sm text-neutral-900 block">
                  Admin Control Panel
                </span>
                <span className="font-ui text-[10px] font-bold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 inline-block mt-0.5">
                  Full Authority
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-heading flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-neutral-100">
              <Link
                href="/products"
                className="font-body flex items-center gap-2 text-xs text-neutral-500 hover:text-orange-600 transition-colors p-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Storefront</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area (9 cols) */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
