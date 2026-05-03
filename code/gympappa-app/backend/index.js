import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import authRoutes from './src/routes/auth.js';
import equipmentRoutes from './src/routes/equipment.js';
import { connectToDatabase } from './src/config/database.js';

dotenv.config();
console.log("PROJECT ID =", process.env.FIREBASE_PROJECT_ID);

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'fbsvc',
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'GympAPPa API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const startServer = async () => {
  await connectToDatabase();

  const portCandidates = [PORT, 5001, 5002, 5003];
  let attemptedPorts = new Set();

  const attemptStart = (index = 0) => {
    if (index >= portCandidates.length) {
      console.error('All configured ports are in use. Please free one of the ports and restart the server.');
      process.exit(1);
    }

    const port = portCandidates[index];
    if (attemptedPorts.has(port)) {
      return attemptStart(index + 1);
    }

    attemptedPorts.add(port);
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is already in use. Trying next port...`);
        attemptStart(index + 1);
      } else {
        console.error('Server startup error:', err);
        process.exit(1);
      }
    });
  };

  attemptStart();
};

startServer();
