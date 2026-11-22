'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Store, X, MapPin, Phone, Clock, FileCheck, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';

interface ManualPharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreAdded?: (pharmacy: any) => void;
}

const INDORE_LOCALITIES = [
  'Vijay Nagar',
  'Old Palasia',
  'New Palasia',
  'Bhawarkua',
  'Rajwada',
  'Geeta Bhawan',
  'Annapurna',
  'MR-10',
  'Dawa Bazar',
  'Sudama Nagar',
  'Bengali Square',
  'LIG Square',
  'Rau'
];

export function ManualPharmacyModal({ isOpen, onClose, onStoreAdded }: ManualPharmacyModalProps) {
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('Vijay Nagar');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('24 Hours Open');
  const [licenseNumber, setLicenseNumber] = useState(
    `MP-IND-20B-${Math.floor(100000 + Math.random() * 900000)}/2026`
  );
  const [stockInitialDolo, setStockInitialDolo] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Please provide a medical store name.');
      return;
    }
    if (!address.trim()) {
      setError('Please provide the street address in Indore.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.pharmacies.createManual({
        name: name.trim(),
        locality,
        address: `${address.trim()}, ${locality}, Indore`,
        phone: phone.trim(),
        openingHours,
        licenseNumber: licenseNumber.trim(),
        stockInitialDolo
      });

      if (res.success) {
        setSuccess('Medical store successfully registered & verified in Indore!');
        if (onStoreAdded) {
          onStoreAdded(res.data);
        }
        setTimeout(() => {
          onClose();
          // Reset form
          setName('');
          setAddress('');
          setPhone('');
          setSuccess(null);
        }, 1200);
      } else {
        setError(res.error || 'Failed to add medical store.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while adding medical store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-emerald-300">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-white/10 px-2 py-0.5 rounded">
                Indore Pharmacy Network
              </span>
              <h2 className="text-xl font-bold text-white">Add Medical Store Manually</h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100">
            Instantly add and verify any local chemist or medical store in Indore. It will appear live in search results and the store directory.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Store Name */}
          <div>
            <label className="block text-xs font-bold text-brandText-primary mb-1">
              Medical Store / Pharmacy Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anand Chemist & Medical Store"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Locality in Indore */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brandText-primary mb-1">
                Area in Indore <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {INDORE_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}, Indore
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandText-primary mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 731 255 4433"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-bold text-brandText-primary mb-1">
              Shop Address / Landmark <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 4, Near Brilliant Convention Centre, Scheme 54"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Hours and License */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brandText-primary mb-1">
                Operating Timings
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="24 Hours Open">24 Hours Open (24x7)</option>
                  <option value="08:00 AM - 11:30 PM">08:00 AM - 11:30 PM</option>
                  <option value="09:00 AM - 10:30 PM">09:00 AM - 10:30 PM</option>
                  <option value="10:00 AM - 09:00 PM">10:00 AM - 09:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brandText-primary mb-1">
                Drug License No.
              </label>
              <div className="relative">
                <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Auto Stock Option */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="stockInitial"
              checked={stockInitialDolo}
              onChange={(e) => setStockInitialDolo(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="stockInitial" className="text-xs text-emerald-950 cursor-pointer">
              <strong>Pre-stock standard medicines</strong> (Dolo 650, Calpol 500, Augmentin 625, Azithral, Combiflam) so this store immediately answers availability queries.
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding Store...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Add & Verify Medical Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
