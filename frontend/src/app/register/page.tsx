'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, ArrowRight, User, Store } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { registerBuyer, registerSupplier } = useAuthStore();

  const [role, setRole] = useState<'buyer' | 'supplier'>('buyer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Supplier specific
  const [businessName, setBusinessName] = useState('');
  const [marketLocation, setMarketLocation] = useState('Ladipo Market, Lagos');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: any = {
        fullName,
        email,
        phone,
        password,
      };

      if (role === 'supplier') {
        payload.businessName = businessName || fullName + ' Auto Parts';
        payload.businessAddress = {
          street: marketLocation,
          city: 'Mushin / Lagos',
          state: 'Lagos',
          country: 'Nigeria',
        };
        await registerSupplier(payload);
        router.push('/dashboard');
      } else {
        await registerBuyer(payload);
        router.push('/products');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-neutral-500">Join thousands buying and selling genuine auto parts</p>
        </div>

        {/* Account Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'buyer'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <User className="w-4 h-4 text-orange-600" /> Buyer / Mechanic
          </button>
          <button
            type="button"
            onClick={() => setRole('supplier')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'supplier'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Store className="w-4 h-4 text-orange-600" /> Parts Supplier
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Obinna Eze"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Phone Number (WhatsApp) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          {/* Supplier Specific Fields */}
          {role === 'supplier' && (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3 pt-3">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Store className="w-3.5 h-3.5 text-orange-600" /> Supplier Shop Information
              </h4>
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  required={role === 'supplier'}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Ladipo Prime Motors Ltd"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Market Stall / Warehouse Address</label>
                <input
                  type="text"
                  value={marketLocation}
                  onChange={(e) => setMarketLocation(e.target.value)}
                  placeholder="e.g. Line 4 Stall 12, Ladipo Market, Lagos"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white shadow-xs transition-all active:scale-95"
          >
            {isLoading ? 'Creating Account...' : `Register as ${role === 'supplier' ? 'Parts Supplier' : 'Buyer'}`}{' '}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-orange-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
