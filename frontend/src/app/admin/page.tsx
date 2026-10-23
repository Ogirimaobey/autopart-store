'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Tags,
  Users,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminDashboardPage() {
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [brandsCount, setBrandsCount] = useState(0);
  const [pendingSuppliersCount, setPendingSuppliersCount] = useState(0);
  const [pendingProductsCount, setPendingProductsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const [catsRes, brandsRes, suppRes, prodRes]: any = await Promise.all([
        api.categories.list(true).catch(() => []),
        api.brands.getVehicleBrands(true).catch(() => []),
        api.suppliers.getAll({ status: 'pending' }).catch(() => ({ total: 0 })),
        api.products.list({ status: 'pending' }).catch(() => ({ total: 0 })),
      ]);

      const catsList = Array.isArray(catsRes) ? catsRes : catsRes?.data || [];
      const brandsList = Array.isArray(brandsRes) ? brandsRes : brandsRes?.data || [];

      setCategoriesCount(catsList.length);
      setBrandsCount(brandsList.length);
      setPendingSuppliersCount(suppRes.total ?? (suppRes.suppliers?.length || 0));
      setPendingProductsCount(prodRes.total ?? (prodRes.products?.length || 0));
    } catch (err) {
      console.error('Error loading admin overview stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed default Nigerian auto part categories, vehicle brands (Toyota, Honda, Mercedes, etc.), and initial demo data if empty. Continue?')) {
      return;
    }
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res: any = await api.seed();
      setSeedMessage(res.message || 'Database successfully seeded with default taxonomy!');
      await fetchStats();
    } catch (err: any) {
      setSeedMessage(`Seed error: ${err.message || 'Failed to seed database'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const statCards = [
    {
      label: 'Admin Categories',
      value: categoriesCount,
      icon: FolderTree,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/admin/categories',
      desc: 'Active product taxonomy',
    },
    {
      label: 'Vehicle Brands',
      value: brandsCount,
      icon: Tags,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/brands',
      desc: 'Vehicle makes & models',
    },
    {
      label: 'Pending Suppliers',
      value: pendingSuppliersCount,
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/suppliers',
      desc: 'Awaiting verification review',
    },
    {
      label: 'Moderation Queue',
      value: pendingProductsCount,
      icon: CheckSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/moderation',
      desc: 'Product listings review',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-black text-neutral-900">
            Platform Administration
          </h1>
          <p className="font-body text-xs text-neutral-500 mt-0.5">
            Manage spare part taxonomies, review supplier store credentials, and moderate product listings.
          </p>
        </div>

        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="font-ui inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          {isSeeding ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-orange-400" />
          )}
          {isSeeding ? 'Seeding Database...' : 'Seed Default Taxonomy'}
        </button>
      </div>

      {seedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-body flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{seedMessage}</span>
          </div>
          <button onClick={() => setSeedMessage(null)} className="font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              href={c.href}
              className="bg-white border border-neutral-200 rounded-3xl p-5 hover:border-neutral-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading text-xs font-bold text-neutral-500">{c.label}</span>
                <div className={`p-2.5 rounded-2xl ${c.bg} ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="font-ui text-2xl font-black text-neutral-900 group-hover:text-orange-600 transition-colors">
                {c.value}
              </p>
              <p className="font-body text-[11px] text-neutral-400 mt-1">{c.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="font-heading text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-orange-600" />
              Category Management
            </h3>
            <Link
              href="/admin/categories"
              className="font-ui text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="font-body text-xs text-neutral-600 leading-relaxed">
            Categories are 100% admin-managed. When suppliers add a spare part, they must pick an active category created here.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="font-heading text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              Supplier Verification Queue
            </h3>
            <Link
              href="/admin/suppliers"
              className="font-ui text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="font-body text-xs text-neutral-600 leading-relaxed">
            Review merchant applications from Ladipo and across Nigeria. Approve genuine dealers to enable inventory listing.
          </p>
        </div>
      </div>
    </div>
  );
}
