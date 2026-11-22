import { StockFreshness, StockStatus } from '../types';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * on Earth using the Haversine formula (in kilometers).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Evaluates stock freshness based on hours since last update
 */
export function evaluateStockFreshness(lastUpdatedDate: Date | string): {
  freshness: StockFreshness;
  hoursAgo: number;
} {
  const updated = new Date(lastUpdatedDate);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  const hoursAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (hoursAgo < 6) {
    return { freshness: StockFreshness.FRESH, hoursAgo };
  } else if (hoursAgo < 24) {
    return { freshness: StockFreshness.NEEDS_CONFIRMATION, hoursAgo };
  } else {
    return { freshness: StockFreshness.UNCONFIRMED, hoursAgo };
  }
}

/**
 * Determines stock status category based on available quantity
 */
export function calculateStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return StockStatus.OUT_OF_STOCK;
  if (quantity <= 5) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
}
