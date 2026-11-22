'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { PharmacyCard } from '@/components/PharmacyCard';
import { ReservationModal } from '@/components/ReservationModal';
import {
  Pill,
  Building2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Navigation,
  ArrowLeft,
  Store,
  Sparkles,
  Layers,
  ThermometerSnowflake,
  ExternalLink
} from 'lucide-react';

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { location, setRadius } = useLocation();

  const [medicine, setMedicine] = useState<any | null>(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);

  const [resModal, setResModal] = useState<{
    isOpen: boolean;
    pharmacy: any;
    inventory: any;
  }>({
    isOpen: false,
    pharmacy: null,
    inventory: null
  });

  const fetchMedicineAndStock = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [medRes, pharmRes] = await Promise.all([
        api.medicines.getById(id),
        api.pharmacies.getNearby({
          medicineId: id,
          lat: location.lat,
          lng: location.lng,
          radiusKm: location.radiusKm
        })
      ]);

      if (medRes.success) {
        setMedicine(medRes.data);
      } else {
        setError('Medicine not found in catalog');
      }

      if (pharmRes.success) {
        setNearbyPharmacies(pharmRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load medicine details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicineAndStock();
  }, [id, location.lat, location.lng, location.radiusKm]);

  // Connect Socket.IO for real-time inventory updates for this medicine
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();

    socket.emit('subscribe:medicine', id);

    const handleStockUpdate = (payload: any) => {
      console.log('Real-time stock update received:', payload);
      setRealtimeAlert(
        `Live update: ${payload.pharmacyName || 'A pharmacy'} just updated stock to ${payload.quantity} units!`
      );
      setTimeout(() => setRealtimeAlert(null), 5000);

      // Re-fetch nearby stores to refresh inventory seamlessly
      api.pharmacies
        .getNearby({
          medicineId: id,
          lat: location.lat,
          lng: location.lng,
          radiusKm: location.radiusKm
        })
        .then((res) => {
          if (res.success) setNearbyPharmacies(res.data);
        });
    };

    socket.on('stock:updated', handleStockUpdate);

    return () => {
      socket.emit('unsubscribe:medicine', id);
      socket.off('stock:updated', handleStockUpdate);
    };
  }, [id, location.lat, location.lng, location.radiusKm]);

  if (loading && !medicine) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-slate-500">
        Loading medicine details...
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm mb-4">
          {error || 'Medicine formulation not found.'}
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Medicine Search
        </Link>
      </div>
    );
  }

  const isPrescriptionRequired =
    medicine.prescriptionCategory === 'SCHEDULE_H' ||
    medicine.prescriptionCategory === 'SCHEDULE_H1' ||
    medicine.prescriptionCategory === 'SCHEDULE_X';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Real-time Notification Banner */}
      {realtimeAlert && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-subtle flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {realtimeAlert}
          </span>
          <button
            onClick={() => setRealtimeAlert(null)}
            className="text-white/80 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </button>

        <span className="text-xs text-slate-400">
          Official CDSCO/ABDM Registry: <strong className="text-slate-600">{medicine.registryCode}</strong>
        </span>
      </div>

      {/* Hero Medicine Specification Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-border shadow-subtle space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                {medicine.dosageForm} · {medicine.strength}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-primary border border-emerald-200">
                {medicine.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isPrescriptionRequired
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {medicine.prescriptionCategory}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-brandText-primary">
              {medicine.brandName}
            </h1>
            <p className="text-sm text-brandText-secondary italic">
              Generic Composition: <strong>{medicine.genericName}</strong>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-brandText-secondary pt-2">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {medicine.manufacturer}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-slate-400" />
                Packaging: {medicine.packSize}
              </span>
            </div>
          </div>

          {/* Quick Summary Pill */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[220px] text-xs space-y-2">
            <div className="text-slate-500">Nearby Availability:</div>
            <div className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
              <Store className="w-5 h-5" />
              <span>{nearbyPharmacies.length} Stores Found</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Within {location.radiusKm} km of {location.name}
            </p>
          </div>
        </div>

        {/* Detailed Composition & Storage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <h4 className="font-semibold text-brandText-primary mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              Active Ingredients & Quantities
            </h4>
            <ul className="list-disc list-inside space-y-1 text-brandText-secondary">
              {Array.isArray(medicine.activeIngredients) ? (
                medicine.activeIngredients.map((ing: string, i: number) => (
                  <li key={i}>{ing}</li>
                ))
              ) : (
                <li>{medicine.activeIngredients}</li>
              )}
            </ul>
          </div>

          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <h4 className="font-semibold text-brandText-primary mb-2 flex items-center gap-1.5">
              <ThermometerSnowflake className="w-4 h-4 text-secondary" />
              Storage & Handling Guidelines
            </h4>
            <p className="text-brandText-secondary leading-relaxed">
              {medicine.storageConditions ||
                'Store in a cool, dry place below 25°C away from direct sunlight and humidity. Keep out of reach of children.'}
            </p>
          </div>
        </div>

        {/* Medical & Legal Disclaimer Banner */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block">Statutory Medical Notice:</strong>
            <p className="text-[11px] leading-relaxed">
              MedKit does not promote automatic therapeutic substitutions or altered strengths. If this is a Schedule H/H1 formulation, an original doctor&apos;s prescription is mandatory for dispensing at your chosen licensed pharmacy.
            </p>
          </div>
        </div>
      </div>

      {/* Nearby Stock Availability Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-brandText-primary flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <span>Pharmacies Stocking {medicine.brandName}</span>
            </h2>
            <p className="text-xs text-brandText-secondary">
              Searching within {location.radiusKm} km of {location.name}
            </p>
          </div>

          {/* Radius Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-400 px-2 font-medium">Radius:</span>
            {[2, 5, 10, 20].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  location.radiusKm === r
                    ? 'bg-secondary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>

        {nearbyPharmacies.length > 0 ? (
          <div className="space-y-3">
            {nearbyPharmacies.map((res) => (
              <PharmacyCard
                key={res.pharmacy.id}
                result={res}
                onReserve={(pharmacy, inventory) => {
                  setResModal({
                    isOpen: true,
                    pharmacy,
                    inventory
                  });
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-border space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-brandText-primary">
                No stores currently reporting stock for {medicine.brandName} within {location.radiusKm} km
              </h4>
              <p className="text-xs text-brandText-secondary max-w-md mx-auto mt-1">
                You can expand the search radius to explore pharmacies in adjacent neighborhoods or contact nearest verified stores.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setRadius(10)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-subtle"
              >
                Expand to 10 km
              </button>
              <button
                type="button"
                onClick={() => setRadius(20)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Expand to 20 km
              </button>
            </div>
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
