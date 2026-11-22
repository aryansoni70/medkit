import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  BookmarkCheck
} from 'lucide-react';
import { StockBadge } from './StockBadge';

interface PharmacyCardProps {
  result: {
    pharmacy: {
      id: string;
      name: string;
      address: string;
      city: string;
      phone: string;
      openingHours: string;
      verificationStatus: string;
      latitude: number;
      longitude: number;
      rating?: number;
    };
    distanceKm: number;
    estimatedDriveTimeMinutes?: number;
    inventory?: {
      id: string;
      quantity: number;
      price: number;
      mrp: number;
      stockStatus: string;
      lastUpdated: string;
      freshness: 'FRESH' | 'NEEDS_CONFIRMATION' | 'UNCONFIRMED' | string;
      freshnessHoursAgo: number;
      medicine?: {
        brandName: string;
        strength: string;
        packSize: string;
      };
    } | null;
  };
  onReserve?: (pharmacy: any, inventory: any) => void;
}

export function PharmacyCard({ result, onReserve }: PharmacyCardProps) {
  const { pharmacy, distanceKm, estimatedDriveTimeMinutes, inventory } = result;

  const isVerified = pharmacy.verificationStatus === 'VERIFIED';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;

  const discountPercent =
    inventory && inventory.mrp > inventory.price && inventory.price > 0
      ? Math.round(((inventory.mrp - inventory.price) / inventory.mrp) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-card hover:border-slate-300 transition-all">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Pharmacy Details */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/pharmacies/${pharmacy.id}`}
              className="font-bold text-base md:text-lg text-brandText-primary hover:text-primary transition-colors"
            >
              {pharmacy.name}
            </Link>

            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Pharmacy
              </span>
            )}
          </div>

          <div className="flex items-start gap-1.5 text-xs text-brandText-secondary">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>
              {pharmacy.address}, {pharmacy.city}
            </span>
          </div>

          {/* Distance & Drive Time */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <span className="font-semibold text-secondary flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {distanceKm} km away
            </span>
            {estimatedDriveTimeMinutes && (
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{estimatedDriveTimeMinutes} mins drive
              </span>
            )}
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{pharmacy.openingHours}</span>
          </div>
        </div>

        {/* Inventory / Price / Freshness Badge */}
        {inventory && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 md:text-right min-w-[210px] space-y-1.5">
            <div className="flex md:justify-end">
              <StockBadge
                status={inventory.stockStatus}
                quantity={inventory.quantity}
              />
            </div>

            {/* Price section */}
            {inventory.price > 0 && (
              <div className="pt-1">
                <div className="flex md:justify-end items-baseline gap-2">
                  <span className="text-lg font-bold text-brandText-primary">
                    ₹{inventory.price.toFixed(2)}
                  </span>
                  {inventory.mrp > inventory.price && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{inventory.mrp.toFixed(2)}
                    </span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 block">
                    Save {discountPercent}% below MRP
                  </span>
                )}
              </div>
            )}

            {/* Freshness Indicator */}
            <div className="pt-1 text-[11px] text-slate-500 flex items-center md:justify-end gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>
                {inventory.freshness === 'FRESH'
                  ? `Updated ${inventory.freshnessHoursAgo}h ago · Confirmed`
                  : inventory.freshness === 'NEEDS_CONFIRMATION'
                  ? `Updated ${inventory.freshnessHoursAgo}h ago`
                  : 'Unconfirmed update'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Call Pharmacy */}
          <a
            href={`tel:${pharmacy.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-brandText-primary text-xs font-semibold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-slate-600" />
            <span>Call Store</span>
          </a>

          {/* Directions */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-brandText-primary text-xs font-semibold transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-600" />
            <span>Directions</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* View Pharmacy Profile */}
          <Link
            href={`/pharmacies/${pharmacy.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-brandText-primary text-xs font-medium transition-colors"
          >
            Store Profile
          </Link>
        </div>

        {/* Hold / Reservation Button */}
        {inventory && inventory.quantity > 0 && onReserve && (
          <button
            type="button"
            onClick={() => onReserve(pharmacy, inventory)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-all"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Hold for 2 Hours</span>
          </button>
        )}
      </div>
    </div>
  );
}
