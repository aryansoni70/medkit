import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'medinear_super_secret_jwt_key_32chars_minimum',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'medinear_cookie_salt_secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  defaultRadiusKm: parseInt(process.env.DEFAULT_RADIUS_KM || '5', 10),
  freshStockThresholdHours: parseInt(process.env.FRESH_STOCK_THRESHOLD_HOURS || '6', 10),
  staleStockThresholdHours: parseInt(process.env.STALE_STOCK_THRESHOLD_HOURS || '24', 10),
};
