'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Product } from '../../../types';
import { formatNaira, timeAgo } from '../../../lib/utils';

export default function AdminModerationPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState<'active' | 'out-of-stock' | 'archived'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.products.list({ status: statusFilter, limit: 50 });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load moderation queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleModerate = async (productId: string, status: 'active' | 'archived') => {
    const actionLabel = status === 'active' ? 'activate' : 'archive / suspend';
    if (!confirm(`Are you sure you want to ${actionLabel} this spare part listing?`)) return;

    setActionLoading(productId);
    try {
      await api.products.moderate(productId, status);
      await fetchQueue();
    } catch (err: any) {
      alert(`Moderation failed: ${err.message || 'Error occurred'}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-neutral-900">
            Product Listing Moderation Queue
          </h2>
          <p className="font-body text-xs text-neutral-500 mt-0.5">
            Audit spare parts submissions for accuracy, verified OEM numbers, and genuine photography.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-2xl font-ui text-xs">
          {(['active', 'out-of-stock', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {st} Listings
            </button>
          ))}
        </div>
      </div>

      {/* Moderation Items */}
      {isLoading ? (
        <div className="p-12 text-center text-neutral-400 text-xs font-body bg-white rounded-3xl border border-neutral-200">
          Loading moderation queue...
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 text-xs font-body bg-white rounded-3xl border border-neutral-200 space-y-2">
          <CheckSquare className="w-8 h-8 text-neutral-300 mx-auto" />
          <p>No listings in {statusFilter} status right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const id = p.id || (p as any)._id;
            return (
              <div
                key={id}
                className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4 font-body"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-2xl bg-neutral-50 border border-neutral-200 p-1 flex items-center justify-center flex-shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-neutral-300" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-ui px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700">
                          {p.condition}
                        </span>
                        {p.partBrand && (
                          <span className="font-ui text-[10px] font-bold text-neutral-600 bg-white border border-neutral-200 px-1.5 py-0.5 rounded">
                            {p.partBrand.name}
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400">
                          Posted {timeAgo(p.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-sm text-neutral-900">
                        {p.title}
                      </h3>

                      <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>

                      <div className="flex items-center gap-3 pt-1 text-xs text-neutral-600">
                        <span>
                          Merchant: <strong>{p.supplier?.fullName || 'Verified Dealer'}</strong>
                        </span>
                        {p.partNumber && (
                          <span className="font-mono text-[11px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                            PN: {p.partNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
                    <span className="font-ui text-xl font-black text-neutral-900">
                      {formatNaira(p.discountPrice ?? p.price)}
                    </span>

                    <div className="flex items-center gap-2 font-ui">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-colors"
                        title="View Listing Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {p.status !== 'active' && (
                        <button
                          onClick={() => handleModerate(id, 'active')}
                          disabled={actionLoading === id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Activate Listing
                        </button>
                      )}

                      {p.status !== 'archived' && (
                        <button
                          onClick={() => handleModerate(id, 'archived')}
                          disabled={actionLoading === id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 font-bold text-xs border border-neutral-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Archive / Suspend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
