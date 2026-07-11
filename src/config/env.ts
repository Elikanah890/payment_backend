import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required env var: ${name}`);
    }
    return '';
  }
  return v;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

export const config = {
  nodeEnv,
  isProd,
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim()),

  database: {
    url: req('DATABASE_URL', 'postgresql://blessing_admin:Postgress321@localhost:5432/blessing_hope_db'),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    accessSecret: req('JWT_ACCESS_SECRET', 'dev_access_secret_change_me_please_32chars'),
    refreshSecret: req('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me_please_32chars'),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiryDays: parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS || '7', 10),
  },

  security: {
    loginMaxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5', 10),
    loginLockMinutes: parseInt(process.env.LOGIN_LOCK_MINUTES || '30', 10),
    rateWindowSec: parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10),
    rateMax: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
    bcryptRounds: 12,
  },

  beem: {
    apiKey: process.env.BEEM_API_KEY || '',
    apiSecret: process.env.BEEM_API_SECRET || '',
    senderId: process.env.BEEM_SENDER_ID || 'BLESSHOPE',
    baseUrl: process.env.BEEM_BASE_URL || 'https://apisms.beem.africa',
  },

  selcom: {
    merchantId: process.env.SELCOM_MERCHANT_ID || '',
    apiKey: process.env.SELCOM_API_KEY || '',
    apiSecret: process.env.SELCOM_API_SECRET || '',
    webhookSecret: process.env.SELCOM_WEBHOOK_SECRET || '',
    baseUrl: process.env.SELCOM_BASE_URL || 'https://apigw.selcommobile.com',
    environment: process.env.SELCOM_ENVIRONMENT || 'sandbox',
  },

  school: {
    defaultLateFee: parseInt(process.env.DEFAULT_LATE_FEE || '2000', 10),
    lateFeeGraceDays: parseInt(process.env.LATE_FEE_GRACE_DAYS || '5', 10),
    currency: process.env.DEFAULT_CURRENCY || 'TZS',
  },

  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@blessinghope.co.tz',
    password: process.env.SUPER_ADMIN_PASSWORD || '',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
