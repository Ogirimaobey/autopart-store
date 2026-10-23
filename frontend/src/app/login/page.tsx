'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res: any = await login({ email, password });
      if (res?.user?.role === 'supplier') {
        router.push('/dashboard');
      } else {
        router.push('/products');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-neutral-500">Sign in to your AutoPartPro buyer or supplier account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-neutral-700">Password</label>
              <span className="text-[11px] text-orange-600 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white shadow-xs transition-all active:scale-95"
          >
            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-bold text-orange-600 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
