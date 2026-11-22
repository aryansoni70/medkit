import React from 'react';
import Link from 'next/link';
import { ShieldCheck, HeartPulse, Building2, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      {/* Top Banner */}
      <div className="border-b border-slate-800 py-6 bg-slate-950/40">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-primary flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Verified Pharmacies</h4>
              <p className="text-slate-400 text-xs">Every listed pharmacy is cross-checked against valid State Drug Licenses.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Real-Time Stock Discovery</h4>
              <p className="text-slate-400 text-xs">Live stock freshness tracking so you never waste time visiting empty shelves.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Zero Therapeutic Substitution</h4>
              <p className="text-slate-400 text-xs">We respect your doctor&apos;s prescription. No automatic medicine substitution.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="MedKit Logo"
                className="h-9 w-auto object-contain rounded-lg bg-white p-0.5"
              />
              <span className="text-lg font-bold text-white">
                Med<span className="text-primary">Kit</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              India&apos;s trusted medicine availability and nearby pharmacy discovery platform.
              Empowering customers to locate authentic medications immediately at neighborhood chemists across Indore and beyond.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Quick Discovery</h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/search" className="hover:text-primary transition-colors">
                  Search Medicine Availability
                </Link>
              </li>
              <li>
                <Link href="/search?category=Pain%20relief" className="hover:text-primary transition-colors">
                  Pain Relief & Antipyretics
                </Link>
              </li>
              <li>
                <Link href="/search?category=Antibiotics" className="hover:text-primary transition-colors">
                  Essential Antibiotics
                </Link>
              </li>
              <li>
                <Link href="/search?category=Digestive%20health" className="hover:text-primary transition-colors">
                  Digestive & Gastro Care
                </Link>
              </li>
              <li>
                <Link href="/search?category=Vitamins%20and%20supplements" className="hover:text-primary transition-colors">
                  Vitamins & Supplements
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Pharmacies & Regulatory */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Pharmacies & Portals</h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/pharmacy/register" className="hover:text-primary transition-colors">
                  Register Your Pharmacy
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Pharmacy Store Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Administrative Portal
                </Link>
              </li>
              <li>
                <a
                  href="https://drugregistry.abdm.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  ABDM Drug Registry <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  NPPA Pharma Sahi Daam <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Medical & Legal Disclaimer */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px]">Regulatory Compliance</h5>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-normal">
              <strong className="text-amber-400 block mb-1">Statutory Medical Notice:</strong>
              MedKit is an information and pharmacy discovery platform. MedKit is not an online pharmacy, does not sell or distribute medicines directly, and does not provide medical consultations or substitute prescribed drugs. Prescriptions must be verified in person by registered pharmacists under the Drugs & Cosmetics Act.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} MedKit Healthcare Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-400">Terms of Service</Link>
            <Link href="/" className="hover:text-slate-400">Grievance Redressal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
