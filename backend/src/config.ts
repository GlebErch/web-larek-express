import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config = {
  port: Number(process.env.PORT) || 3000,
  dbAddress: process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek',
  uploadPath: process.env.UPLOAD_PATH || 'images',
  uploadPathTemp: process.env.UPLOAD_PATH_TEMP || 'temp',
  originAllow: process.env.ORIGIN_ALLOW || 'http://localhost:5173',
  authRefreshTokenExpiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
  authAccessTokenExpiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
  authJwtSecret: process.env.AUTH_JWT_SECRET || 'weblarek-secret-key',
};

export default config;
