'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Store } from 'lucide-react';
import { api } from '../../lib/api';
import { Order } from '../../types';
import { formatNaira, timeAgo } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-store';

export default function BuyerOrdersPage() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res: any = await api.orders.getBuyerOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">Sign In to View Orders</h2>
        <Link href="/login" className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs inline-block">
          Sign In
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    ready_for_pickup: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-orange-600" />
            My Orders
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Track delivery and fulfillment of your spare parts.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-white border border-neutral-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id || (order as any)._id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-neutral-300 transition-colors"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900">{order.orderNumber}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-neutral-500">{timeAgo(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full uppercase font-bold text-[10px] border ${
                      statusColors[order.status] || 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-black text-neutral-900 text-sm">{formatNaira(order.totalAmount)}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 p-1 flex items-center justify-center flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-neutral-900 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Qty: {item.quantity} × {formatNaira(item.unitPrice)}
                          {item.partNumber && ` • Part #: ${item.partNumber}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-800">{formatNaira(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-500 gap-2">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-orange-600" />
                  <span>Supplier: {order.supplier?.fullName || 'Verified Dealer'}</span>
                </div>
                <div>
                  <span>Deliver to: {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-neutral-200 rounded-3xl p-8 space-y-4 shadow-xs">
          <Package className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="text-lg font-bold text-neutral-900">No Orders Placed Yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            When you purchase automotive spare parts, your orders and tracking updates will appear here.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
