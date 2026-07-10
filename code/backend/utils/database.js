import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Prevent pg from parsing DATE columns into JS Date objects.
// By default, node-postgres converts DATE columns into JS Date objects
// using the server's LOCAL timezone, which shifts the day backward/forward
// when your server timezone isn't UTC (e.g. Sri Lanka UTC+5:30).
// Returning the raw 'YYYY-MM-DD' string avoids all of that entirely.
pkg.types.setTypeParser(1082, (val) => val); // 1082 = date OID

// Always use individual connection parameters, never connection string
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gympappa_final',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '', // Empty string means no password
};

console.log(`Connecting to database: ${poolConfig.user}@${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;