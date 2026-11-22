export enum Role {
  CUSTOMER = 'CUSTOMER',
  PHARMACY = 'PHARMACY',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  UNCONFIRMED = 'UNCONFIRMED'
}

export enum PrescriptionCategory {
  OTC = 'OTC',
  SCHEDULE_H = 'SCHEDULE_H',
  SCHEDULE_H1 = 'SCHEDULE_H1',
  SCHEDULE_X = 'SCHEDULE_X'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export enum StockFreshness {
  FRESH = 'FRESH', // < 6 hours
  NEEDS_CONFIRMATION = 'NEEDS_CONFIRMATION', // 6 - 24 hours
  UNCONFIRMED = 'UNCONFIRMED' // > 24 hours
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Pharmacy {
  id: string;
  ownerId: string;
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
  verificationStatus: VerificationStatus;
  isActive: boolean;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  registryCode: string; // e.g. ABDM or CDSCO registry code
  brandName: string;
  genericName: string;
  activeIngredients: string[];
  strength: string;
  dosageForm: string; // Tablet, Syrup, Capsule, Ointment, Injection, Inhaler, Drops
  manufacturer: string;
  packSize: string;
  prescriptionCategory: PrescriptionCategory;
  category: string; // Pain relief, Antibiotics, Digestive, Cardiovascular, Vitamins, etc.
  description?: string;
  storageConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyInventoryItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  price: number; // Listed retail price (INR)
  mrp: number; // Maximum retail price (INR)
  stockStatus: StockStatus;
  lastUpdated: string;
  medicine?: Medicine;
  pharmacy?: Pharmacy;
}

export interface NearbyPharmacyResult {
  pharmacy: Pharmacy;
  inventory: {
    id: string;
    quantity: number;
    price: number;
    mrp: number;
    stockStatus: StockStatus;
    lastUpdated: string;
    freshness: StockFreshness;
    freshnessHoursAgo: number;
  };
  distanceKm: number;
  estimatedDriveTimeMinutes?: number;
}

export interface StockAuditLog {
  id: string;
  pharmacyId: string;
  medicineId: string;
  previousQuantity: number;
  newQuantity: number;
  previousPrice: number;
  newPrice: number;
  updatedBy: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  customer?: User;
  pharmacy?: Pharmacy;
  medicine?: Medicine;
}

export interface MedicineSearchQuery {
  q?: string;
  genericName?: string;
  brandName?: string;
  category?: string;
  dosageForm?: string;
  prescriptionCategory?: PrescriptionCategory;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sortBy?: 'distance' | 'price' | 'relevance';
  inStockOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
