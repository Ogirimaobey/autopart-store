'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Store,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'supplier')) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, user, isLoading, router]);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Parts Inventory', href: '/dashboard/products', icon: Package },
    { label: 'Customer Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { label: 'Enquiries Inbox', href: '/dashboard/enquiries', icon: MessageSquare },
    { label: 'Store Settings', href: '/dashboard/profile', icon: Store },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 transition-colors shadow-2xs"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
                Supplier Portal
              </span>
              <h1 className="text-xl font-black text-neutral-900">
                {user?.fullName || 'Supplier'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Merchant</span>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-neutral-600 hover:text-orange-600 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white shadow-2xs"
            >
              View Public Storefront
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Sidebar Nav (3 cols) */}
          <aside className="lg:col-span-3 space-y-1">
            <div className="bg-white border border-neutral-200 rounded-3xl p-3 shadow-xs space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Supplier Tip */}
            <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-3xl text-xs text-neutral-700 space-y-2 mt-4">
              <p className="font-bold flex items-center gap-1.5 text-orange-800">
                <Wrench className="w-3.5 h-3.5 text-orange-600" /> Pro Tip: Engine Codes
              </p>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Adding engine codes (e.g. 2GR-FE, K24A) to your listings increases search conversions by 3× in Nigeria.
              </p>
            </div>
          </aside>

          {/* Main Dashboard Panel (9 cols) */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
