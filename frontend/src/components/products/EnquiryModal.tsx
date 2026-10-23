'use client';

import React, { useState } from 'react';
import { X, Send, MessageSquare, ShieldCheck, CheckCircle2, Package } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../lib/api';
import { formatNaira } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-store';
import Link from 'next/link';

interface EnquiryModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryModal = ({ product, isOpen, onClose }: EnquiryModalProps) => {
  const { isAuthenticated } = useAuthStore();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickQuestions = [
    'Is this part compatible with my vehicle engine?',
    'Is this original OEM or aftermarket replacement?',
    'Is price negotiable for bulk purchase?',
    'Can I pick this up directly at your shop today?',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.enquiries.create({
        productId: product.id || (product as any)._id,
        message: message.trim(),
        subject: `Enquiry on: ${product.title}`,
      });
      setIsSuccess(true);
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl text-neutral-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-orange-600 mb-3">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-bold text-lg text-neutral-900">Ask Supplier About This Part</h3>
        </div>

        {/* Product Snapshot */}
        <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 mb-5">
          <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center flex-shrink-0">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Package className="w-6 h-6 text-neutral-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-neutral-900 truncate">{product.title}</h4>
            <p className="text-sm font-black text-orange-600 mt-0.5">
              {formatNaira(product.discountPrice ?? product.price)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supplier: {product.supplier?.fullName || 'Verified Dealer'}</span>
            </div>
          </div>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-neutral-900">Enquiry Sent to Supplier!</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              The supplier has been notified. When they respond, their reply will appear in your enquiries thread.
            </p>
            <div className="pt-3 flex gap-2 justify-center">
              <Link
                href="/enquiries"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors shadow-xs"
              >
                View My Enquiries
              </Link>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* Unauthenticated prompt */
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-neutral-600">
              Please sign in to message suppliers directly and track replies.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/login"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-xs"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold bg-neutral-100 text-neutral-800 rounded-xl hover:bg-neutral-200"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Quick Questions:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => setMessage(q)}
                    className="text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 px-2.5 py-1 rounded-lg transition-colors text-left"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Your Message / Engine Details:
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Include your vehicle model, year, and engine number (e.g. 2AZ-FE, K24A) so the seller can verify..."
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Sending...' : 'Send Enquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
