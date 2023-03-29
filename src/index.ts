import express from 'express';
import { database } from './database';
import cors from 'cors';
import { mainRouter } from './router';
import dotenv from 'dotenv';

dotenv.config();

const API_PORT = process.env.API_PORT || 3020;

// Database connection
database.connect();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);

// Routes
app.use('/', mainRouter());

app.use(
  cors({
    origin: '*',
  })
);

// Listen
app.listen(API_PORT, () => {
  console.log('Logiboutik API is up and working');
});
