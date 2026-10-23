'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Truck, CheckCircle2, ChevronDown } from 'lucide-react';
import { api } from '../../../lib/api';
import { Order } from '../../../types';
import { formatNaira, timeAgo } from '../../../lib/utils';

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res: any = await api.orders.getSupplierOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load supplier orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.orders.updateStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      alert('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">Customer Orders</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Fulfill and dispatch orders placed for your spare parts.
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {orders.map((ord) => (
              <div key={ord.id || (ord as any)._id} className="p-5 space-y-4 hover:bg-neutral-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 text-sm">{ord.orderNumber}</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-neutral-500">{timeAgo(ord.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-neutral-900">{formatNaira(ord.totalAmount)}</span>
                    <div className="relative">
                      <select
                        disabled={updatingId === (ord.id || (ord as any)._id)}
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id || (ord as any)._id, e.target.value)}
                        className={`text-[11px] font-bold uppercase rounded-xl border px-3 py-1.5 focus:outline-none cursor-pointer ${
                          statusColors[ord.status] || 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="ready_for_pickup">Ready For Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-2 pt-1">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                      <div>
                        <p className="font-bold text-neutral-900">{it.title}</p>
                        <p className="text-[11px] text-neutral-500">
                          Qty: {it.quantity} × {formatNaira(it.unitPrice)}
                          {it.partNumber && ` • Part #: ${it.partNumber}`}
                        </p>
                      </div>
                      <span className="font-bold text-neutral-900">{formatNaira(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Customer Details */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100 gap-1">
                  <div>
                    Customer: <strong className="text-neutral-800">{ord.shippingAddress?.fullName}</strong> ({ord.shippingAddress?.phone})
                  </div>
                  <div>
                    Destination: {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <ShoppingCart className="w-12 h-12 text-neutral-400 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-800">No Orders Placed Yet</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              When buyers purchase your parts, their delivery orders will appear here for processing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
