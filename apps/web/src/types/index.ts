// Shared types inlined for the web app (no cross-workspace dependency)

export enum Role {
  CUSTOMER = 'CUSTOMER',
  PHARMACY = 'PHARMACY',
  ADMIN = 'ADMIN'
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  UNCONFIRMED = 'UNCONFIRMED'
}

export enum StockFreshness {
  FRESH = 'FRESH',
  NEEDS_CONFIRMATION = 'NEEDS_CONFIRMATION',
  UNCONFIRMED = 'UNCONFIRMED'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export enum PrescriptionCategory {
  OTC = 'OTC',
  SCHEDULE_H = 'SCHEDULE_H',
  SCHEDULE_H1 = 'SCHEDULE_H1',
  SCHEDULE_X = 'SCHEDULE_X'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  pharmacies?: Pharmacy[];
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string | null;
  openingHours: string;
  licenseNumber: string;
  verificationStatus: string;
  isActive: boolean;
  rating?: number;
}

export interface Medicine {
  id: string;
  registryCode: string;
  brandName: string;
  genericName: string;
  activeIngredients: string[];
  strength: string;
  dosageForm: string;
  manufacturer: string;
  packSize: string;
  prescriptionCategory: string;
  category: string;
  description?: string;
  storageConditions?: string;
}

export interface PharmacyInventoryItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  price: number;
  mrp: number;
  stockStatus: string;
  freshness?: string;
  freshnessHoursAgo?: number;
  medicine?: Medicine;
  pharmacy?: Pharmacy;
}

export interface NearbyPharmacyResult {
  pharmacy: Pharmacy;
  distanceKm: number;
  estimatedDriveTimeMinutes?: number;
  inventory: PharmacyInventoryItem | null;
}
