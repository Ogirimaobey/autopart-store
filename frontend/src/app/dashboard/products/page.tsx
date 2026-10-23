'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  X,
  Zap,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Product, Category, VehicleBrand, PartBrand } from '../../../types';
import { formatNaira } from '../../../lib/utils';

function SupplierProductsContent() {
  const searchParams = useSearchParams();
  const shouldOpenNew = searchParams.get('new') === '1';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [partBrands, setPartBrands] = useState<PartBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(shouldOpenNew);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('used');
  const [partNumber, setPartNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [partBrandId, setPartBrandId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  // Engine code tags
  const [engineCodesText, setEngineCodesText] = useState('');
  const [compatibleMake, setCompatibleMake] = useState('');
  const [compatibleModel, setCompatibleModel] = useState('');
  const [compatibleYearStart, setCompatibleYearStart] = useState('');
  const [compatibleYearEnd, setCompatibleYearEnd] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res: any = await api.products.getMyListings();
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to load supplier products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const loadTaxonomies = async () => {
      try {
        const [cats, vBrands, pBrands]: any = await Promise.all([
          api.categories.list().catch(() => []),
          api.brands.getVehicleBrands().catch(() => []),
          api.brands.getPartBrands().catch(() => []),
        ]);
        setCategories(Array.isArray(cats) ? cats : cats?.data || []);
        setVehicleBrands(Array.isArray(vBrands) ? vBrands : vBrands?.data || []);
        setPartBrands(Array.isArray(pBrands) ? pBrands : pBrands?.data || []);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };
    loadTaxonomies();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setStockQuantity('1');
    setCondition('used');
    setPartNumber('');
    setCategoryId(categories[0]?.id || (categories[0] as any)?._id || '');
    setPartBrandId(partBrands[0]?.id || (partBrands[0] as any)?._id || '');
    setImageUrl('');
    setEngineCodesText('');
    setCompatibleMake('');
    setCompatibleModel('');
    setCompatibleYearStart('');
    setCompatibleYearEnd('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setDescription(prod.description);
    setPrice(String(prod.price));
    setDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setStockQuantity(String(prod.stockQuantity));
    setCondition(prod.condition);
    setPartNumber(prod.partNumber || '');
    setCategoryId((prod.category as any)?._id || prod.category?.id || '');
    setPartBrandId((prod.partBrand as any)?._id || prod.partBrand?.id || '');
    setImageUrl(prod.images?.[0] || '');

    const firstVehicle = prod.compatibleVehicles?.[0];
    if (firstVehicle) {
      setCompatibleMake(firstVehicle.vehicleBrandName);
      setCompatibleModel(firstVehicle.vehicleModel);
      setCompatibleYearStart(String(firstVehicle.yearStart));
      setCompatibleYearEnd(firstVehicle.yearEnd ? String(firstVehicle.yearEnd) : '');
      setEngineCodesText(firstVehicle.engineNumbers?.join(', ') || '');
    }

    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const engineNumbers = engineCodesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: any = {
        title,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stockQuantity: Number(stockQuantity),
        condition,
        partNumber: partNumber || undefined,
        category: categoryId || undefined,
        partBrand: partBrandId || undefined,
        images: imageUrl ? [imageUrl] : undefined,
        compatibleVehicles: [
          {
            vehicleBrandName: compatibleMake,
            vehicleModel: compatibleModel,
            yearStart: Number(compatibleYearStart) || 2005,
            yearEnd: compatibleYearEnd ? Number(compatibleYearEnd) : undefined,
            engineNumbers: engineNumbers.length > 0 ? engineNumbers : ['2GR-FE'],
          },
        ],
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id || (editingProduct as any)._id, payload);
      } else {
        await api.products.create(payload);
      }

      setIsModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.products.delete(id);
      await fetchProducts();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-neutral-900">Spare Parts Inventory</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your automotive spare parts listings, pricing, and stock levels.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Part Listing
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <input
          type="text"
          placeholder="Filter parts by name, OEM part number, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none"
        />
      </div>

      {/* Parts Table */}
      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider bg-neutral-50">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Condition</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id || (p as any)._id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 p-1 flex items-center justify-center flex-shrink-0">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt=""
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-neutral-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 line-clamp-1">{p.title}</p>
                          <p className="text-[11px] text-neutral-500">
                            {p.partNumber ? `Part #: ${p.partNumber}` : p.category?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700">
                        {p.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      {formatNaira(p.discountPrice ?? p.price)}
                    </td>
                    <td className="py-3 px-4 text-neutral-700 font-semibold">{p.stockQuantity}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Edit Part"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id || (p as any)._id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Part"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <Package className="w-12 h-12 text-neutral-400 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-800">No Parts Listed Yet</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Click &quot;Add Part Listing&quot; to begin listing your vehicle parts inventory.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Part Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-5 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-neutral-900">
                {editingProduct ? 'Edit Spare Part Listing' : 'List New Spare Part'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Provide accurate part details and engine codes to ensure buyer fitment.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Part Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Front Brake Caliper Assembly"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45000"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Discount Price (₦)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="38000"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    min="0"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e: any) => setCondition(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value="used">Tokunbo / Used</option>
                    <option value="new">Brand New (OEM)</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id || (c as any)._id} value={c.id || (c as any)._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      No categories found. An administrator must add categories before parts can be categorized.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Part Brand</label>
                  <select
                    value={partBrandId}
                    onChange={(e) => setPartBrandId(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value="">Select Manufacturer (Optional)</option>
                    {partBrands.map((b) => (
                      <option key={b.id || (b as any)._id} value={b.id || (b as any)._id}>
                        {b.name} {b.isOem ? '(OEM)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">OEM Part Number</label>
                  <input
                    type="text"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="e.g. 04465-33450"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Photo Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Vehicle & Engine Compatibility Details */}
              <div className="p-4 bg-orange-50/50 border border-orange-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-orange-600" /> Compatible Vehicles & Engine Numbers
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Make</label>
                    <select
                      value={compatibleMake}
                      onChange={(e) => setCompatibleMake(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs text-neutral-900 cursor-pointer"
                    >
                      <option value="">Select Make</option>
                      {vehicleBrands.map((b) => (
                        <option key={b.id || (b as any)._id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Camry / Corolla"
                      value={compatibleModel}
                      onChange={(e) => setCompatibleModel(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Year Start</label>
                    <input
                      type="text"
                      value={compatibleYearStart}
                      onChange={(e) => setCompatibleYearStart(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">Year End</label>
                    <input
                      type="text"
                      value={compatibleYearEnd}
                      onChange={(e) => setCompatibleYearEnd(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs text-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 mb-1">
                    Compatible Engine Codes (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={engineCodesText}
                    onChange={(e) => setEngineCodesText(e.target.value)}
                    placeholder="2GR-FE, 2AZ-FE, K24A..."
                    className="w-full bg-white border border-neutral-300 rounded-xl p-2 text-xs text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail condition, origin (Tokunbo/Imported), warranty..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Update Part' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupplierProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading inventory...</div>}>
      <SupplierProductsContent />
    </Suspense>
  );
}
