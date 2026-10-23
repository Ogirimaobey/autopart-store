'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, X, Car, Wrench, Search } from 'lucide-react';
import { api } from '../../../lib/api';
import { VehicleBrand, PartBrand } from '../../../types';

export default function AdminBrandsPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'parts'>('vehicles');

  // Vehicle Brands State
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vName, setVName] = useState('');
  const [vCountry, setVCountry] = useState('Japan');
  const [vLogo, setVLogo] = useState('');

  // Part Brands State
  const [partBrands, setPartBrands] = useState<PartBrand[]>([]);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pCountry, setPCountry] = useState('Japan');
  const [pIsOem, setPIsOem] = useState(true);
  const [pLogo, setPLogo] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vRes, pRes]: any = await Promise.all([
        api.brands.getVehicleBrands(true).catch(() => []),
        api.brands.getPartBrands(undefined, true).catch(() => []),
      ]);
      setVehicleBrands(Array.isArray(vRes) ? vRes : vRes?.data || []);
      setPartBrands(Array.isArray(pRes) ? pRes : pRes?.data || []);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateVehicleBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.brands.createVehicleBrand({
        name: vName.trim(),
        country: vCountry.trim() || undefined,
        logo: vLogo.trim() || undefined,
        isActive: true,
      });
      setIsVehicleModalOpen(false);
      setVName('');
      setVLogo('');
      await fetchData();
    } catch (err: any) {
      alert(`Error creating vehicle make: ${err.message || 'Failed'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVehicleBrand = async (b: VehicleBrand) => {
    const id = b.id || (b as any)._id;
    if (!confirm(`Delete vehicle make "${b.name}"?`)) return;
    try {
      await api.brands.deleteVehicleBrand(id);
      await fetchData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreatePartBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.brands.createPartBrand({
        name: pName.trim(),
        country: pCountry.trim() || undefined,
        isOem: pIsOem,
        logo: pLogo.trim() || undefined,
        isActive: true,
      });
      setIsPartModalOpen(false);
      setPName('');
      setPLogo('');
      await fetchData();
    } catch (err: any) {
      alert(`Error creating part brand: ${err.message || 'Failed'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePartBrand = async (b: PartBrand) => {
    const id = b.id || (b as any)._id;
    if (!confirm(`Delete part brand "${b.name}"?`)) return;
    try {
      await api.brands.deletePartBrand(id);
      await fetchData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-neutral-900">
            Automotive Brands & Manufacturers
          </h2>
          <p className="font-body text-xs text-neutral-500 mt-0.5">
            Administer vehicle makes (Toyota, Honda, Benz) and component manufacturers (Denso, Bosch, Brembo).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'vehicles' ? (
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="font-ui inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Vehicle Make
            </button>
          ) : (
            <button
              onClick={() => setIsPartModalOpen(true)}
              className="font-ui inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Part Manufacturer
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`font-heading flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'vehicles'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Makes ({vehicleBrands.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('parts')}
          className={`font-heading flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'parts'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Part Brands ({partBrands.length})</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 text-xs font-body">Loading brands...</div>
        ) : activeTab === 'vehicles' ? (
          vehicleBrands.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-xs font-body">
              No vehicle brands added yet. Click &quot;Add Vehicle Make&quot; above or Seed Default Taxonomy.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase font-bold font-heading">
                  <tr>
                    <th className="py-3 px-4">Vehicle Make</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-body">
                  {vehicleBrands.map((b) => (
                    <tr key={b.id || (b as any)._id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-heading font-bold text-neutral-900">{b.name}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">{b.slug}</td>
                      <td className="py-3 px-4 text-neutral-600">{b.country || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteVehicleBrand(b)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete brand"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : partBrands.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs font-body">
            No part brands added yet. Click &quot;Add Part Manufacturer&quot; above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase font-bold font-heading">
                <tr>
                  <th className="py-3 px-4">Brand / Manufacturer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-body">
                {partBrands.map((b) => (
                  <tr key={b.id || (b as any)._id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-heading font-bold text-neutral-900">{b.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-ui px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          b.isOem
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {b.isOem ? 'OEM Genuine' : 'Aftermarket'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{b.country || 'N/A'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePartBrand(b)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete brand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Brand Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-heading text-base font-bold text-neutral-900">Add Vehicle Make</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicleBrand} className="space-y-4 font-body">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Make Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota, Mercedes-Benz, Lexus"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Origin Country</label>
                <input
                  type="text"
                  placeholder="e.g. Japan, Germany, USA"
                  value={vCountry}
                  onChange={(e) => setVCountry(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="font-ui px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="font-ui px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs"
                >
                  {isSaving ? 'Creating...' : 'Create Vehicle Make'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Part Brand Modal */}
      {isPartModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-heading text-base font-bold text-neutral-900">Add Part Manufacturer</h3>
              <button onClick={() => setIsPartModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartBrand} className="space-y-4 font-body">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Manufacturer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosch, Denso, Brembo"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. Germany, Japan"
                  value={pCountry}
                  onChange={(e) => setPCountry(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isOem"
                  checked={pIsOem}
                  onChange={(e) => setPIsOem(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500"
                />
                <label htmlFor="isOem" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Original Equipment Manufacturer (OEM)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsPartModalOpen(false)}
                  className="font-ui px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="font-ui px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs"
                >
                  {isSaving ? 'Creating...' : 'Create Part Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
