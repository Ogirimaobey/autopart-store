'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Store,
  Package,
} from 'lucide-react';
import { useCartStore } from '../../stores/cart-store';
import { useAuthStore } from '../../stores/auth-store';
import { formatNaira } from '../../lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { cart, totalItems, isLoading, fetchCart, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingCart className="w-16 h-16 text-neutral-400 mx-auto" />
        <h2 className="text-2xl font-bold text-neutral-900">Your Cart is Waiting</h2>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">
          Please sign in to view and synchronize your spare parts shopping cart across your devices.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs inline-block shadow-xs"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 bg-white rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!cart || !cart.supplierGroups || cart.supplierGroups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">
          Search parts by engine code or vehicle brand to add items to your cart.
        </p>
        <div className="pt-2">
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs inline-block shadow-xs"
          >
            Browse Spare Parts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-orange-600" />
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Parts are organized by merchant supplier for coordinated packaging and fulfillment.
          </p>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Supplier-Grouped Items (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {cart.supplierGroups.map((group) => (
            <div
              key={group.supplier.id}
              className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs"
            >
              {/* Supplier Group Header */}
              <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Package Fulfilled by: {group.supplier.fullName || 'Verified Dealer'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-neutral-600">
                  Subtotal: <strong className="text-neutral-900">{formatNaira(group.supplierSubtotal)}</strong>
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-neutral-100 p-5 space-y-4">
                {group.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 first:pt-0"
                  >
                    {/* Item Image & Title */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-200 p-1 flex items-center justify-center flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-neutral-300" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-bold text-sm text-neutral-900 hover:text-orange-600 transition-colors line-clamp-1"
                        >
                          {item.product.title}
                        </Link>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Unit Price: <span className="text-orange-600 font-semibold">{formatNaira(item.product.effectivePrice)}</span>
                        </p>
                        {item.product.partNumber && (
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            Part #: {item.product.partNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector & Item Total */}
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="flex items-center bg-white border border-neutral-300 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold hover:bg-neutral-100 rounded text-neutral-700"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold hover:bg-neutral-100 rounded text-neutral-700"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-black text-neutral-900 min-w-[80px] text-right">
                        {formatNaira(item.subtotal)}
                      </span>

                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-6 sticky top-28 shadow-xs">
            <h3 className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="font-body space-y-3 text-xs border-b border-neutral-200 pb-4">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal:</span>
                <span className="font-ui font-bold text-neutral-900">{formatNaira(cart.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Suppliers Involved:</span>
                <span className="font-ui font-bold text-neutral-900">{cart.supplierGroups.length} vendors</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Estimated Shipping:</span>
                <span className="text-emerald-600 font-semibold">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-heading text-sm font-bold text-neutral-900">Total:</span>
              <span className="font-ui text-2xl font-black text-orange-600">
                {formatNaira(cart.grandTotal)}
              </span>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="font-ui w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all active:scale-95"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Payments protected with 256-bit Paystack encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
