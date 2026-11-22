'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Store,
  MapPin,
  Phone,
  FileText,
  Clock,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PharmacyRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 AM - 10:30 PM');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('GPS error:', err.message);
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to onboard a pharmacy. Please log in or create an account first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.pharmacies.register({
        name,
        address,
        city,
        state,
        postalCode,
        latitude,
        longitude,
        phone,
        email: email || user.email,
        openingHours,
        licenseNumber
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit pharmacy onboarding application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-border shadow-float space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center mx-auto font-bold shadow-subtle">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brandText-primary">
            Onboard Your Pharmacy on MedKit
          </h1>
          <p className="text-xs sm:text-sm text-brandText-secondary leading-relaxed">
            Connect directly with nearby patients seeking authentic medicine availability. Every listing undergoes mandatory Drug License verification.
          </p>
        </div>

        {/* Verification Process Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brandText-secondary flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-brandText-primary block font-semibold mb-0.5">
              Statutory Drug License Verification
            </strong>
            <p className="text-[11px] leading-relaxed">
              In adherence with the Drugs & Cosmetics Act, all pharmacies must provide a valid State Retail Drug License number. MedKit administrators review documentation before issuing public verified badges.
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-brandText-primary">
                Application Submitted Successfully!
              </h3>
              <p className="text-xs text-brandText-secondary max-w-md mx-auto mt-2 leading-relaxed">
                Your medical store profile for <strong>{name}</strong> is now registered in our system under Status: <strong>PENDING REVIEW</strong>. Our compliance team will review your license number ({licenseNumber}) shortly.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/pharmacy/dashboard"
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-subtle"
              >
                Go to Pharmacy Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {!user && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <span>Please log in first to link this pharmacy to your account.</span>
                <Link href="/login" className="font-bold underline text-amber-950">
                  Log In Now
                </Link>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Store Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-slate-100 pb-2">
                1. Store Identification & Licensing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    Pharmacy Trade Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Apollo Pharmacy / Sanjivani Chemist"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    Retail Drug License Number (Form 20/20B) *
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    placeholder="e.g. DL-20B-987654/2023"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Location & GPS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  2. Store Address & Geographic Coordinates
                </h3>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetectingGps}
                  className="text-primary hover:underline font-semibold text-[11px] flex items-center gap-1"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  {isDetectingGps ? 'Reading GPS...' : 'Auto-Fill Current GPS'}
                </button>
              </div>

              <div>
                <label className="font-semibold text-brandText-secondary block mb-1.5">
                  Complete Physical Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Shop No., Market / Building Name, Street"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    placeholder="110001"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours & Contact */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-slate-100 pb-2">
                3. Customer Contact & Hours
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    Customer Calling Line *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 11 2345 6789"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brandText-secondary block mb-1.5">
                    Operating Hours *
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    required
                    placeholder="e.g. 08:00 AM - 11:00 PM or 24 Hours Open"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !user}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Submitting Registration...' : 'Submit Pharmacy For Verification'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
