// ============================================================
// server.js — Main Express Server Entry Point
// This is what you run with: node server.js
// ============================================================

require('dotenv').config();        // Load .env file variables
const express = require('express');
const cors = require('cors');       // Allows frontend to call backend

const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARE
// Middleware runs on every request before routes
// ─────────────────────────────────────────────

// Allow frontend (React on port 3000) to talk to backend (port 5000)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],  // React dev server URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Parse incoming JSON data from requests
app.use(express.json());

// ─────────────────────────────────────────────
// ROUTES
// Connect the equipment routes to /api/equipment
// ─────────────────────────────────────────────
const equipmentRoutes = require('./routes/equipmentRoutes');
app.use('/api/equipment', equipmentRoutes);

// Simple health check route — visit http://localhost:5000/ to confirm server is running
app.get('/', (req, res) => {
    res.json({ message: '✅ GympAPPa Equipment API is running!' });
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});