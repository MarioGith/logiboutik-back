import express, { NextFunction, Request, Response } from 'express';
import { database } from './database';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { mainRouter } from './router';
import dotenv from 'dotenv';

dotenv.config();

const API_PORT = process.env.API_PORT || 3020;

// Database connection
database.connect();

const app = express();

// Middleware
app.use(express.json());
// Strips keys containing '$' or '.' from body/query/params to block
// MongoDB operator injection through user-supplied input.
app.use(mongoSanitize());
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);

// Routes
app.use('/', mainRouter());

// Error handler — turns rejected/thrown handlers into a proper 500 response
// instead of leaving the request hanging.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled request error:', err);
  res.status(500).send({ message: 'Internal server error' });
});

// Listen
app.listen(API_PORT, () => {
  console.log('Logiboutik API is up and working');
});
