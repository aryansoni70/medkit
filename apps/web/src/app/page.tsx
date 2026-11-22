'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { api } from '@/lib/api';
import {
  Search,
  Navigation,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Pill,
  HeartPulse,
  Sparkles,
  Building2,
  Store,
  Layers,
  Activity,
  Check,
  Zap,
  ArrowUpRight
} from 'lucide-react';

const CAPABILITY_PILLS = [
  'Verified Pharmacies',
  'Live Stock Freshness',
  'Price Transparency',
  'Schedule H Compliance',
  'Real-Time Holds',
  '100% Indore Coverage'
];

const POPULAR_SEARCHES = [
  'Dolo 650',
  'Augmentin 625 Duo',
  'Allegra 120',
  'Pan-D',
  'Asthalin Inhaler',
  'Becosules Z',
  'Betadine 10%',
  'Electral ORS'
];

const CATEGORIES = [
  {
    name: 'Pain relief',
    description: 'Fever, headache, inflammation & muscle relief',
    icon: Pill,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  {
    name: 'Antibiotics',
    description: 'Doctor-prescribed broad spectrum anti-infectives',
    icon: ShieldCheck,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    name: 'Digestive health',
    description: 'Antacids, acid reflux, proton pump inhibitors',
    icon: Activity,
    color: 'bg-teal-50 text-teal-600 border-teal-200'
  },
  {
    name: 'Respiratory',
    description: 'Anti-allergy, cough syrups & rescue inhalers',
    icon: HeartPulse,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  },
  {
    name: 'Vitamins and supplements',
    description: 'Essential minerals, calcium, Zinc & multivitamins',
    icon: Sparkles,
    color: 'bg-amber-50 text-amber-600 border-amber-200'
  },
  {
    name: 'First aid',
    description: 'Antiseptic ointments, bandages & WHO rehydration salts',
    icon: Layers,
    color: 'bg-rose-50 text-rose-600 border-rose-200'
  }
];

export default function HomePage() {
  const router = useRouter();
  const { location, setRadius, detectCurrentLocation, isDetecting } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.medicines.suggest(searchTerm);
          if (res.success) {
            setSuggestions(res.data);
          }
        } catch {
          // ignore
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div className="flex flex-col relative overflow-hidden bg-white">
      {/* Decorative Organic Wave Lines on Left and Right (matching reference image) */}
      <div className="absolute top-0 left-0 w-32 md:w-64 h-[750px] pointer-events-none -z-0 opacity-40 select-none">
        <svg viewBox="0 0 200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M-50,0 C80,200 120,400 20,600 C-40,720 10,800 60,850" stroke="#06B6D4" strokeWidth="2" strokeDasharray="6 6" />
          <path d="M-20,-50 C120,150 140,450 40,650 C-10,750 40,820 90,880" stroke="#10B981" strokeWidth="2.5" />
          <path d="M10,-100 C160,100 180,480 70,700 C10,780 70,850 120,900" stroke="#14B8A6" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="absolute top-0 right-0 w-32 md:w-64 h-[750px] pointer-events-none -z-0 opacity-40 select-none">
        <svg viewBox="0 0 200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M250,0 C120,200 80,400 180,600 C240,720 190,800 140,850" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="6 6" />
          <path d="M220,-50 C80,150 60,450 160,650 C210,750 160,820 110,880" stroke="#10B981" strokeWidth="2.5" />
          <path d="M190,-100 C40,100 20,480 130,700 C190,780 130,850 80,900" stroke="#059669" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 md:pt-16 pb-16 md:pb-24 text-center">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Capability Pills Row (styled like reference UI) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-3xl mx-auto">
            {CAPABILITY_PILLS.map((pill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-600 transition-colors shadow-2xs backdrop-blur-xs select-none"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Main Headline (like reference UI with italic green serif accent) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-extrabold text-[#111827] tracking-tight leading-[1.08] mb-6">
            Verified medicine <span className="italic font-serif font-normal text-primary">availability</span> <br className="hidden sm:inline" />
            on demand.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            A transparent pharmacy discovery network for patients and families across Indore who want authentic neighborhood medicine stock delivered on their timeline.
          </p>

          {/* Elevated Floating Search Box */}
          <div className="relative max-w-3xl mx-auto bg-white p-3 sm:p-4 rounded-2xl shadow-float border border-slate-200 text-left">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                  placeholder="Search brand (e.g. Dolo 650) or generic active salt (Paracetamol)..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm sm:text-base border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-slate-400 text-brandText-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => detectCurrentLocation()}
                  disabled={isDetecting}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-brandText-secondary hover:text-brandText-primary text-xs font-semibold transition-all disabled:opacity-50"
                  title="Detect GPS Location"
                >
                  <Navigation className={`w-4 h-4 text-primary ${isDetecting ? 'animate-spin' : ''}`} />
                  <span className="whitespace-nowrap">{isDetecting ? 'Locating...' : 'GPS'}</span>
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-subtle transition-all flex items-center justify-center gap-2"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Current Search Location Bar with Radius Selector */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-brandText-secondary px-1 gap-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>Searching near:</span>
                <span className="font-semibold text-brandText-primary">{location.name}</span>
                <span className="text-slate-400">({location.radiusKm} km radius)</span>
              </div>

              {/* Quick radius buttons */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Radius:</span>
                {[2, 5, 10, 20].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRadius(r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      location.radiusKm === r
                        ? 'bg-secondary text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {isFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-float border border-slate-200 z-50 text-left overflow-hidden divide-y divide-slate-100">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={() => {
                      router.push(`/medicines/${item.id}`);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-brandText-primary">
                        {item.brandName}
                      </div>
                      <div className="text-xs text-brandText-secondary">
                        {item.genericName} · {item.strength} ({item.dosageForm})
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Popular Search Examples Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs text-slate-400 font-medium">Popular:</span>
            {POPULAR_SEARCHES.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => {
                  setSearchTerm(query);
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                }}
                className="px-3 py-1 rounded-full bg-white hover:bg-primary-light hover:text-primary text-slate-600 border border-slate-200 text-xs transition-colors shadow-2xs"
              >
                {query}
              </button>
            ))}
          </div>

          {/* Trust Highlights Stats Bar */}
          <div className="mt-14 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111827]">9+</div>
              <p className="text-xs text-slate-500 mt-0.5">Verified Indore Pharmacies</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111827]">20+</div>
              <p className="text-xs text-slate-500 mt-0.5">Essential Medicines Listed</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">100%</div>
              <p className="text-xs text-slate-500 mt-0.5">Drug License Verified</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-secondary">&lt; 6 hrs</div>
              <p className="text-xs text-slate-500 mt-0.5">Fresh Stock Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* How MedKit Works */}
      <section id="how-it-works" className="py-20 bg-slate-50/60 border-t border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Simple 3-Step Process
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brandText-primary">
              How MedKit Connects You to Medicine
            </h3>
            <p className="text-sm text-brandText-secondary mt-2">
              Save time and avoid emergency store hopping by confirming pharmacy stock before you travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col items-start relative group hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg mb-5 shadow-subtle">
                1
              </div>
              <h4 className="font-bold text-base text-brandText-primary mb-2">
                Search Your Medicine
              </h4>
              <p className="text-xs text-brandText-secondary leading-relaxed">
                Type the brand name, active chemical molecule, or therapeutic classification. Autocomplete matches CDSCO approved formulations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col items-start relative group hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-lg mb-5 shadow-subtle">
                2
              </div>
              <h4 className="font-bold text-base text-brandText-primary mb-2">
                Discover Nearby Pharmacies
              </h4>
              <p className="text-xs text-brandText-secondary leading-relaxed">
                MedKit calculates exact geographic distances to verified neighborhood stores within 2 to 20 km of your Indore location.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col items-start relative group hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg mb-5 shadow-subtle">
                3
              </div>
              <h4 className="font-bold text-base text-brandText-primary mb-2">
                Check Stock & Contact Store
              </h4>
              <p className="text-xs text-brandText-secondary leading-relaxed">
                Review live stock indicators (fresh vs unconfirmed), compare retail prices, get direct driving directions, or call ahead.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Medicine Categories */}
      <section className="py-20 bg-white border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                Therapeutic Catalogues
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brandText-primary">
                Browse Popular Categories
              </h3>
              <p className="text-xs text-brandText-secondary mt-1">
                Categories are designed for discovery navigation only and never substitute professional medical consultation.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
            >
              <span>Explore All Formulations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary/40 hover:shadow-card transition-all flex items-start gap-4 group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brandText-primary group-hover:text-primary transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-brandText-secondary mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why MedKit (Trust & Transparency) */}
      <section className="py-20 bg-slate-50/60 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Why MedKit
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brandText-primary">
              Built for Speed, Transparency & Patient Trust
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-brandText-primary mb-1">
                  Hyperlocal Radius Search
                </h4>
                <p className="text-xs text-brandText-secondary leading-relaxed">
                  Real geographic distance calculations pinpoint open pharmacies across Vijay Nagar, Palasia, Bhawarkua, Rajwada and more within 2km to 20km.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-secondary flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-brandText-primary mb-1">
                  Verified Drug Licenses Only
                </h4>
                <p className="text-xs text-brandText-secondary leading-relaxed">
                  Every listed medical store submits state drug licensing documentation verified by platform administrators before receiving public verification badges.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-brandText-primary mb-1">
                  Stock Freshness Transparency
                </h4>
                <p className="text-xs text-brandText-secondary leading-relaxed">
                  Never get misled by stale inventory numbers. MedKit flags stock records updated within 6 hours as fresh and warns when stock needs reconfirmation.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-brandText-primary mb-1">
                  Transparent Price Comparison
                </h4>
                <p className="text-xs text-brandText-secondary leading-relaxed">
                  Compare retail selling prices against official National Pharmaceutical Pricing Authority (NPPA) maximum retail ceilings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pharmacy Partner CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Do You Own a Licensed Medical Store in Indore?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Connect directly with local patients searching for medicines in your locality. List your inventory, streamline inquiries, and build neighborhood trust.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pharmacy/register"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-all shadow-subtle flex items-center gap-1.5"
            >
              <span>Register Your Pharmacy Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              Pharmacy Partner Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
