import { z } from 'zod';
import { Role, StockStatus, PrescriptionCategory, ReservationStatus, VerificationStatus } from '../types';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.nativeEnum(Role).default(Role.CUSTOMER)
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const pharmacyOnboardingSchema = z.object({
  name: z.string().min(3, 'Pharmacy name must be at least 3 characters'),
  address: z.string().min(5, 'Full street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().min(8, 'Contact phone is required'),
  email: z.string().email('Valid pharmacy contact email').optional(),
  openingHours: z.string().default('08:00 AM - 10:00 PM'),
  licenseNumber: z.string().min(5, 'Valid Drug License number is required')
});

export const medicineQuerySchema = z.object({
  q: z.string().optional(),
  genericName: z.string().optional(),
  brandName: z.string().optional(),
  category: z.string().optional(),
  dosageForm: z.string().optional(),
  prescriptionCategory: z.nativeEnum(PrescriptionCategory).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(50).default(5),
  sortBy: z.enum(['distance', 'price', 'relevance']).default('distance'),
  inStockOnly: z.coerce.boolean().default(false),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export const inventoryUpdateSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  price: z.number().positive('Price must be greater than zero'),
  mrp: z.number().positive('MRP must be greater than zero'),
  stockStatus: z.nativeEnum(StockStatus).optional()
});

export const bulkInventoryUpdateSchema = z.object({
  updates: z.array(inventoryUpdateSchema)
});

export const reservationRequestSchema = z.object({
  pharmacyId: z.string().min(1),
  medicineId: z.string().min(1),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

export const verificationUpdateSchema = z.object({
  verificationStatus: z.nativeEnum(VerificationStatus),
  rejectionReason: z.string().optional()
});

export const medicineCreateSchema = z.object({
  registryCode: z.string().min(3),
  brandName: z.string().min(2),
  genericName: z.string().min(2),
  activeIngredients: z.array(z.string()).min(1),
  strength: z.string().min(1),
  dosageForm: z.string().min(1),
  manufacturer: z.string().min(2),
  packSize: z.string().min(1),
  prescriptionCategory: z.nativeEnum(PrescriptionCategory),
  category: z.string().min(2),
  description: z.string().optional(),
  storageConditions: z.string().optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PharmacyOnboardingInput = z.infer<typeof pharmacyOnboardingSchema>;
export type MedicineQueryInput = z.infer<typeof medicineQuerySchema>;
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
export type BulkInventoryUpdateInput = z.infer<typeof bulkInventoryUpdateSchema>;
export type ReservationRequestInput = z.infer<typeof reservationRequestSchema>;
export type VerificationUpdateInput = z.infer<typeof verificationUpdateSchema>;
export type MedicineCreateInput = z.infer<typeof medicineCreateSchema>;
