import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Import routes
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import manageRoutes from './routes/manage.js';
import adminRoutes from './routes/admin.js';
import partnerFinderRoutes from './routes/partnerFinder.js';

dotenv.config();

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "gympappa-final",
      private_key_id: "1606055fd2e935989fe75e21729f0fc31d257b4e",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCjUBh7upoB/oFa\nXXoh61RzBQPcYmINSMg84NO0wQeYUoyPdEWK3OLeqjP5lr+Ppr4g/xuDufVAk4ew\ndbz/jxUJ0kYaiheZbHTQEB1KEufbTc47dqUl90pNpSjkdq1jRIc8RycA8HotUxXO\nXh7Xsn7PUMwGM5Uf+yo6+etRfjF9BKHHVOTm3eo/dK/U9Q2gR5cIB6weTUKbRsDM\nQ0xrxXEu9I47Vc710xUwKKAP+TKo3olBZimzHFKrE8MzLA+OzQik34lOoLsdA+u2\nf4p0DGoO7OBr7krnZM7Pbk7lZSxlA58uH/rwbgmV76i06uvFY9ukPMxQxBdm4MuY\ndr/R2QiTAgMBAAECggEAPcjdmmG8RijdEyzuOcroRiONlGD8K35vkuiT73xfvTbt\nyo/4h1KN2iOWSkTH8DbrE1ywMiO2L1ohKZdBi4W8Nd0BfKTlzLuFbfnKuu1wHj3P\nWhvG2xg1Wi6zy8tCSZ3xc9KPZQGVl3QpecuN65ix9QjiRy5YqqLBFVLbvhb57gup\nxcK0724+MZkAYz8FORnUg/0X9J/65RjsWs2y3NE1BJPV0Y8+pfTAuvp8ii+0LRUN\nkK6b5kcp32Qu165F2UBZQEdW393myQ2LCehGzOCHccVh/1+CLwUvxjsqOT/RzDD/\nfloJNiLmg6o0bG2y0TTiCsfEZ3qJatCPjIXaQ79VEQKBgQDTKkyjhgoXNCsx+gNs\njbv9XlBDKmQzmDwGLd+VAfcdsZJn2ESohDBjlaA4W8orgllO+mlOBt8zpY0F2FK6\n/marvaK6VgXd10Lm3sArO3mCjUrnAKFThcsJ/JC8Ylfmu9k9RSHmMduEzrhFeuEh\nBRhpHF4+/ura6kIczGa1x7yLrQKBgQDF/NLI8fHP8r4KkBfZCHpR7RoY/47H9tbs\nY27J0/Jx6OEaX/VfoeawCXk7cZBT5iQlAqeRIyGiXxsrq19/z3ahSkUD7SLWwgCp\naNe2EErU+ucNLG0PrlfYZ/MwNoBS8FFaQXEl8bi8QmMaYxbpomrCwpRn3j1Boqhd\nLS+/7iJtPwKBgQCXk35txvKJU25KMn+wtVCi/8c3Xz+L9ZPoj5c1O7LpwqQoHIq0\nOCcP5MCck+7cKnX3BjL+yln/la9T6cMA7Uo/ryEXBlaxtioU1QI2RjvjpY6FoOMs\ntBZZtc0jHKiiPGck3vIFbfZ4L3cAkML3U9QA51cTeyKUP6FzUJnNlHFYBQKBgQC0\nwXrLvKAxYwP/7sfm/Kd4TojKE9+OTpyv2qPWHeu19ZA2HS+PLOfJBg0pqSfEgVO0\nenTzu+hELqJGv0IEFSvQW1chG4n4Gcyy3iY6cStwwNTbIRk8/MX0rArJlKiZkBAl\n36NmqgYn0lBaUeckTIU95JnLLoosd01RLCTxDH9fzwKBgGZNPJt9SPzXi0P+5GV3\n0g/24O8Lwo9T/2DDTpGr4eVGuQEbfwKXb1NnpSVdJbJb+5j054wMF2iwCyTTlFQd\nrUtYjeKQQcmad1vQX+FI8U5IVWmlx74f80CaaJetkCcjVH6J1rja5yTk3sJkR1EH\nscXob29yx6HvPEJOqgRDVKOu\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-fbsvc@gympappa-final.iam.gserviceaccount.com",
      client_id: "101686913551948027000",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gympappa-final.iam.gserviceaccount.com"
    })
  });
  console.log('✓ Firebase initialized');
} catch (error) {
  console.warn('⚠ Firebase not initialized - Firebase login disabled');
  console.error(error.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/manage', manageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner-finder', partnerFinderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});