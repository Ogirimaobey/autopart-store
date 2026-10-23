'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Search,
  ShoppingCart,
  User as UserIcon,
  MessageSquare,
  Package,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Phone,
  Truck,
  Heart,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { useCartStore } from '../../stores/cart-store';

import { Category } from '../../types';
import { api } from '../../lib/api';

export const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, fetchMe } = useAuthStore();
  const { totalItems, fetchCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    fetchMe();
    fetchCart();
    api.categories
      .list()
      .then((res: any) => {
        setCategories(Array.isArray(res) ? res : res?.data || []);
      })
      .catch(() => {});
  }, [fetchMe, fetchCart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);

    router.push(`/products?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-xs">
      {/* 1. Slim Top Utility Bar (Neutral Light Tone) */}
      <div className="bg-neutral-100/80 border-b border-neutral-200 text-xs text-neutral-600 py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-neutral-700">
              <Truck className="w-3.5 h-3.5 text-orange-600" /> Nationwide Delivery across Nigeria
            </span>
            <span className="text-neutral-400">|</span>
            <span className="flex items-center gap-1.5 text-neutral-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sourced from Verified Ladipo & Port Importers
            </span>
          </div>
          <div className="flex items-center gap-5 text-neutral-600">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-neutral-400" /> Support: +234 (0) 800-AUTOPARTS
            </span>
            <span>NGN (₦)</span>
            {user?.role === 'admin' ? (
              <Link href="/admin" className="text-orange-600 font-bold hover:underline flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" /> Admin Panel
              </Link>
            ) : user?.role === 'supplier' ? (
              <Link href="/dashboard" className="text-orange-600 font-semibold hover:underline">
                Supplier Dashboard
              </Link>
            ) : (
              <Link href="/register" className="text-orange-600 font-semibold hover:underline">
                Sell Parts on AutoPartPro
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Header (White, Logo, Full-width Search, Utility Icons) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm group-hover:bg-orange-700 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading text-2xl font-black tracking-tight text-neutral-900 flex items-center">
                AUTOPART<span className="text-orange-600">PRO</span>
              </span>
              <span className="font-body text-[10px] tracking-wider text-neutral-500 font-semibold uppercase block -mt-1">
                Genuine Vehicle Parts
              </span>
            </div>
          </Link>

          {/* Search Bar with Category Select */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl items-center bg-neutral-50 border border-neutral-300 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all shadow-2xs"
          >
            {/* Category Dropdown from Live API */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-neutral-700 border-r border-neutral-300 px-3 py-3 focus:outline-none cursor-pointer max-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || (c as any)._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Input */}
            <input
              type="text"
              placeholder="Search part name, OEM part number, or engine code (e.g. 2GR-FE, K24A)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-neutral-900 placeholder-neutral-400 px-4 py-3 focus:outline-none"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3.5 flex items-center justify-center transition-colors font-semibold"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Utility Icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Enquiries / Messages */}
            {isAuthenticated && (
              <Link
                href="/enquiries"
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-orange-600 transition-colors p-2 rounded-lg hover:bg-neutral-100"
                title="My Enquiries"
              >
                <MessageSquare className="w-5 h-5 text-neutral-600" />
                <span>Enquiries</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 text-neutral-800 hover:text-orange-600 transition-colors bg-white shadow-2xs group"
              title="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="font-ui absolute -top-1.5 -right-1.5 bg-orange-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white shadow-2xs transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold font-ui">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-heading text-xs font-bold text-neutral-800 leading-tight truncate max-w-[100px]">
                      {user.fullName.split(' ')[0]}
                    </p>
                    <span className="font-ui text-[10px] text-neutral-500 uppercase font-bold block">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl py-2 z-50 text-xs font-body"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-neutral-100">
                      <p className="font-heading font-bold text-neutral-900 truncate">{user.fullName}</p>
                      <p className="text-neutral-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-orange-600 hover:bg-neutral-50 font-bold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                        Admin Control Panel
                      </Link>
                    )}

                    {user.role === 'supplier' && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-orange-600 font-semibold transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-orange-600" />
                        Supplier Dashboard
                      </Link>
                    )}

                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-orange-600 transition-colors"
                    >
                      <Package className="w-4 h-4 text-neutral-500" />
                      My Orders
                    </Link>

                    <Link
                      href="/enquiries"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 hover:text-orange-600 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-neutral-500" />
                      My Enquiries
                    </Link>

                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 font-ui">
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs font-bold text-neutral-700 hover:text-orange-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="flex items-center bg-neutral-100 border border-neutral-300 rounded-xl overflow-hidden px-3 py-1.5">
            <Search className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search parts, engine code (e.g. 2AZ-FE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-900 placeholder-neutral-400 py-1 focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* 3. Secondary Category Navigation Row (Live Categories from API) */}
      <div className="bg-white border-t border-neutral-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 h-11 overflow-x-auto text-xs font-semibold text-neutral-700 whitespace-nowrap">
            <Link
              href="/products"
              className="hover:text-orange-600 transition-colors py-2 border-b-2 border-transparent hover:border-orange-600"
            >
              All Parts
            </Link>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id || (cat as any)._id}
                href={`/products?category=${cat.slug}`}
                className="hover:text-orange-600 transition-colors py-2 border-b-2 border-transparent hover:border-orange-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-4 space-y-2 text-xs">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-semibold text-neutral-800 hover:text-orange-600"
          >
            All Parts
          </Link>
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id || (cat as any)._id}
              href={`/products?category=${cat.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 font-semibold text-neutral-800 hover:text-orange-600"
            >
              {cat.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-neutral-100 space-y-1">
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-neutral-600"
            >
              My Orders
            </Link>
            <Link
              href="/enquiries"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-neutral-600"
            >
              My Enquiries
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-orange-600 font-bold"
              >
                Admin Control Panel
              </Link>
            )}
            {user?.role === 'supplier' && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-orange-600 font-bold"
              >
                Supplier Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
