'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StockBadge } from '@/components/StockBadge';
import { ReservationModal } from '@/components/ReservationModal';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Navigation,
  ExternalLink,
  ArrowLeft,
  Pill,
  Search,
  Sparkles,
  BookmarkCheck
} from 'lucide-react';

export default function PharmacyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [pharmacy, setPharmacy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventorySearch, setInventorySearch] = useState('');

  const [resModal, setResModal] = useState<{
    isOpen: boolean;
    pharmacy: any;
    inventory: any;
  }>({
    isOpen: false,
    pharmacy: null,
    inventory: null
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.pharmacies
      .getById(id)
      .then((res) => {
        if (res.success) {
          setPharmacy(res.data);
        } else {
          setError('Pharmacy profile not found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load pharmacy profile');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-slate-500">
        Loading pharmacy details...
      </div>
    );
  }

  if (error || !pharmacy) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-4">
          {error || 'Pharmacy store not found.'}
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>
    );
  }

  const isVerified = pharmacy.verificationStatus === 'VERIFIED';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;

  const filteredInventory = (pharmacy.inventories || []).filter((inv: any) => {
    if (!inventorySearch.trim()) return true;
    const term = inventorySearch.toLowerCase();
    return (
      inv.medicine.brandName.toLowerCase().includes(term) ||
      inv.medicine.genericName.toLowerCase().includes(term) ||
      inv.medicine.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Store Header Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-border shadow-subtle space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-xl bg-primary-light text-primary">
                <Store className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-brandText-primary">
                  {pharmacy.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Local Chemist
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Verification Pending
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    License Reg: <strong>{pharmacy.licenseNumber}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 text-xs text-brandText-secondary">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  {pharmacy.address}, {pharmacy.city}, {pharmacy.state} - {pharmacy.postalCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Operating Hours: <strong>{pharmacy.openingHours}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Contact Number: <strong>{pharmacy.phone}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 min-w-[200px]">
            <a
              href={`tel:${pharmacy.phone}`}
              className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle text-center flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Pharmacy</span>
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-brandText-primary text-xs font-semibold text-center flex items-center justify-center gap-2 transition-all"
            >
              <Navigation className="w-4 h-4 text-primary" />
              <span>Get Directions</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Available Inventory Section */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brandText-primary flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              <span>Available Medicines in Stock ({filteredInventory.length})</span>
            </h2>
            <p className="text-xs text-brandText-secondary">
              Verified inventory listings updated directly by {pharmacy.name}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              placeholder="Filter stock by name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {filteredInventory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredInventory.map((item: any) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/medicines/${item.medicine.id}`}
                      className="font-bold text-sm text-brandText-primary hover:text-primary transition-colors"
                    >
                      {item.medicine.brandName}
                    </Link>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.medicine.dosageForm} · {item.medicine.strength}
                    </span>
                    <StockBadge status={item.stockStatus} quantity={item.quantity} />
                  </div>
                  <p className="text-xs text-brandText-secondary italic">
                    {item.medicine.genericName} · {item.medicine.manufacturer}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Updated {item.freshnessHoursAgo}h ago
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-bold text-brandText-primary">
                      ₹{item.price.toFixed(2)}
                    </span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-slate-400 line-through block">
                        ₹{item.mrp.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResModal({
                        isOpen: true,
                        pharmacy,
                        inventory: item
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1 shadow-subtle"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Hold
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No medicines match your filter for this pharmacy.
          </div>
        )}
      </div>

      {/* Reservation Hold Modal */}
      <ReservationModal
        isOpen={resModal.isOpen}
        onClose={() => setResModal({ isOpen: false, pharmacy: null, inventory: null })}
        pharmacy={resModal.pharmacy}
        inventory={resModal.inventory}
      />
    </div>
  );
}
