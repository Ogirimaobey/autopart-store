'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  Wrench,
  Gauge,
  Flame,
  Clock,
  ChevronRight,
  ChevronLeft,
  Package,
} from 'lucide-react';
import { api } from '../lib/api';
import { Product, Category, VehicleBrand } from '../types';
import { ProductCard } from '../components/products/ProductCard';

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Finder State
  const [finderMake, setFinderMake] = useState('');
  const [finderEngine, setFinderEngine] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, brandsRes, productsRes]: any = await Promise.all([
          api.categories.list().catch(() => []),
          api.brands.getVehicleBrands().catch(() => []),
          api.products.list({ limit: 8, sort: 'popular' }).catch(() => ({ products: [] })),
        ]);

        setCategories(Array.isArray(catsRes) ? catsRes : catsRes?.data || []);
        setBrands(Array.isArray(brandsRes) ? brandsRes : brandsRes?.data || []);
        setFeaturedProducts(productsRes.products || []);
        setTotalProducts(productsRes.total || (productsRes.products?.length || 0));

        const recentRes: any = await api.products
          .list({ limit: 4, sort: 'newest' })
          .catch(() => ({ products: [] }));
        setRecentlyAdded(recentRes.products || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleFinderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (finderMake) params.set('vehicleBrand', finderMake);
    if (finderEngine) params.set('engineNumber', finderEngine);
    router.push(`/products?${params.toString()}`);
  };

  const [totalProducts, setTotalProducts] = useState(0);

  // Derive dynamic engine codes from live product inventory
  const activeEngineCodes = Array.from(
    new Set(
      featuredProducts.flatMap((p) =>
        (p.compatibleVehicles || []).flatMap((v) => v.engineNumbers || [])
      )
    )
  ).slice(0, 6);

  return (
    <div className="space-y-12 pb-16 bg-[#F8F9FA]">
      {/* 1. Hero Section (Clean Light Surface with Lifestyle Anchor & White Finder Card) */}
      <section className="relative bg-white border-b border-neutral-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Headline & Engine Finder Widget (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                Direct from Verified Nigerian Parts Suppliers
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                Find Exact <span className="text-orange-600">Auto Spare Parts</span> by Engine Code.
              </h1>

              <p className="font-body text-neutral-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Avoid costly wrong-fit purchases. Search genuine new and Tokunbo parts by exact engine number (2GR-FE, K24A, 1ZZ-FE), OEM part number, or vehicle model with guaranteed compatibility.
              </p>

              {/* Engine Matcher Card sitting on clean surface */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm max-w-xl">
                <h2 className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-orange-600" />
                  Quick Vehicle & Engine Matcher
                </h2>

                <form onSubmit={handleFinderSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <select
                      value={finderMake}
                      onChange={(e) => setFinderMake(e.target.value)}
                      className="font-body w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
                    >
                      <option value="">Vehicle Make</option>
                      {brands.map((b) => (
                        <option key={b.id || b._id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Engine code (e.g. 2AZ-FE)"
                      value={finderEngine}
                      onChange={(e) => setFinderEngine(e.target.value)}
                      className="font-body w-full bg-white border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500 shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="font-ui w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" /> Find Parts
                  </button>
                </form>

                {/* Popular Engine Pills */}
                {activeEngineCodes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-200/80 flex items-center gap-1.5 flex-wrap">
                    <span className="font-body text-[11px] text-neutral-500 font-medium">In-stock engines:</span>
                    {activeEngineCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => router.push(`/products?engineNumber=${code}`)}
                        className="font-ui text-[10px] font-mono font-bold text-neutral-700 bg-white border border-neutral-200 hover:border-orange-500 hover:text-orange-600 px-2 py-0.5 rounded-md transition-colors shadow-2xs"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Clean Automotive Parts Visual Anchor (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100">
                <img
                  src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80"
                  alt="Quality automotive parts"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-200 shadow-md flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">
                      {totalProducts > 0 ? `${totalProducts} Genuine Parts Listed` : 'Verified Auto Parts'}
                    </p>
                    <p className="text-neutral-500 text-[11px]">Direct fit guarantee or money back</p>
                  </div>
                  <Link
                    href="/products"
                    className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Circular Photo Category Strip (Populated from Live Categories API) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base sm:text-lg font-bold text-neutral-900">
              Shop by Category
            </h2>
            <Link
              href="/products"
              className="font-ui text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Horizontal Circular Photo Row from Live Database Categories */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6 pt-2">
              {categories.slice(0, 8).map((item) => (
                <Link
                  key={item.id || (item as any)._id}
                  href={`/products?category=${item.slug}`}
                  className="group flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-100 border-2 border-neutral-200 group-hover:border-orange-500 overflow-hidden p-1 shadow-2xs transition-all group-hover:scale-105 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Package className="w-7 h-7 text-neutral-400 group-hover:text-orange-600 transition-colors" />
                    )}
                  </div>
                  <span className="font-heading text-[11px] sm:text-xs font-bold text-neutral-800 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500 text-xs font-body">
              No categories available yet. Admin can create categories in the Admin Control Panel.
            </div>
          )}
        </div>
      </section>

      {/* 3. Featured / Trending Parts Grid (White Cards on #F8F9FA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              Featured Products
            </h2>
            <p className="font-body text-xs text-neutral-500 mt-0.5">Top-rated genuine auto parts from verified merchants</p>
          </div>
          <Link
            href="/products?sort=popular"
            className="font-ui text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View More <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-white border border-neutral-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id || (product as any)._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
            <p className="font-body text-sm text-neutral-500">No parts currently available.</p>
          </div>
        )}
      </section>

      {/* 4. Shop By Vehicle Brand (Clean White Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Gauge className="w-5 h-5 text-orange-600" />
              Shop by Vehicle Make
            </h2>
            <p className="font-body text-xs text-neutral-500 mt-0.5">OEM & replacement parts tailored for your vehicle</p>
          </div>
          <Link
            href="/products"
            className="font-ui text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            All Makes <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {brands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {brands.map((b) => (
              <Link
                key={b.id || b._id}
                href={`/products?vehicleBrand=${encodeURIComponent(b.name)}`}
                className="bg-white border border-neutral-200 hover:border-orange-400 rounded-2xl p-4 text-center hover:shadow-md transition-all group shadow-2xs"
              >
                <div className="font-heading w-12 h-12 mx-auto rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center font-black text-orange-600 text-sm mb-2 group-hover:scale-105 transition-transform">
                  {b.name.charAt(0)}
                </div>
                <h4 className="font-heading text-xs font-bold text-neutral-800 group-hover:text-orange-600 transition-colors">
                  {b.name}
                </h4>
                <span className="font-body text-[10px] text-neutral-400 block mt-0.5">View parts →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500 font-body">
            Vehicle brands will appear here once added in the system.
          </div>
        )}
      </section>

      {/* 5. Recently Added Strip */}
      {recentlyAdded.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                New Arrivals
              </h2>
              <p className="font-body text-xs text-neutral-500 mt-0.5">Freshly stocked parts from verified merchants</p>
            </div>
            <Link
              href="/products?sort=newest"
              className="font-ui text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {recentlyAdded.map((product) => (
              <ProductCard key={product.id || (product as any)._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Supplier Banner (Clean Light-Gray Background with Orange Accent CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 overflow-hidden shadow-sm relative">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="font-ui px-3 py-1 rounded-full bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider inline-block">
              For Auto Parts Dealers & Importers
            </span>
            <h3 className="font-heading text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Sell Your Spare Parts to Thousands of Mechanics & Car Owners.
            </h3>
            <p className="font-body text-neutral-300 text-xs sm:text-sm leading-relaxed">
              Expand your sales reach beyond physical stalls in Ladipo. List your vehicle inventory, respond directly to customer engine compatibility questions, and receive automated payouts via Paystack.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="font-ui inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
              >
                Register as a Supplier <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
