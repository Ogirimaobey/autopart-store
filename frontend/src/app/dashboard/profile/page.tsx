'use client';

import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Check } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth-store';

export default function SupplierProfilePage() {
  const { user } = useAuthStore();
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile: any = await api.suppliers.getMyProfile();
        if (profile) {
          setBusinessName(profile.businessName || '');
          setPhone(profile.contactPhone || user?.phone || '');
          setStreet(profile.address?.street || '');
          setCity(profile.address?.city || '');
          setState(profile.address?.state || 'Lagos');
        }
      } catch (err) {
        console.error('Failed to load supplier profile:', err);
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.suppliers.updateMyProfile({
        businessName,
        contactPhone: phone,
        address: { street, city, state, country: 'Nigeria' },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to update store settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">Store Settings & Market Stall</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure your merchant shop information shown on your spare parts listings.
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Verified Automotive Supplier Account</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Your store is authorized to list OEM and replacement auto parts with direct Paystack payouts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">Business / Store Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Ladipo Prime Motors Ltd"
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Official WhatsApp Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 803 123 4567"
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Store className="w-3.5 h-3.5 text-orange-600" /> Physical Stall / Warehouse Location
            </h4>

            <div>
              <label className="block font-semibold text-neutral-600 mb-1">Street / Line Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Line 4 Stall 18, Ladipo Market"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-600 mb-1">City / Hub</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mushin / Lagos"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-600 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Changes Saved
                </>
              ) : isSaving ? (
                'Saving...'
              ) : (
                'Save Store Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
