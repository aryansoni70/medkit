'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { X, CheckCircle2, AlertTriangle, Clock, Store, ShieldCheck } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: any;
  inventory: any;
}

export function ReservationModal({
  isOpen,
  onClose,
  pharmacy,
  inventory
}: ReservationModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !pharmacy || !inventory) return null;

  const handleReserve = async () => {
    if (!user) {
      setError('Please log in or create an account to place a hold request.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.reservations.create({
        pharmacyId: pharmacy.id,
        medicineId: inventory.medicineId || inventory.medicine?.id,
        quantity
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to place reservation hold request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-float border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-brandText-primary text-base">
              Hold Medicine for Pickup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-brandText-primary">
                Hold Request Confirmed!
              </h4>
              <p className="text-xs text-brandText-secondary mt-1">
                {pharmacy.name} will keep this item reserved for <strong>2 hours</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-left text-xs space-y-2 border border-slate-100">
              <div className="flex items-center gap-2 text-brandText-primary font-medium">
                <Store className="w-4 h-4 text-primary" />
                <span>{pharmacy.name}</span>
              </div>
              <p className="text-slate-500 pl-6">{pharmacy.address}</p>
              <p className="text-slate-500 pl-6">Contact: {pharmacy.phone}</p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Please arrive within 2 hours with your physical doctor&apos;s prescription (if required).
                Pay directly at the pharmacy counter.
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover shadow-subtle"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* Pharmacy and Drug Details */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-brandText-primary">
                <span>{inventory.medicine?.brandName || 'Selected Medicine'}</span>
                <span>₹{(inventory.price * quantity).toFixed(2)}</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {inventory.medicine?.strength} · {inventory.medicine?.packSize}
              </p>
              <p className="text-slate-600 pt-1 font-medium">
                Store: {pharmacy.name} ({pharmacy.city})
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-brandText-secondary">Select Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-300 flex items-center justify-center font-bold hover:bg-slate-100"
                >
                  -
                </button>
                <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(inventory.quantity || 5, q + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-300 flex items-center justify-center font-bold hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Regulatory & Prescription Notice */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-blue-950">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Statutory Pickup Terms</span>
              </div>
              <p className="text-[10px] leading-relaxed text-blue-800">
                This is a provisional local hold. If this medicine is a Schedule H/H1 drug, a valid registered prescription must be produced at the counter upon pickup. No payments are processed online.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600">
                {error}
              </div>
            )}

            {/* Submit Hold Request */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReserve}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover shadow-subtle transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting hold request...' : 'Confirm 2-Hour In-Store Hold'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
