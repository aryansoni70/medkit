import React from 'react';
import Link from 'next/link';
import { Pill, Building2, Store, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface MedicineCardProps {
  medicine: {
    id: string;
    brandName: string;
    genericName: string;
    activeIngredients: string[];
    strength: string;
    dosageForm: string;
    manufacturer: string;
    packSize: string;
    prescriptionCategory: string;
    category: string;
    availablePharmaciesCount?: number;
    lowestPrice?: number | null;
  };
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  const isOTC = medicine.prescriptionCategory === 'OTC';

  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-card transition-all flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {medicine.dosageForm} · {medicine.strength}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
              isOTC
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isOTC ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {medicine.prescriptionCategory}
          </span>
        </div>

        {/* Brand & Generic Name */}
        <h3 className="font-bold text-lg text-brandText-primary group-hover:text-primary transition-colors leading-snug">
          {medicine.brandName}
        </h3>
        <p className="text-xs text-brandText-secondary italic mb-2">
          {medicine.genericName}
        </p>

        {/* Manufacturer & Pack Size */}
        <div className="space-y-1 my-3 text-xs text-brandText-secondary">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{medicine.manufacturer}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{medicine.packSize}</span>
          </div>
        </div>
      </div>

      {/* Card Footer with Price and Discovery CTA */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
        <div>
          {medicine.lowestPrice ? (
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Starting from</span>
              <span className="text-base font-bold text-emerald-600">
                ₹{medicine.lowestPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Price on enquiry</span>
          )}
        </div>

        <Link
          href={`/medicines/${medicine.id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-light hover:bg-primary text-primary hover:text-white text-xs font-semibold transition-all group/btn"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Find Nearby</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
