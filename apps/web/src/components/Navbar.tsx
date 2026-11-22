'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { LocationModal } from './LocationModal';
import {
  MapPin,
  Menu,
  X,
  User as UserIcon,
  Store,
  ShieldAlert,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  Flag
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { location } = useLocation();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      {/* Top Announcement Bar like reference UI */}
      <div className="w-full bg-[#EBF7F0] border-b border-[#D2EEDD] py-1.5 px-4 text-center text-xs font-medium text-[#166534] flex items-center justify-center gap-2">
        <span className="flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-emerald-600 inline" />
          <span>Introducing <strong>MedKit 2.0</strong> — Live verified pharmacy stock discovery across Indore</span>
        </span>
        <Link href="/search" className="underline underline-offset-2 hover:text-emerald-800 font-semibold ml-1 hidden sm:inline">
          Explore Stores →
        </Link>
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-border shadow-subtle">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="MedKit Logo"
                className="h-9 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-brandText-primary leading-tight">
                  Med<span className="text-primary">Kit</span>
                </span>
                <span className="text-[9px] uppercase font-semibold tracking-wider text-brandText-secondary leading-none">
                  Verified Pharmacy Discovery
                </span>
              </div>
            </Link>

            {/* Location Selector Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-brandText-primary transition-all max-w-[260px]"
              title="Change search location"
            >
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{location.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-white text-[10px] font-semibold text-secondary shadow-2xs border border-slate-200 flex-shrink-0">
                {location.radiusKm} km
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-brandText-secondary">
            <Link
              href="/"
              className={`hover:text-primary transition-colors ${
                pathname === '/' ? 'text-primary font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/search"
              className={`hover:text-primary transition-colors ${
                pathname === '/search' ? 'text-primary font-semibold' : ''
              }`}
            >
              Find Medicines
            </Link>
            <Link
              href="/pharmacies"
              className={`hover:text-primary transition-colors ${
                pathname === '/pharmacies' ? 'text-primary font-semibold' : ''
              }`}
            >
              Medical Stores (10+)
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pharmacy/register"
              className="hover:text-primary transition-colors"
            >
              For Pharmacies
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Mobile Location button */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-primary border border-slate-200"
            >
              <MapPin className="w-4 h-4" />
            </button>

            {/* Action Button styled like reference UI (green pill button) */}
            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F382A] hover:bg-[#16533E] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Search Now</span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-brandText-primary border border-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-float border border-slate-200 py-1.5 z-50 text-xs animate-fade-in"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-brandText-primary">{user.name}</p>
                      <p className="text-[11px] text-brandText-secondary truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'PHARMACY' && (
                      <Link
                        href="/pharmacy/dashboard"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-brandText-primary"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Store className="w-4 h-4 text-primary" />
                        Pharmacy Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-brandText-primary"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShieldAlert className="w-4 h-4 text-primary" />
                        Admin Panel
                      </Link>
                    )}

                    <Link
                      href="/search"
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-brandText-primary"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Browse Medicines
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-brandText-primary hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-border px-4 py-3 space-y-2 animate-fade-in text-sm">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-brandText-primary hover:text-primary font-medium"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-brandText-primary hover:text-primary font-medium"
            >
              Find Medicines & Pharmacies
            </Link>
            <Link
              href="/pharmacies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-brandText-primary hover:text-primary font-medium"
            >
              Medical Stores Directory (10+)
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-brandText-primary hover:text-primary font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/pharmacy/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-brandText-primary hover:text-primary font-medium"
            >
              Onboard Pharmacy
            </Link>

            {user?.role === 'PHARMACY' && (
              <Link
                href="/pharmacy/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-primary font-semibold"
              >
                Pharmacy Dashboard
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-primary font-semibold"
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
}
