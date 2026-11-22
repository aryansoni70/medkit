// Shared types and utilities inlined from packages/shared
// (No cross-workspace dependency needed)

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

export enum StockFreshness {
  FRESH = 'FRESH',
  NEEDS_CONFIRMATION = 'NEEDS_CONFIRMATION',
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

/**
 * Calculates great-circle distance between two coordinates using the Haversine formula (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function evaluateStockFreshness(lastUpdatedDate: Date | string): {
  freshness: StockFreshness;
  hoursAgo: number;
} {
  const updated = new Date(lastUpdatedDate);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  const hoursAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (hoursAgo < 6) return { freshness: StockFreshness.FRESH, hoursAgo };
  if (hoursAgo < 24) return { freshness: StockFreshness.NEEDS_CONFIRMATION, hoursAgo };
  return { freshness: StockFreshness.UNCONFIRMED, hoursAgo };
}

export function calculateStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return StockStatus.OUT_OF_STOCK;
  if (quantity <= 5) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
}
