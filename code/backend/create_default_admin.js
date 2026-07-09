import bcrypt from 'bcryptjs';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'gympappa_spooty',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Dewondara29',
});

try {
  await client.connect();
  const hash = await bcrypt.hash('password123', 10);
  await client.query(
    'INSERT INTO "user" (user_id, role, university_email, name, password, password_set, auth_provider) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (user_id) DO NOTHING',
    ['admin', 'admin', 'admin@pdn.ac.lk', 'Admin User', hash, true, 'password']
  );
  console.log('Default admin account ready: admin / password123');
  await client.end();
} catch (error) {
  console.error('Failed to create default admin account:', error.message);
  process.exit(1);
}
