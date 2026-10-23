'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  Check,
  Package,
} from 'lucide-react';
import { Product } from '../../types';
import { formatNaira, timeAgo } from '../../lib/utils';
import { useCartStore } from '../../stores/cart-store';
import { EnquiryModal } from './EnquiryModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(product.id || (product as any)._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (_) {
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEnquiryOpen(true);
  };

  const hasImage = Boolean(product.images && product.images.length > 0 && product.images[0]);
  const primaryImage = product.images?.[0] || '';

  const conditionColors: Record<string, string> = {
    new: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    used: 'bg-blue-50 text-blue-700 border-blue-200',
    refurbished: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const isOutOfStock = product.status === 'out-of-stock' || product.stockQuantity <= 0;

  // Extract compatible engine codes for badge display
  const engineCodes = Array.from(
    new Set(
      (product.compatibleVehicles || []).flatMap((v) => v.engineNumbers || []),
    ),
  ).slice(0, 3);

  return (
    <>
      <div className="group bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg shadow-xs">
        {/* Image Container with clean light whitespace */}
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/3] bg-neutral-50 p-4 overflow-hidden border-b border-neutral-100"
        >
          <div className="w-full h-full flex items-center justify-center">
            {hasImage ? (
              <img
                src={primaryImage}
                alt={product.title}
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300">
                <Package className="w-10 h-10 stroke-[1.5]" />
                <span className="text-[10px] text-neutral-400 mt-1 font-body">No photo provided</span>
              </div>
            )}
          </div>

          {/* Condition Badge */}
          <span
            className={`font-ui absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
              conditionColors[product.condition] || conditionColors.used
            }`}
          >
            {product.condition}
          </span>

          {/* Part Brand / OEM badge */}
          {product.partBrand && (
            <span className="font-ui absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-md bg-white text-neutral-700 border border-neutral-200 shadow-2xs">
              {product.partBrand.isOem ? 'OEM • ' : ''}
              {product.partBrand.name}
            </span>
          )}

          {/* Time Posted */}
          <span className="font-body absolute bottom-2 left-3 text-[10px] font-medium text-neutral-400">
            {timeAgo(product.createdAt)}
          </span>
        </Link>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Supplier / Verified Flag */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1 font-body">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{product.supplier?.fullName || 'Verified Dealer'}</span>
            </div>

            {/* Title */}
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-heading font-bold text-sm text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                {product.title}
              </h3>
            </Link>

            {/* Part Number & Engine Code Tags */}
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {product.partNumber && (
                <span className="font-ui text-[10px] font-mono text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                  PN: {product.partNumber}
                </span>
              )}
              {engineCodes.map((code) => (
                <span
                  key={code}
                  className="font-ui text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded font-mono"
                  title="Compatible Engine Code"
                >
                  ⚡ {code}
                </span>
              ))}
            </div>
          </div>

          {/* Price & Action Buttons */}
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-ui text-lg font-black text-neutral-900">
                {formatNaira(product.discountPrice ?? product.price)}
              </span>
              {product.discountPrice && (
                <span className="font-ui text-xs text-neutral-400 line-through">
                  {formatNaira(product.price)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`font-ui flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                  </>
                )}
              </button>

              <button
                onClick={handleOpenEnquiry}
                className="font-ui flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                Enquire
              </button>
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal
        product={product}
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </>
  );
};
