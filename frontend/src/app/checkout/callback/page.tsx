'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Package, ArrowRight, Store } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatNaira } from '../../../lib/utils';
import { useCartStore } from '../../../stores/cart-store';

function CallbackContent() {
  const searchParams = useSearchParams();
  const { fetchCart } = useCartStore();

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setIsLoading(false);
      setErrorMessage('No payment reference found in URL.');
      return;
    }

    const verifyTransaction = async () => {
      try {
        const result: any = await api.payments.verify(reference);
        if (result.verified) {
          setIsSuccess(true);
          setOrderDetails(result);
          fetchCart(); // Refresh cart to empty state
        } else {
          setIsSuccess(false);
          setErrorMessage(result.message || 'Payment verification failed');
        }
      } catch (err: any) {
        setIsSuccess(false);
        setErrorMessage(err.message || 'Error verifying payment with Paystack');
      } finally {
        setIsLoading(false);
      }
    };

    verifyTransaction();
  }, [reference, fetchCart]);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Verifying Payment with Paystack...</h2>
        <p className="text-xs text-neutral-500">Please wait while we confirm your payment and notify suppliers.</p>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 bg-white border border-neutral-200 rounded-3xl p-8 shadow-xs">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-black text-neutral-900">Payment Unsuccessful</h2>
        <p className="text-xs text-neutral-500">{errorMessage || 'Your payment could not be confirmed.'}</p>
        <div className="pt-4 flex gap-3 justify-center">
          <Link
            href="/checkout"
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 shadow-xs"
          >
            Try Checkout Again
          </Link>
          <Link
            href="/cart"
            className="px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-800 font-bold text-xs hover:bg-neutral-200"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
          Payment Confirmed
        </span>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Your payment was processed securely via Paystack. The suppliers have received your order details and are preparing your parts.
        </p>

        {/* Transaction Summary */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs space-y-2 mt-6">
          <div className="flex justify-between">
            <span className="text-neutral-500">Payment Reference:</span>
            <span className="font-mono font-semibold text-neutral-800">{reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Amount Paid:</span>
            <span className="font-bold text-orange-600">{formatNaira(orderDetails?.amount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Session ID:</span>
            <span className="font-mono text-neutral-500">{orderDetails?.checkoutSessionId}</span>
          </div>
        </div>

        {/* Created Sub-Orders Breakdown */}
        {orderDetails?.orders && orderDetails.orders.length > 0 && (
          <div className="space-y-3 pt-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Your Supplier Packages ({orderDetails.orders.length}):
            </h4>
            <div className="space-y-2">
              {orderDetails.orders.map((ord: any) => (
                <div
                  key={ord._id || ord.id}
                  className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="font-bold text-neutral-900">{ord.orderNumber}</p>
                      <p className="text-[11px] text-neutral-500">
                        {ord.items?.length || 0} items • Status: <span className="text-emerald-700 uppercase font-bold text-[10px]">{ord.status}</span>
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900">{formatNaira(ord.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Package className="w-4 h-4" /> View My Orders
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Verifying payment...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
