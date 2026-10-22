import dotenv from 'dotenv';

dotenv.config();

// Every setting has a default matching the historical hardcoded value, so an
// existing deployment keeps working without a new .env file.
export const config = {
  port: Number(process.env.API_PORT) || 3020,
  mongoUrl: process.env.MONGO_URL || 'mongodb://mongo/boutikdac',
  // Comma-separated list of origins allowed to call the API from a browser.
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
