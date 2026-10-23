'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  Package,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Category } from '../../../types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res: any = await api.categories.list(true);
      setCategories(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setDisplayOrder('0');
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setDisplayOrder(String(cat.displayOrder || 0));
    setIsActive(cat.isActive ?? true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      displayOrder: Number(displayOrder) || 0,
      isActive,
    };

    try {
      if (editingCategory) {
        const id = editingCategory.id || (editingCategory as any)._id;
        await api.categories.update(id, payload);
      } else {
        await api.categories.create(payload);
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const id = cat.id || (cat as any)._id;
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }
    try {
      await api.categories.delete(id);
      await fetchCategories();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Error occurred'}`);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-neutral-900">
            Spare Part Categories (Admin Only)
          </h2>
          <p className="font-body text-xs text-neutral-500 mt-0.5">
            Create and organize categories that suppliers select when listing inventory.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="font-ui inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-3 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <input
          type="text"
          placeholder="Filter categories by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="font-body w-full bg-transparent text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 text-xs font-body">
            Loading categories from database...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs font-body space-y-2">
            <p>No categories found.</p>
            <button
              onClick={openAddModal}
              className="font-ui text-orange-600 font-bold hover:underline"
            >
              + Create First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase font-bold font-heading">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-body">
                {filteredCategories.map((c) => (
                  <tr key={c.id || (c as any)._id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-neutral-900">{c.name}</p>
                          <p className="text-[11px] text-neutral-500 line-clamp-1">
                            {c.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">{c.slug}</td>
                    <td className="py-3 px-4 font-ui font-bold text-neutral-700">{c.displayOrder || 0}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-ui px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-orange-600 hover:bg-neutral-100 transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-heading text-base font-bold text-neutral-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-body">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-body">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Braking System & Rotors"
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brake calipers, brake discs, brake master cylinders..."
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Active (Visible on storefront & product forms)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="font-ui px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="font-ui px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
