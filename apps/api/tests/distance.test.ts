import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  evaluateStockFreshness,
  calculateStockStatus,
  StockFreshness
} from '../src/shared';

describe('Distance & Stock Freshness Engine', () => {
  it('calculates distance between Delhi landmarks', () => {
    const dist = calculateHaversineDistanceKm(28.6139, 77.2090, 28.6315, 77.2167);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(3.0);
  });

  it('calculates zero distance for identical coordinates', () => {
    const dist = calculateHaversineDistanceKm(28.6139, 77.2090, 28.6139, 77.2090);
    expect(dist).toBe(0);
  });

  it('evaluates stock freshness correctly', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(evaluateStockFreshness(twoHoursAgo).freshness).toBe(StockFreshness.FRESH);

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    expect(evaluateStockFreshness(twelveHoursAgo).freshness).toBe(StockFreshness.NEEDS_CONFIRMATION);

    const thirtySixHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000);
    expect(evaluateStockFreshness(thirtySixHoursAgo).freshness).toBe(StockFreshness.UNCONFIRMED);
  });

  it('determines stock status from quantity', () => {
    expect(calculateStockStatus(0)).toBe('OUT_OF_STOCK');
    expect(calculateStockStatus(3)).toBe('LOW_STOCK');
    expect(calculateStockStatus(25)).toBe('IN_STOCK');
  });
});
