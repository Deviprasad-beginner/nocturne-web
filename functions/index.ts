import * as functions from 'firebase-functions';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';

// Import your existing server logic
import { registerRoutes } from '../server/routes';

const app = express();

// Configure CORS for Firebase
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = createServer(app);

// Register all your existing routes
registerRoutes(app).then(() => {
  console.log('Routes registered successfully');
}).catch((error) => {
  console.error('Error registering routes:', error);
});

// Export the Firebase function
export const api = functions.https.onRequest(app);

// For WebSocket support in Firebase, you might need to use a different approach
// or consider using Firebase Realtime Database or Firestore for real-time features