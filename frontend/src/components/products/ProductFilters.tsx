'use client';

import React from 'react';
import { Filter, RotateCcw, Zap } from 'lucide-react';
import { Category, VehicleBrand, PartBrand } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  vehicleBrands: VehicleBrand[];
  partBrands: PartBrand[];
  selectedCategory: string;
  selectedVehicleBrand: string;
  selectedPartBrand: string;
  selectedCondition: string;
  engineCode: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  onCategoryChange: (cat: string) => void;
  onVehicleBrandChange: (brand: string) => void;
  onPartBrandChange: (brand: string) => void;
  onConditionChange: (cond: string) => void;
  onEngineCodeChange: (code: string) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export const ProductFilters = ({
  categories,
  vehicleBrands,
  partBrands,
  selectedCategory,
  selectedVehicleBrand,
  selectedPartBrand,
  selectedCondition,
  engineCode,
  minPrice,
  maxPrice,
  sortBy,
  onCategoryChange,
  onVehicleBrandChange,
  onPartBrandChange,
  onConditionChange,
  onEngineCodeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onReset,
}: ProductFiltersProps) => {
  const commonEngineCodes = ['2GR-FE', '2AZ-FE', '1ZZ-FE', 'K24A', 'M271', '2AR-FE'];

  return (
    <aside className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-6 text-neutral-800 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="font-heading flex items-center gap-2 font-bold text-neutral-900 text-sm">
          <Filter className="w-4 h-4 text-orange-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="font-ui flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-orange-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset All
        </button>
      </div>

      {/* Engine Code Partial Search - Critical for auto parts */}
      <div className="space-y-2">
        <label className="font-heading text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-orange-600" />
          Engine Code / Number
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. 2GR, 2AZ-FE, K24..."
            value={engineCode}
            onChange={(e) => onEngineCodeChange(e.target.value)}
            className="font-body w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-mono"
          />
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {commonEngineCodes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onEngineCodeChange(code)}
              className={`font-ui text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
                engineCode === code
                  ? 'bg-orange-600 text-white border-orange-600 font-bold'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Brand */}
      <div className="space-y-2">
        <label className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Vehicle Make
        </label>
        <select
          value={selectedVehicleBrand}
          onChange={(e) => onVehicleBrandChange(e.target.value)}
          className="font-body w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
        >
          <option value="">All Vehicle Makes</option>
          {vehicleBrands.map((b) => (
            <option key={b.id || b._id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Part Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="font-body w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id || c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Part Brand */}
      <div className="space-y-2">
        <label className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Parts Manufacturer
        </label>
        <select
          value={selectedPartBrand}
          onChange={(e) => onPartBrandChange(e.target.value)}
          className="font-body w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
        >
          <option value="">All Part Brands</option>
          {partBrands.map((b) => (
            <option key={b.id || b._id} value={b.slug}>
              {b.name} {b.isOem ? '(OEM)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Pills */}
      <div className="space-y-2">
        <label className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Part Condition
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {['', 'new', 'refurbished', 'used'].map((cond) => (
            <button
              key={cond || 'all'}
              type="button"
              onClick={() => onConditionChange(cond)}
              className={`font-ui py-1.5 px-2 text-[11px] font-bold rounded-lg capitalize border transition-colors ${
                selectedCondition === cond
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {cond || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range (in Naira ₦) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Price Range (₦)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₦"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500"
          />
          <input
            type="number"
            placeholder="Max ₦"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
        >
          <option value="newest">Recently Posted</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
};
