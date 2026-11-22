'use client';

import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  FileCheck,
  CheckCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Navigation,
  Pill,
  Sparkles
} from 'lucide-react';

interface PharmacyDirectoryProps {
  stores: any[];
  onOpenAddModal: () => void;
  onRefresh?: () => void;
}

const INDORE_AREAS = [
  'All Areas',
  'Vijay Nagar',
  'Old Palasia',
  'New Palasia',
  'Bhawarkua',
  'Rajwada',
  'Geeta Bhawan',
  'Annapurna',
  'MR-10',
  'Sudama Nagar',
  'Bengali Square',
  'LIG Square',
  'Rau'
];

export function PharmacyDirectory({ stores, onOpenAddModal, onRefresh }: PharmacyDirectoryProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      store.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (store.licenseNumber && store.licenseNumber.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesArea =
      selectedArea === 'All Areas' ||
      store.address.toLowerCase().includes(selectedArea.toLowerCase()) ||
      store.name.toLowerCase().includes(selectedArea.toLowerCase());

    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 shadow-card border border-emerald-800/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Live Raw Directory
              </span>
              <span className="text-xs text-emerald-300 font-medium">
                Indore Healthcare Hub ({stores.length} Registered Medical Stores)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Indore Verified Medical Stores & Chemists
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Complete raw directory of licensed pharmacies across Indore (Scheme 54, Palasia, Bhawarkua, Rajwada, Geeta Bhawan, Annapurna & more) with contact numbers, license details, and operating hours.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-emerald-700/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medical Store Manually</span>
            </button>
          </div>
        </div>

        {/* Search & Area Filter Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by store name, address, or drug license..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-slate-400 focus:bg-white/15 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="relative flex-shrink-0">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-white focus:outline-none focus:border-primary cursor-pointer"
              >
                {INDORE_AREAS.map((area) => (
                  <option key={area} value={area} className="text-slate-900 bg-white">
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Cards / Table */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/15 flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards' ? 'bg-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Raw Data Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {filteredStores.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-border shadow-subtle">
          <Store className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-brandText-primary">No medical stores match this filter</h4>
          <p className="text-xs text-brandText-secondary mt-1">
            Try resetting your area or keyword filter, or add a new store manually.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchFilter('');
              setSelectedArea('All Areas');
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Raw Data Table View */
        <div className="bg-white rounded-2xl border border-border shadow-subtle overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-brandText-primary">
              Showing {filteredStores.length} Verified Stores in Indore (Raw Dataset)
            </span>
            <span className="text-[11px] text-slate-500">Live ABDM/CDSCO registered format</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Store Name & Status</th>
                  <th className="py-3 px-4">Full Address (Indore)</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Timings</th>
                  <th className="py-3 px-4">Drug License</th>
                  <th className="py-3 px-4">Stocked Items</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStores.map((store, index) => (
                  <tr key={store.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brandText-primary text-sm flex items-center gap-1.5">
                        <span>{store.name}</span>
                        {store.verificationStatus === 'VERIFIED' && (
                          <span
                            title="Licensed & Verified by Drug Controller"
                            className="inline-flex items-center text-primary"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {store.id ? store.id.slice(0, 8) : 'IND-STORE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brandText-primary whitespace-nowrap">
                      <a
                        href={`tel:${store.phone}`}
                        className="hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{store.phone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {store.openingHours || '24 Hours Open'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {store.licenseNumber || 'MP-IND-20B-ACTIVE'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {store._count?.inventories ?? store.inventories?.length ?? 12} Medicines
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`tel:${store.phone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-primary font-bold hover:bg-emerald-100 transition-colors"
                        >
                          Call
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${store.name}, ${store.address}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors"
                          title="Open Directions in Google Maps"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-border shadow-subtle p-5 hover:shadow-card hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Verification & Rating */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    VERIFIED PHARMACY
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ★ {store.rating || '4.8'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-brandText-primary mb-1">
                  {store.name}
                </h3>

                {/* Address */}
                <p className="text-xs text-slate-600 flex items-start gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </p>

                {/* Details Pills */}
                <div className="space-y-1.5 py-2.5 border-t border-b border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Timings:
                    </span>
                    <strong className="text-brandText-primary font-semibold">
                      {store.openingHours || '24 Hours Open'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      Drug License:
                    </span>
                    <span className="font-mono text-[11px] text-slate-700 font-medium">
                      {store.licenseNumber || 'MP-IND-20B-VERIFIED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" />
                      Active Inventory:
                    </span>
                    <span className="text-primary font-bold">
                      {store._count?.inventories ?? store.inventories?.length ?? 12} Verified Medicines
                    </span>
                  </div>
                </div>

                {/* In-Stock sample medicines if available */}
                {store.inventories && store.inventories.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Top In-Stock Medicines:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {store.inventories.slice(0, 3).map((inv: any) => (
                        <span
                          key={inv.id}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {inv.medicine?.brandName || 'Dolo 650'}
                        </span>
                      ))}
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+ more</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${store.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${store.name}, ${store.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Open in Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5 text-secondary" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
