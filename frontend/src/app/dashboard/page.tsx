'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatNaira, timeAgo } from '../../lib/utils';
import { Order, Product } from '../../types';

export default function DashboardOverviewPage() {
  const [productsCount, setProductsCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [prodRes, ordersRes, enqRes]: any = await Promise.all([
          api.products.getMyListings().catch(() => ({ total: 0 })),
          api.orders.getSupplierOrders().catch(() => ({ orders: [] })),
          api.enquiries.getSupplierEnquiries().catch(() => ({ enquiries: [] })),
        ]);

        const orderList: Order[] = ordersRes.orders || [];
        setProductsCount(prodRes.total || (prodRes.products?.length || 0));
        setOrders(orderList);
        setEnquiriesCount((enqRes.enquiries || []).length);

        const rev = orderList
          .filter((o) => o.status !== 'cancelled' && o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setTotalRevenue(rev);
      } catch (err) {
        console.error('Error fetching dashboard overview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const stats = [
    {
      label: 'Listed Spare Parts',
      value: productsCount,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/dashboard/products',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/dashboard/orders',
    },
    {
      label: 'Total Sales Revenue',
      value: formatNaira(totalRevenue),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/dashboard/orders',
    },
    {
      label: 'Customer Enquiries',
      value: enquiriesCount,
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/dashboard/enquiries',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
        <div>
          <h2 className="font-heading text-xl font-black text-neutral-900">Inventory & Orders Overview</h2>
          <p className="font-body text-xs text-neutral-500 mt-0.5">
            Manage your automotive spare parts listings, shipments, and customer enquiries.
          </p>
        </div>
        <Link
          href="/dashboard/products?new=1"
          className="font-ui inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Part
        </Link>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="bg-white border border-neutral-200 rounded-3xl p-5 hover:border-neutral-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading text-xs font-bold text-neutral-500">{stat.label}</span>
                <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="font-ui text-2xl font-black text-neutral-900 group-hover:text-orange-600 transition-colors">
                {stat.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Recent Customer Orders
          </h3>
          <Link
            href="/dashboard/orders"
            className="font-ui text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Order #</th>
                  <th className="py-3 px-3 font-semibold">Buyer</th>
                  <th className="py-3 px-3 font-semibold">Date</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id || (ord as any)._id} className="hover:bg-neutral-50">
                    <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-neutral-800">
                      {ord.buyer?.fullName || ord.shippingAddress?.fullName}
                    </td>
                    <td className="py-3 px-3 text-neutral-500">{timeAgo(ord.createdAt)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-neutral-900 text-right">
                      {formatNaira(ord.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-neutral-400 text-xs">
            No orders received yet. Keep your spare parts listings up to date with competitive pricing!
          </div>
        )}
      </div>
    </div>
  );
}
