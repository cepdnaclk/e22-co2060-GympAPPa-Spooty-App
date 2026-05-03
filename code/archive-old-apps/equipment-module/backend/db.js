// ============================================================
// db.js — Database Connection
// This file creates ONE connection pool to PostgreSQL
// that the whole backend shares.
// ============================================================

const { Pool } = require('pg');  // 'pg' is the PostgreSQL library for Node.js

// Read database credentials from the .env file
// Never hardcode passwords in your code!
const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'gympappa',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release(); // release the test connection back to the pool
    }
});

// Export the pool so other files can use it
module.exports = pool;