import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'memberflow-pro-secret-key-123456',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '..', 'db.json'),
  ENV: process.env.NODE_ENV || 'development',
  OCR: {
    LANG: 'eng+amh',
  },
  OTP: {
    EXPIRY_MINS: 5,
  }
};
