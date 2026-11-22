'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import { api } from '@/lib/api';
import { MedicineCard } from '@/components/MedicineCard';
import { PharmacyCard } from '@/components/PharmacyCard';
import { ReservationModal } from '@/components/ReservationModal';
import {
  Search,
  Filter,
  MapPin,
  Navigation,
  Pill,
  Store,
  ChevronDown,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { location, setLocation, setRadius, detectCurrentLocation, isDetecting } = useLocation();

  // Search filter states
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDosage, setSelectedDosage] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price'>('distance');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Data states
  const [medicines, setMedicines] = useState<any[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [pharmacyMeta, setPharmacyMeta] = useState<any | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Reservation modal state
  const [resModal, setResModal] = useState<{
    isOpen: boolean;
    pharmacy: any;
    inventory: any;
  }>({
    isOpen: false,
    pharmacy: null,
    inventory: null
  });

  // Load categories once
  useEffect(() => {
    api.medicines.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  // Sync URL query
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== query) {
      setQuery(qParam);
    }
    const catParam = searchParams.get('category');
    if (catParam !== null && catParam !== selectedCategory) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Main search fetcher
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const fetchData = async () => {
      try {
        // 1. Search medicines
        const medRes = await api.medicines.search({
          q: query || undefined,
          category: selectedCategory || undefined,
          dosageForm: selectedDosage || undefined,
          prescriptionCategory: selectedPrescription || undefined
        });

        if (isCancelled) return;

        if (medRes.success) {
          setMedicines(medRes.data);

          // If medicines found, pick first as active selected medicine for nearby pharmacies discovery
          const activeMed = medRes.data.length > 0 ? medRes.data[0] : null;
          setSelectedMedicine(activeMed);

          // 2. Fetch nearby pharmacies for this active medicine
          const pharmRes = await api.pharmacies.getNearby({
            medicineId: activeMed?.id || undefined,
            lat: location.lat,
            lng: location.lng,
            radiusKm: location.radiusKm,
            sortBy,
            inStockOnly
          });

          if (!isCancelled && pharmRes.success) {
            setNearbyPharmacies(pharmRes.data);
            setPharmacyMeta(pharmRes.meta || null);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [
    query,
    selectedCategory,
    selectedDosage,
    selectedPrescription,
    location.lat,
    location.lng,
    location.radiusKm,
    sortBy,
    inStockOnly
  ]);

  // Handle selecting a different medicine card from the search results
  const handleSelectMedicine = async (med: any) => {
    setSelectedMedicine(med);
    setLoading(true);
    try {
      const pharmRes = await api.pharmacies.getNearby({
        medicineId: med.id,
        lat: location.lat,
        lng: location.lng,
        radiusKm: location.radiusKm,
        sortBy,
        inStockOnly
      });
      if (pharmRes.success) {
        setNearbyPharmacies(pharmRes.data);
        setPharmacyMeta(pharmRes.meta || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedDosage('');
    setSelectedPrescription('');
    setSortBy('distance');
    setInStockOnly(false);
    router.push('/search');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-subtle border border-border mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicine brand (e.g. Augmentin 625), salt (Amoxicillin)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Radius Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                Radius:
              </span>
              {[2, 5, 10, 20].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    location.radiusKm === r
                      ? 'bg-secondary text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            {/* GPS Trigger */}
            <button
              type="button"
              onClick={() => detectCurrentLocation()}
              disabled={isDetecting}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-brandText-primary flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Use Current GPS Coordinates"
            >
              <Navigation className={`w-3.5 h-3.5 text-primary ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Locating...' : 'GPS Location'}</span>
            </button>
          </div>
        </form>

        {/* Location subtitle bar */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-brandText-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Finding medicines available in:</span>
            <strong className="text-brandText-primary">{location.name}</strong>
            <span className="text-slate-400">({location.radiusKm} km search radius)</span>
          </div>

          <div className="flex items-center gap-4 mt-1 sm:mt-0">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-brandText-primary select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
              />
              <span>In-Stock Pharmacies Only</span>
            </label>

            <div className="flex items-center gap-1">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-brandText-primary focus:outline-none cursor-pointer"
              >
                <option value="distance">Nearest Distance</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Filters, Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Filter Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-border shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-brandText-primary flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-primary" />
                Refine Search
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-slate-400 hover:text-primary flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-brandText-secondary block mb-2 uppercase tracking-wider">
                Therapeutic Category
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedCategory === ''
                      ? 'bg-primary-light text-primary font-bold'
                      : 'text-brandText-secondary hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedCategory(c.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedCategory === c.name
                        ? 'bg-primary-light text-primary font-bold'
                        : 'text-brandText-secondary hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dosage Form Filter */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-brandText-secondary block mb-2 uppercase tracking-wider">
                Dosage Form
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['', 'Tablet', 'Capsule', 'Syrup', 'Inhaler', 'Ointment'].map((form) => (
                  <button
                    key={form || 'all'}
                    type="button"
                    onClick={() => setSelectedDosage(form)}
                    className={`py-1.5 px-2 text-center rounded-lg text-xs font-medium border transition-colors ${
                      selectedDosage === form
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {form || 'All Forms'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription Classification */}
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-brandText-secondary block mb-2 uppercase tracking-wider">
                Prescription Type
              </label>
              <div className="space-y-1">
                {[
                  { label: 'All Medicines', val: '' },
                  { label: 'OTC (Over The Counter)', val: 'OTC' },
                  { label: 'Schedule H / H1 (Prescription)', val: 'SCHEDULE_H' }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setSelectedPrescription(p.val)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedPrescription === p.val
                        ? 'bg-primary-light text-primary font-bold'
                        : 'text-brandText-secondary hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Drug Header */}
          {selectedMedicine && (
            <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white uppercase">
                    {selectedMedicine.dosageForm} · {selectedMedicine.strength}
                  </span>
                  <span className="text-xs text-slate-300">
                    Reg: {selectedMedicine.registryCode}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">
                  {selectedMedicine.brandName}
                </h2>
                <p className="text-xs text-emerald-200 italic">
                  Generic: {selectedMedicine.genericName} · {selectedMedicine.manufacturer}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 px-4 py-2 rounded-xl text-center backdrop-blur-sm border border-white/10">
                  <span className="text-[10px] uppercase text-emerald-200 block">Nearby Stores</span>
                  <span className="text-lg font-bold text-white">
                    {nearbyPharmacies.length} Available
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pharmacists List for Selected Drug */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-brandText-primary flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <span>Nearby Verified Pharmacies with Availability</span>
              </h3>
              <span className="text-xs text-brandText-secondary">
                Within {location.radiusKm} km radius
              </span>
            </div>

            {/* Smart Fallback Banner if search radius was expanded to show nearest stores */}
            {pharmacyMeta?.isExpandedFallback && nearbyPharmacies.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950">
                      Showing nearest verified stores in Indore & nearby areas
                    </p>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      No verified store was found strictly within {location.radiusKm} km. We automatically expanded your discovery to show the closest licensed medical stores (starting from {pharmacyMeta.nearestDistanceKm} km away).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setRadius(10)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Set 10 km
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadius(20)}
                    className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200 transition-colors"
                  >
                    Set 20 km
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-5 border border-border animate-pulse space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : nearbyPharmacies.length > 0 ? (
              <div className="space-y-4">
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
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-brandText-primary">
                    No verified pharmacies found within {location.radiusKm} km
                  </h4>
                  <p className="text-xs text-brandText-secondary max-w-md mx-auto mt-1">
                    Try searching across Indore (Vijay Nagar, Palasia, Bhawarkua, Rajwada) or expanding your radius.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation({ name: 'Vijay Nagar, Indore', lat: 22.7533, lng: 75.8937, isCustom: false });
                      setRadius(10);
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-2xs"
                  >
                    Search Across Indore
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadius(10)}
                    className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary-hover"
                  >
                    Expand to 10 km
                  </button>
                  <button
                    type="button"
                    onClick={() => setRadius(20)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Expand to 20 km
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Related Medicine Formulations List */}
          {medicines.length > 1 && (
            <div className="pt-6 border-t border-border">
              <h3 className="font-bold text-base text-brandText-primary mb-4 flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" />
                <span>Other Matching Formulations ({medicines.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {medicines.map((med) => {
                  const isCurrent = selectedMedicine?.id === med.id;
                  return (
                    <div
                      key={med.id}
                      onClick={() => handleSelectMedicine(med)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isCurrent
                          ? 'border-primary ring-2 ring-primary/20 bg-emerald-50/20'
                          : 'border-border bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {med.dosageForm} · {med.strength}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-primary">Viewing Live Stock</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-brandText-primary">{med.brandName}</h4>
                      <p className="text-xs text-brandText-secondary italic">{med.genericName}</p>
                      <p className="text-[11px] text-slate-500 mt-2">{med.manufacturer}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-sm text-slate-500">
          Loading medicine search engine...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
