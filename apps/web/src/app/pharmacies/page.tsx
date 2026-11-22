'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { PharmacyDirectory } from '@/components/PharmacyDirectory';
import { ManualPharmacyModal } from '@/components/ManualPharmacyModal';
import { Store, ShieldCheck, MapPin, Plus } from 'lucide-react';

export default function PharmaciesPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.pharmacies.getAll();
      if (res.success && res.data) {
        setStores(res.data);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-brandText-secondary mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="text-primary font-semibold">Pharmacies Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brandText-primary">
            Indore Medical Stores & Pharmacy Network
          </h1>
          <p className="text-xs text-brandText-secondary mt-1">
            Explore verified chemists, medical stores, and pharmacies across all zones of Indore with live inventory stats.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Medical Store Manually</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-border animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <PharmacyDirectory
          stores={stores}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onRefresh={fetchStores}
        />
      )}

      {/* Manual Add Modal */}
      <ManualPharmacyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStoreAdded={() => fetchStores()}
      />
    </div>
  );
}
