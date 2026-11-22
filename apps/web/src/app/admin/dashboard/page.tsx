'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ShieldAlert,
  Users,
  Store,
  Pill,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Activity,
  Check
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isLoading, login } = useAuth();

  const [activeTab, setActiveTab] = useState<'pharmacies' | 'medicines' | 'logs'>('pharmacies');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPharmacies: 0,
    verifiedPharmacies: 0,
    pendingPharmacies: 0,
    totalMedicines: 0,
    totalInventoryListings: 0,
    recentAuditLogs: [] as any[]
  });

  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [pharmacyFilter, setPharmacyFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('PENDING');
  const [loading, setLoading] = useState(true);

  // Add Medicine Form
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    registryCode: '',
    brandName: '',
    genericName: '',
    activeIngredients: '',
    strength: '',
    dosageForm: 'Tablet',
    manufacturer: '',
    packSize: '',
    prescriptionCategory: 'SCHEDULE_H',
    category: 'General'
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, pharmRes, medRes] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getPharmacies({
          status: pharmacyFilter === 'ALL' ? undefined : pharmacyFilter
        }),
        api.admin.getMedicines({ limit: 50 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (pharmRes.success) setPharmacies(pharmRes.data);
      if (medRes.success) setMedicines(medRes.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [pharmacyFilter]);

  const handleUpdateVerification = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.admin.updateVerification(id, status);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createMedicine({
        ...newMed,
        activeIngredients: newMed.activeIngredients.split(',').map((s) => s.trim())
      });
      setIsAddMedOpen(false);
      setNewMed({
        registryCode: '',
        brandName: '',
        genericName: '',
        activeIngredients: '',
        strength: '',
        dosageForm: 'Tablet',
        manufacturer: '',
        packSize: '',
        prescriptionCategory: 'SCHEDULE_H',
        category: 'General'
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to add medicine');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brandText-secondary font-medium">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-brandText-primary mb-1">
            Administrator Access Required
          </h2>
          <p className="text-xs text-brandText-secondary">
            Please log in with system administrator credentials (admin@medkit.in).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={async () => {
              await login({ email: 'admin@medkit.in', password: 'admin123' });
              fetchAdminData();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-2xs"
          >
            ⚡ 1-Click Admin Login
          </button>
          <Link href="/login" className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-brandText-primary">
              MedKit Platform Administration
            </h1>
            <p className="text-xs text-brandText-secondary">
              Central catalog management, pharmacy license verification, and inventory audit logs
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchAdminData()}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 self-start sm:self-auto"
          title="Refresh stats"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-border shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Users
          </span>
          <div className="text-xl font-bold text-brandText-primary mt-1">
            {stats.totalUsers}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Pharmacies
          </span>
          <div className="text-xl font-bold text-brandText-primary mt-1">
            {stats.totalPharmacies}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-2xs">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Verified Stores
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {stats.verifiedPharmacies}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-2xs">
          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">
            Pending Approval
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {stats.pendingPharmacies}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-2xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Medicines in Catalog
          </span>
          <div className="text-xl font-bold text-brandText-primary mt-1">
            {stats.totalMedicines}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-2xs">
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider block">
            Stock Listings
          </span>
          <div className="text-xl font-bold text-secondary mt-1">
            {stats.totalInventoryListings}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border text-xs font-semibold space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('pharmacies')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'pharmacies'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-brandText-primary'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Pharmacy Applications ({stats.pendingPharmacies} Pending)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medicines')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'medicines'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-brandText-primary'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medicine Catalogue ({stats.totalMedicines})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-brandText-primary'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Stock Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Pharmacy Applications Review */}
      {activeTab === 'pharmacies' && (
        <div className="bg-white rounded-2xl border border-border shadow-subtle overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-brandText-primary">
              Pharmacy Store Licensing & Verification
            </h3>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {(['PENDING', 'VERIFIED', 'ALL'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPharmacyFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    pharmacyFilter === filter
                      ? 'bg-white text-brandText-primary shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading applications...</div>
            ) : pharmacies.length > 0 ? (
              pharmacies.map((pharm) => (
                <div
                  key={pharm.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-brandText-primary">{pharm.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pharm.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pharm.verificationStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {pharm.verificationStatus}
                      </span>
                    </div>

                    <p className="text-xs text-brandText-secondary">
                      {pharm.address}, {pharm.city}, {pharm.state} - {pharm.postalCode}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>
                        Drug License No: <strong className="font-mono text-brandText-primary">{pharm.licenseNumber}</strong>
                      </span>
                      <span>·</span>
                      <span>Owner: {pharm.owner?.name} ({pharm.phone})</span>
                      <span>·</span>
                      <span>Listed Medicines: {pharm._count?.inventories || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {pharm.verificationStatus === 'PENDING' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateVerification(pharm.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1 shadow-subtle"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Store
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateVerification(pharm.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : pharm.verificationStatus === 'VERIFIED' ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Live & Verified
                      </span>
                    ) : (
                      <span className="text-xs text-rose-500 font-medium">Application Rejected</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No pharmacy applications found under status {pharmacyFilter}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Medicine Catalogue */}
      {activeTab === 'medicines' && (
        <div className="bg-white rounded-2xl border border-border shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-brandText-primary">
                National Drug Catalogue
              </h3>
              <p className="text-xs text-brandText-secondary">
                Verified formulations modelled on CDSCO & NPPA data
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMedOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Formulation</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-2.5 px-3">Brand Name</th>
                  <th className="py-2.5 px-3">Generic Salt</th>
                  <th className="py-2.5 px-3">Form / Strength</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Prescription</th>
                  <th className="py-2.5 px-3">Manufacturer</th>
                  <th className="py-2.5 px-3">Registry Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-brandText-primary">
                      {m.brandName}
                    </td>
                    <td className="py-3 px-3 text-brandText-secondary italic">
                      {m.genericName}
                    </td>
                    <td className="py-3 px-3">
                      {m.dosageForm} ({m.strength})
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.category}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.prescriptionCategory === 'OTC'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {m.prescriptionCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{m.manufacturer}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {m.registryCode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Audit Log */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-border shadow-subtle p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-brandText-primary">
              Real-Time Stock Audit Trail
            </h3>
            <p className="text-xs text-brandText-secondary">
              Immutable logging of all inventory quantity and pricing modifications across pharmacies
            </p>
          </div>

          <div className="space-y-3">
            {stats.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
              stats.recentAuditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-brandText-primary">
                      {log.pharmacy?.name} ({log.pharmacy?.city})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Updated <strong>{log.medicine?.brandName}</strong> ({log.medicine?.strength})
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-emerald-600">
                      Qty: {log.previousQuantity} ➔ {log.newQuantity} units
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Price: ₹{log.newPrice} · by {log.updatedBy}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent stock audit logs found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {isAddMedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-float border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-brandText-primary">Add Formulation to Catalogue</h3>
              <button
                type="button"
                onClick={() => setIsAddMedOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">CDSCO/Registry Code *</label>
                <input
                  type="text"
                  required
                  value={newMed.registryCode}
                  onChange={(e) => setNewMed({ ...newMed, registryCode: e.target.value })}
                  placeholder="IN-CDSCO-00999"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newMed.brandName}
                    onChange={(e) => setNewMed({ ...newMed, brandName: e.target.value })}
                    placeholder="e.g. Crocin 650"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={newMed.genericName}
                    onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Active Ingredients (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={newMed.activeIngredients}
                  onChange={(e) => setNewMed({ ...newMed, activeIngredients: e.target.value })}
                  placeholder="Paracetamol IP 650mg, Caffeine 50mg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Strength *</label>
                  <input
                    type="text"
                    required
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    placeholder="650 mg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Dosage Form *</label>
                  <select
                    value={newMed.dosageForm}
                    onChange={(e) => setNewMed({ ...newMed, dosageForm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Powder">Powder</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Prescription *</label>
                  <select
                    value={newMed.prescriptionCategory}
                    onChange={(e) => setNewMed({ ...newMed, prescriptionCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="OTC">OTC</option>
                    <option value="SCHEDULE_H">Schedule H</option>
                    <option value="SCHEDULE_H1">Schedule H1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={newMed.manufacturer}
                    onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
                    placeholder="GlaxoSmithKline"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Pack Size *</label>
                  <input
                    type="text"
                    required
                    value={newMed.packSize}
                    onChange={(e) => setNewMed({ ...newMed, packSize: e.target.value })}
                    placeholder="15 Tablets in a strip"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={newMed.category}
                  onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                  placeholder="Pain relief / Antibiotics / Cardiovascular"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMedOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover shadow-subtle"
                >
                  Save Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
