'use client';

import React from 'react';
import { useLocation, PRESET_LOCATIONS } from '@/context/LocationContext';
import { MapPin, Navigation, X, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { location, setLocation, setRadius, detectCurrentLocation, isDetecting, error } =
    useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-float border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-brandText-primary text-base">Select Your Location</h3>
              <p className="text-xs text-brandText-secondary">Find pharmacies in your immediate neighborhood</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={async () => {
              await detectCurrentLocation();
              onClose();
            }}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover shadow-subtle transition-all disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            {isDetecting ? 'Detecting your GPS location...' : 'Use My Exact GPS Location'}
          </button>
          {error && <p className="text-xs text-rose-500 mt-2 px-1">{error}</p>}
        </div>

        {/* Radius Selector */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-brandText-secondary uppercase tracking-wider block mb-2">
            Search Radius Distance
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 5, 10, 20].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  location.radiusKm === r
                    ? 'bg-secondary text-white border-secondary shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {/* Preset City Areas */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-brandText-secondary uppercase tracking-wider block mb-2">
            Popular Areas & Cities
          </label>
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {PRESET_LOCATIONS.map((preset) => {
              const isSelected =
                !location.isCustom &&
                Math.abs(location.lat - preset.lat) < 0.001 &&
                Math.abs(location.lng - preset.lng) < 0.001;

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setLocation({
                      name: preset.name,
                      lat: preset.lat,
                      lng: preset.lng,
                      isCustom: false
                    });
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary-light text-primary font-medium'
                      : 'hover:bg-slate-50 text-brandText-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {preset.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
