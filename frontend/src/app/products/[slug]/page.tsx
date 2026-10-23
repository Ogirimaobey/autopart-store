'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  Check,
  Zap,
  ArrowLeft,
  Store,
  Package,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Product } from '../../../types';
import { formatNaira } from '../../../lib/utils';
import { useCartStore } from '../../../stores/cart-store';
import { EnquiryModal } from '../../../components/products/EnquiryModal';
import { ProductCard } from '../../../components/products/ProductCard';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const prodData: any = await api.products.get(slug);
        setProduct(prodData);
        setSelectedImage(prodData.images?.[0] || '');

        const related: any = await api.products.getRelated(prodData._id || prodData.id, 4);
        setRelatedProducts(related || []);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addItem(product.id || (product as any)._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (_) {
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-white border border-neutral-200 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-white border border-neutral-200 rounded-lg w-3/4 animate-pulse" />
            <div className="h-6 bg-white border border-neutral-200 rounded-lg w-1/3 animate-pulse" />
            <div className="h-32 bg-white border border-neutral-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Product Not Found</h2>
        <p className="text-sm text-neutral-500">The spare part listing you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="inline-block px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.status === 'out-of-stock' || product.stockQuantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Back Link */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs p-6 flex items-center justify-center">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.title}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300">
                <Package className="w-16 h-16 stroke-[1.5]" />
                <span className="text-xs text-neutral-400 mt-2 font-body">No photo provided</span>
              </div>
            )}
            <span className="font-ui absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase rounded-lg bg-neutral-900 text-white shadow-2xs">
              {product.condition}
            </span>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all bg-white p-1 ${
                    selectedImage === img ? 'border-orange-500 scale-95 shadow-xs' : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Badges & Tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {product.partBrand && (
              <span className="font-ui px-2.5 py-1 rounded-md bg-white border border-neutral-200 font-bold text-neutral-800 shadow-2xs">
                {product.partBrand.isOem ? 'OEM Genuine • ' : ''}{product.partBrand.name}
              </span>
            )}
            {product.category && (
              <span className="font-body px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium">
                {product.category.name}
              </span>
            )}
            {product.partNumber && (
              <span className="font-ui font-mono text-neutral-600 bg-white px-2.5 py-1 rounded-md border border-neutral-200 shadow-2xs">
                OEM Part #: {product.partNumber}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-snug">
            {product.title}
          </h1>

          {/* Pricing & Stock Card */}
          <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-ui text-3xl font-black text-neutral-900">
                  {formatNaira(product.discountPrice ?? product.price)}
                </span>
                {product.discountPrice && (
                  <span className="font-ui text-sm text-neutral-400 line-through">
                    {formatNaira(product.price)}
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-neutral-500 mt-1">Inclusive of VAT • Paystack Protected</p>
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <span className="font-ui inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  Out of Stock
                </span>
              ) : (
                <span className="font-ui inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  In Stock ({product.stockQuantity} available)
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-700">Part Description</h4>
            <p className="font-body text-sm text-neutral-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              {product.description}
            </p>
          </div>

          {/* Buy & Enquire Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="font-ui flex items-center bg-white border border-neutral-300 rounded-xl p-1 text-neutral-900 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold hover:bg-neutral-100 rounded-lg"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="w-8 h-8 flex items-center justify-center font-bold hover:bg-neutral-100 rounded-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`font-ui flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm shadow-xs transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Your Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
                  </>
                )}
              </button>
            </div>

            {/* Enquire Button */}
            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="font-ui w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 shadow-2xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-orange-600" />
              Ask Supplier About Engine Compatibility / Price
            </button>
          </div>

          {/* Verified Supplier Information Card */}
          <div className="p-4 bg-white border border-neutral-200 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900">
                  <span>{product.supplier?.fullName || 'Verified Dealer'}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-neutral-500">Verified Automotive Merchant • Direct Importer</p>
              </div>
            </div>

            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Contact Seller
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle & Engine Compatibility Guide */}
      <section className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Vehicle & Engine Compatibility Guide
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Please crosscheck that your vehicle model and engine code match before ordering.
          </p>
        </div>

        {product.compatibleVehicles && product.compatibleVehicles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-600 uppercase tracking-wider bg-neutral-50">
                  <th className="py-3 px-4 font-bold">Vehicle Make</th>
                  <th className="py-3 px-4 font-bold">Model</th>
                  <th className="py-3 px-4 font-bold">Year Range</th>
                  <th className="py-3 px-4 font-bold">Engine Code (Critical)</th>
                  <th className="py-3 px-4 font-bold">Displacement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {product.compatibleVehicles.map((v, i) => (
                  <tr key={i} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900">{v.vehicleBrandName}</td>
                    <td className="py-3 px-4 text-neutral-800 font-medium">{v.vehicleModel}</td>
                    <td className="py-3 px-4 text-neutral-600">
                      {v.yearStart} - {v.yearEnd || 'Present'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {v.engineNumbers?.map((code) => (
                          <span
                            key={code}
                            className="font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-[11px]"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {v.engineTypes?.join(', ') || 'Standard'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-neutral-500">Universal fitment or compatibility not specified. Click &quot;Ask Supplier&quot; to verify your engine number.</p>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-neutral-900">Similar Spare Parts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id || (rel as any)._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        product={product}
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
}
