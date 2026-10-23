'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Store,
  MapPin,
  Lock,
} from 'lucide-react';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { api } from '../../lib/api';
import { formatNaira } from '../../lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [deliveryType, setDeliveryType] = useState<'shipping' | 'pickup'>('shipping');
  const [notes, setNotes] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user, fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Lock className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Please Sign In to Checkout</h2>
        <p className="text-xs text-neutral-500">You must be signed in to place and track your orders.</p>
        <button
          onClick={() => router.push('/login?redirect=/checkout')}
          className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!cart || !cart.supplierGroups || cart.supplierGroups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-500">Add parts to your cart before proceeding to checkout.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
        >
          Browse Parts
        </button>
      </div>
    );
  }

  const handlePayWithPaystack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city) {
      setError('Please fill in all required delivery information.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create orders from cart grouped by supplier
      const checkoutRes: any = await api.orders.checkout({
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          country: 'Nigeria',
          notes,
        },
        deliveryType,
        notes,
      });

      const { checkoutSessionId } = checkoutRes;

      // 2. Initialize Paystack transaction
      const frontendUrl = window.location.origin;
      const callbackUrl = `${frontendUrl}/checkout/callback`;

      const paymentRes: any = await api.payments.initialize(
        checkoutSessionId,
        callbackUrl,
      );

      if (paymentRes.authorizationUrl) {
        window.location.href = paymentRes.authorizationUrl;
      } else {
        throw new Error('Failed to obtain payment authorization URL from Paystack');
      }
    } catch (err: any) {
      setError(err.message || 'Checkout processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const states = [
    'Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Anambra', 'Delta', 'Ogun',
    'Kaduna', 'Enugu', 'Edo', 'Imo', 'Plateau', 'Akwa Ibom', 'Ondo', 'Osun'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-orange-600" />
          Checkout & Payment
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Enter destination details and pay securely using Paystack.
        </p>
      </div>

      <form onSubmit={handlePayWithPaystack} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl">
              {error}
            </div>
          )}

          {/* Delivery Method */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-600" />
              Delivery Option
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('shipping')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  deliveryType === 'shipping'
                    ? 'bg-orange-50/60 border-orange-500 text-neutral-900'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <p className="text-xs font-bold text-neutral-900">Doorstep Delivery</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Direct to workshop or home</p>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-orange-50/60 border-orange-500 text-neutral-900'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <p className="text-xs font-bold text-neutral-900">Market / Hub Pickup</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Collect at supplier stall (e.g. Ladipo)</p>
              </button>
            </div>
          </div>

          {/* Shipping Address Form */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              Recipient & Destination Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Emeka Adeleke"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address / Workshop Location *</label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 24 Kudirat Abiola Way, Oregun"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">City / Area *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ikeja"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Delivery Notes (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate code, closest landmark, mechanic contact..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Supplier Package Summary & Paystack Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-5 shadow-xs">
            <h3 className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Package Breakdown by Supplier
            </h3>

            {/* Supplier Packages */}
            <div className="space-y-3">
              {cart.supplierGroups.map((group, idx) => (
                <div key={group.supplier.id} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs font-body">
                  <div className="flex items-center justify-between font-bold text-neutral-900 mb-2">
                    <span className="font-heading flex items-center gap-1.5 text-orange-600">
                      <Store className="w-3.5 h-3.5" /> Package {idx + 1}: {group.supplier.fullName}
                    </span>
                    <span className="font-ui font-bold">{formatNaira(group.supplierSubtotal)}</span>
                  </div>
                  <div className="space-y-1 text-neutral-600 text-[11px]">
                    {group.items.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <span className="truncate max-w-[200px]">{item.quantity}x {item.product.title}</span>
                        <span className="font-ui font-semibold">{formatNaira(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="font-body border-t border-neutral-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal:</span>
                <span className="font-ui text-neutral-900 font-bold">{formatNaira(cart.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping:</span>
                <span className="font-ui text-emerald-600 font-semibold">Free Promo</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-neutral-200 text-sm">
                <span className="font-heading font-bold text-neutral-900">Total to Pay:</span>
                <span className="font-ui text-2xl font-black text-orange-600">
                  {formatNaira(cart.grandTotal)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="font-ui w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white shadow-xs transition-all active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              {isProcessing ? 'Connecting to Paystack...' : `Pay ${formatNaira(cart.grandTotal)} with Paystack`}
            </button>

            <div className="text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secured by Paystack 256-bit encryption</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
