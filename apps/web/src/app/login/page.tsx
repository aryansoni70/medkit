'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Store, User, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loggedUser = await login({ email, password });
      if (loggedUser.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (loggedUser.role === 'PHARMACY') {
        router.push('/pharmacy/dashboard');
      } else {
        router.push('/search');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-click Demo Login
  const handleQuickLogin = async (demoEmail: string, demoPass: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    setActiveRoleLoggingIn(roleName);

    try {
      const loggedUser = await login({ email: demoEmail, password: demoPass });
      if (loggedUser.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (loggedUser.role === 'PHARMACY') {
        router.push('/pharmacy/dashboard');
      } else {
        router.push('/search');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
      setActiveRoleLoggingIn(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-float space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="MedKit Logo"
            className="h-14 w-auto object-contain mx-auto rounded-xl shadow-2xs"
          />
          <h1 className="text-xl sm:text-2xl font-extrabold text-brandText-primary">
            Welcome to MedKit
          </h1>
          <p className="text-xs text-brandText-secondary">
            Sign in to check live pharmacy stock in Indore, manage inventory, or review stores
          </p>
        </div>

        {/* If already logged in banner */}
        {user && (
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-semibold block">Signed in as: {user.name}</span>
                <span className="text-[11px] text-emerald-700">Role: {user.role}</span>
              </div>
            </div>
            <Link
              href={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'PHARMACY' ? '/pharmacy/dashboard' : '/search'}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* 1-Click Fast Demo Logins */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              ⚡ 1-Click Demo Logins:
            </span>
            <span className="text-[10px] text-slate-400">Click to sign in instantly</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('customer@medkit.in', 'password123', 'Customer')}
              className="py-2.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 shadow-2xs transition-all disabled:opacity-50"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>{activeRoleLoggingIn === 'Customer' ? 'Signing in...' : 'Customer'}</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('apollo.vijaynagar@medkit.in', 'password123', 'Pharmacy')}
              className="py-2.5 px-2 bg-white hover:bg-teal-50 hover:border-teal-300 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 shadow-2xs transition-all disabled:opacity-50"
              title="Indore Pharmacy Owner (Vijay Nagar)"
            >
              <Store className="w-4 h-4 text-teal-600" />
              <span>{activeRoleLoggingIn === 'Pharmacy' ? 'Signing in...' : 'Pharmacy'}</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin@medkit.in', 'admin123', 'Admin')}
              className="py-2.5 px-2 bg-white hover:bg-indigo-50 hover:border-indigo-300 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 flex flex-col items-center justify-center gap-1 shadow-2xs transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{activeRoleLoggingIn === 'Admin' ? 'Signing in...' : 'Admin'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-brandText-secondary block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-brandText-secondary block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold shadow-subtle flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-brandText-secondary space-y-2">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register as Customer
            </Link>
          </p>
          <p>
            Pharmacy store owner?{' '}
            <Link href="/pharmacy/register" className="font-semibold text-secondary hover:underline">
              Onboard Your Pharmacy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
