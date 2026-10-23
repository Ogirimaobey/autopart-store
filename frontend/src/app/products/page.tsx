'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, PackageX } from 'lucide-react';
import { api } from '../../lib/api';
import { Product, Category, VehicleBrand, PartBrand } from '../../types';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductFilters } from '../../components/products/ProductFilters';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter states initialized from URL params
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState(searchParams.get('vehicleBrand') || '');
  const [selectedPartBrand, setSelectedPartBrand] = useState(searchParams.get('partBrand') || '');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');
  const [engineCode, setEngineCode] = useState(searchParams.get('engineNumber') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [partBrands, setPartBrands] = useState<PartBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch taxonomy filters on mount
  useEffect(() => {
    const fetchMetadata = async () => {
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
        console.error('Error fetching taxonomies:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever filters or page change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page,
          limit: 16,
          sort: sortBy,
        };
        if (q) params.q = q;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedVehicleBrand) params.vehicleBrand = selectedVehicleBrand;
        if (selectedPartBrand) params.partBrand = selectedPartBrand;
        if (selectedCondition) params.condition = selectedCondition;
        if (engineCode) params.engineNumber = engineCode;
        if (minPrice) params.minPrice = Number(minPrice);
        if (maxPrice) params.maxPrice = Number(maxPrice);

        const res: any = await api.products.list(params);
        setProducts(res.products || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    q,
    selectedCategory,
    selectedVehicleBrand,
    selectedPartBrand,
    selectedCondition,
    engineCode,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  // Sync URL search params
  const syncUrlParams = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    });
    router.push(`/products?${params.toString()}`);
  };

  const handleReset = () => {
    setQ('');
    setSelectedCategory('');
    setSelectedVehicleBrand('');
    setSelectedPartBrand('');
    setSelectedCondition('');
    setEngineCode('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Automotive Spare Parts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {isLoading ? 'Searching parts inventory...' : `Showing ${products.length} of ${total} genuine parts`}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-800 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-orange-600" />
          {mobileFilterOpen ? 'Hide Filters' : 'Filter Parts'}
        </button>
      </div>

      {/* Active Filter Tags */}
      {(selectedCategory || selectedVehicleBrand || engineCode || selectedCondition || q) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-neutral-500 font-semibold">Active Filters:</span>
          {q && (
            <span className="text-xs bg-white text-neutral-800 px-3 py-1 rounded-full border border-neutral-300 flex items-center gap-1 shadow-2xs">
              Search: &quot;{q}&quot;
              <button onClick={() => { setQ(''); syncUrlParams({ q: '' }); }} className="text-neutral-400 hover:text-neutral-700 ml-1 font-bold">×</button>
            </span>
          )}
          {engineCode && (
            <span className="text-xs bg-orange-50 text-orange-700 font-mono font-bold px-3 py-1 rounded-full border border-orange-200 flex items-center gap-1 shadow-2xs">
              Engine: {engineCode}
              <button onClick={() => { setEngineCode(''); syncUrlParams({ engineNumber: '' }); }} className="text-orange-500 hover:text-orange-800 ml-1 font-bold">×</button>
            </span>
          )}
          {selectedVehicleBrand && (
            <span className="text-xs bg-white text-neutral-800 px-3 py-1 rounded-full border border-neutral-300 flex items-center gap-1 shadow-2xs">
              Make: {selectedVehicleBrand}
              <button onClick={() => { setSelectedVehicleBrand(''); syncUrlParams({ vehicleBrand: '' }); }} className="text-neutral-400 hover:text-neutral-700 ml-1 font-bold">×</button>
            </span>
          )}
          {selectedCategory && (
            <span className="text-xs bg-white text-neutral-800 px-3 py-1 rounded-full border border-neutral-300 flex items-center gap-1 shadow-2xs">
              Category: {selectedCategory}
              <button onClick={() => { setSelectedCategory(''); syncUrlParams({ category: '' }); }} className="text-neutral-400 hover:text-neutral-700 ml-1 font-bold">×</button>
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-xs text-orange-600 font-bold hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Grid & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilters
            categories={categories}
            vehicleBrands={vehicleBrands}
            partBrands={partBrands}
            selectedCategory={selectedCategory}
            selectedVehicleBrand={selectedVehicleBrand}
            selectedPartBrand={selectedPartBrand}
            selectedCondition={selectedCondition}
            engineCode={engineCode}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            onCategoryChange={(cat) => { setSelectedCategory(cat); setPage(1); syncUrlParams({ category: cat, page: 1 }); }}
            onVehicleBrandChange={(b) => { setSelectedVehicleBrand(b); setPage(1); syncUrlParams({ vehicleBrand: b, page: 1 }); }}
            onPartBrandChange={(p) => { setSelectedPartBrand(p); setPage(1); syncUrlParams({ partBrand: p, page: 1 }); }}
            onConditionChange={(c) => { setSelectedCondition(c); setPage(1); syncUrlParams({ condition: c, page: 1 }); }}
            onEngineCodeChange={(ec) => { setEngineCode(ec); setPage(1); syncUrlParams({ engineNumber: ec, page: 1 }); }}
            onMinPriceChange={(min) => { setMinPrice(min); setPage(1); syncUrlParams({ minPrice: min, page: 1 }); }}
            onMaxPriceChange={(max) => { setMaxPrice(max); setPage(1); syncUrlParams({ maxPrice: max, page: 1 }); }}
            onSortChange={(s) => { setSortBy(s); syncUrlParams({ sort: s }); }}
            onReset={handleReset}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1">
            <ProductFilters
              categories={categories}
              vehicleBrands={vehicleBrands}
              partBrands={partBrands}
              selectedCategory={selectedCategory}
              selectedVehicleBrand={selectedVehicleBrand}
              selectedPartBrand={selectedPartBrand}
              selectedCondition={selectedCondition}
              engineCode={engineCode}
              minPrice={minPrice}
              maxPrice={maxPrice}
              sortBy={sortBy}
              onCategoryChange={(cat) => { setSelectedCategory(cat); setPage(1); syncUrlParams({ category: cat, page: 1 }); }}
              onVehicleBrandChange={(b) => { setSelectedVehicleBrand(b); setPage(1); syncUrlParams({ vehicleBrand: b, page: 1 }); }}
              onPartBrandChange={(p) => { setSelectedPartBrand(p); setPage(1); syncUrlParams({ partBrand: p, page: 1 }); }}
              onConditionChange={(c) => { setSelectedCondition(c); setPage(1); syncUrlParams({ condition: c, page: 1 }); }}
              onEngineCodeChange={(ec) => { setEngineCode(ec); setPage(1); syncUrlParams({ engineNumber: ec, page: 1 }); }}
              onMinPriceChange={(min) => { setMinPrice(min); setPage(1); syncUrlParams({ minPrice: min, page: 1 }); }}
              onMaxPriceChange={(max) => { setMaxPrice(max); setPage(1); syncUrlParams({ maxPrice: max, page: 1 }); }}
              onSortChange={(s) => { setSortBy(s); syncUrlParams({ sort: s }); }}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-white border border-neutral-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id || (product as any)._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-neutral-200 rounded-3xl p-8 space-y-4 shadow-xs">
              <PackageX className="w-12 h-12 text-neutral-400 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900">No Matching Parts Found</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                We couldn&apos;t find parts matching your filter criteria. Try searching with fewer filters or a broader engine code.
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 text-xs font-bold bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-neutral-200">
              <button
                disabled={page <= 1}
                onClick={() => { setPage(page - 1); syncUrlParams({ page: page - 1 }); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-neutral-300 disabled:opacity-40 hover:bg-neutral-50 text-neutral-700 shadow-2xs"
              >
                Previous
              </button>

              <span className="text-xs font-semibold text-neutral-600 px-3">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => { setPage(page + 1); syncUrlParams({ page: page + 1 }); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-neutral-300 disabled:opacity-40 hover:bg-neutral-50 text-neutral-700 shadow-2xs"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
