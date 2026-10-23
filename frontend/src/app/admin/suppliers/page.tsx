'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Search,
  ShieldCheck,
  Store,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { api } from '../../../lib/api';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res: any = await api.suppliers.getAll(params);
      setSuppliers(res.suppliers || res || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter]);

  const handleReview = async (supplierId: string, newStatus: 'approved' | 'rejected') => {
    const actionLabel = newStatus === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${actionLabel} this supplier?`)) return;

    setIsReviewing(true);
    try {
      await api.suppliers.review(supplierId, {
        status: newStatus,
        verificationNotes: `Reviewed and ${newStatus} by Administrator`,
      });
      await fetchSuppliers();
    } catch (err: any) {
      alert(`Review action failed: ${err.message || 'Error occurred'}`);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-neutral-900">
            Supplier Verification & Approvals
          </h2>
          <p className="font-body text-xs text-neutral-500 mt-0.5">
            Verify automotive spare parts dealers and importers before their inventory goes live.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-2xl font-ui text-xs">
          {['pending', 'approved', 'rejected', ''].map((st) => (
            <button
              key={st || 'all'}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Cards List */}
      {isLoading ? (
        <div className="p-12 text-center text-neutral-400 text-xs font-body bg-white rounded-3xl border border-neutral-200">
          Loading supplier applications...
        </div>
      ) : suppliers.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 text-xs font-body bg-white rounded-3xl border border-neutral-200 space-y-2">
          <Store className="w-8 h-8 text-neutral-300 mx-auto" />
          <p>No {statusFilter ? `${statusFilter} ` : ''}suppliers currently in queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suppliers.map((s) => {
            const id = s.id || s._id;
            return (
              <div
                key={id}
                className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4 font-body"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-base font-heading">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-neutral-900 flex items-center gap-2">
                        {s.businessName || 'Unnamed Business'}
                        {s.isVerified && (
                          <span title="Verified">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        Owner: <strong>{s.user?.fullName || s.fullName || 'N/A'}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-ui px-3 py-1 rounded-full text-xs font-bold uppercase self-start sm:self-auto ${
                      s.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : s.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                {/* Contact & Stall Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span>{s.contactPhone || s.user?.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span>{s.user?.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">
                      {s.address?.street
                        ? `${s.address.street}, ${s.address.city || ''}, ${s.address.state || 'Lagos'}`
                        : 'No physical stall address'}
                    </span>
                  </div>
                </div>

                {/* Verification Documents / Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                  <div className="text-[11px] text-neutral-400">
                    CAC / Reg: {s.cacNumber || s.registrationNumber || 'Not specified'} • Joined:{' '}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2 font-ui">
                    {s.status !== 'approved' && (
                      <button
                        onClick={() => handleReview(id, 'approved')}
                        disabled={isReviewing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve Supplier
                      </button>
                    )}

                    {s.status !== 'rejected' && (
                      <button
                        onClick={() => handleReview(id, 'rejected')}
                        disabled={isReviewing}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 font-bold text-xs border border-neutral-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
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
