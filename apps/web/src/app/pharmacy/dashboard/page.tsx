'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StockBadge } from '@/components/StockBadge';
import {
  Store,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Trash2,
  Save,
  Check,
  RefreshCw,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function PharmacyDashboardPage() {
  const { user, isLoading, login } = useAuth();

  const [pharmacy, setPharmacy] = useState<any | null>(null);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalListed: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Medicine Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [newQty, setNewQty] = useState(20);
  const [newPrice, setNewPrice] = useState(30);
  const [newMrp, setNewMrp] = useState(35);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [pharmRes, invRes] = await Promise.all([
        api.pharmacies.getMe(),
        api.inventory.getMine({
          q: searchTerm || undefined,
          stockStatus: statusFilter || undefined
        })
      ]);

      if (pharmRes.success) {
        setPharmacy(pharmRes.data);
      }
      if (invRes.success) {
        setInventoryItems(invRes.data);
        if (invRes.summary) setSummary(invRes.summary);
      }
    } catch (err) {
      console.error('Failed to load pharmacy dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [searchTerm, statusFilter]);

  // Load medicines catalog when Add modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      api.medicines.search({ q: medSearchTerm, limit: 50 }).then((res) => {
        if (res.success) {
          setAllMedicines(res.data);
          if (res.data.length > 0 && !selectedMedId) {
            setSelectedMedId(res.data[0].id);
          }
        }
      });
    }
  }, [isAddModalOpen, medSearchTerm]);

  const handleSaveInline = async (item: any) => {
    try {
      await api.inventory.upsert({
        medicineId: item.medicine.id,
        quantity: editQty,
        price: editPrice,
        mrp: item.mrp
      });
      setEditingId(null);
      setSaveSuccessId(item.id);
      setTimeout(() => setSaveSuccessId(null), 3000);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medicine listing?')) return;
    try {
      await api.inventory.deleteItem(id);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const handleAddMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId) return;

    setIsSubmitting(true);
    try {
      await api.inventory.upsert({
        medicineId: selectedMedId,
        quantity: Number(newQty),
        price: Number(newPrice),
        mrp: Number(newMrp)
      });
      setIsAddModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to add medicine to inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brandText-secondary font-medium">Loading pharmacy dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-secondary flex items-center justify-center mx-auto">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brandText-primary mb-1">Pharmacy Portal Login Required</h2>
          <p className="text-xs text-brandText-secondary">Please log in with your verified pharmacy owner account.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={async () => {
              await login({ email: 'apollo.vijaynagar@medkit.in', password: 'password123' });
              fetchDashboardData();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-secondary text-white text-xs font-semibold rounded-xl hover:bg-secondary-hover shadow-2xs"
          >
            ⚡ 1-Click Login: Apollo Vijay Nagar
          </button>
          <Link href="/login" className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-light text-primary">
              <Store className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-brandText-primary">
                {pharmacy ? pharmacy.name : 'Pharmacy Inventory Dashboard'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {pharmacy?.verificationStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Store
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Verification Pending Review
                  </span>
                )}
                {pharmacy && (
                  <span className="text-xs text-slate-400">
                    License: <strong className="text-slate-600 font-mono">{pharmacy.licenseNumber}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine to Store</span>
          </button>

          {pharmacy && (
            <Link
              href={`/pharmacies/${pharmacy.id}`}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-brandText-primary text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Public Store View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Listed
          </span>
          <div className="text-2xl font-bold text-brandText-primary">
            {summary.totalListed}
          </div>
          <span className="text-[11px] text-slate-500">Catalogued medicines</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            In Stock
          </span>
          <div className="text-2xl font-bold text-emerald-600">
            {summary.inStockCount}
          </div>
          <span className="text-[11px] text-slate-500">Available for immediate pickup</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Low Stock
          </span>
          <div className="text-2xl font-bold text-amber-600">
            {summary.lowStockCount}
          </div>
          <span className="text-[11px] text-slate-500">5 units or less remaining</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Out of Stock
          </span>
          <div className="text-2xl font-bold text-rose-600">
            {summary.outOfStockCount}
          </div>
          <span className="text-[11px] text-slate-500">Needs replenishment</span>
        </div>
      </div>

      {/* Inventory Table & Fast Update Section */}
      <div className="bg-white rounded-2xl border border-border shadow-subtle overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your listed stock..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-brandText-primary focus:outline-none"
            >
              <option value="">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <button
              type="button"
              onClick={() => fetchDashboardData()}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh stock data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inventory List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Units Available</th>
                <th className="py-3 px-4">Selling Price (₹)</th>
                <th className="py-3 px-4">MRP (₹)</th>
                <th className="py-3 px-4">Freshness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading store inventory...
                  </td>
                </tr>
              ) : inventoryItems.length > 0 ? (
                inventoryItems.map((item) => {
                  const isEditing = editingId === item.id;
                  const isJustSaved = saveSuccessId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isJustSaved ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brandText-primary">
                          {item.medicine.brandName}
                        </div>
                        <div className="text-[11px] text-slate-400 italic">
                          {item.medicine.genericName} ({item.medicine.strength})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {item.medicine.category}
                      </td>

                      <td className="py-3.5 px-4">
                        <StockBadge status={item.stockStatus} quantity={item.quantity} />
                      </td>

                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editQty}
                            onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 rounded border border-primary text-xs font-bold text-brandText-primary"
                          />
                        ) : (
                          <span className="font-bold text-brandText-primary">
                            {item.quantity} units
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded border border-primary text-xs font-bold text-brandText-primary"
                          />
                        ) : (
                          <span className="font-bold text-brandText-primary">
                            ₹{item.price.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        ₹{item.mrp.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {item.freshnessHoursAgo}h ago
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveInline(item)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 shadow-2xs"
                              >
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditQty(item.quantity);
                                  setEditPrice(item.price);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                              >
                                Edit Stock
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Remove listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No medicine listings found in this store. Click &quot;Add Medicine to Store&quot; above to list your available drugs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine to Store Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-float border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-brandText-primary flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Add Medicine to Store Inventory
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-brandText-secondary block mb-1">
                  Search Central Medicine Catalogue
                </label>
                <input
                  type="text"
                  value={medSearchTerm}
                  onChange={(e) => setMedSearchTerm(e.target.value)}
                  placeholder="Type medicine name to filter catalogue..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs mb-2"
                />

                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                >
                  {allMedicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} ({m.genericName} - {m.strength}) · {m.packSize}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1">
                    Units in Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newQty}
                    onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={newMrp}
                    onChange={(e) => setNewMrp(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-subtle disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
