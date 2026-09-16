import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

// Import server logic and middleware
import { setupAuth } from '../server/auth';
import apiV1Routes from '../server/routes/api/v1/index';
import { errorHandler } from '../server/middleware/error.middleware';

const app = express();

// Configure CORS for Firebase
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints (accessible via direct function URL or Firebase rewrite)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup authentication (session, passport, /api/login, /api/register, /api/auth/firebase, /api/user)
setupAuth(app);

// Mount new v1 API routes
app.use("/api/v1", apiV1Routes);

// Global error handler
app.use(errorHandler);

// Export the Firebase function
export const api = functions.https.onRequest(app);