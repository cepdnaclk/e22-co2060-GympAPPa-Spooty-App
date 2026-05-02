import bcrypt from 'bcryptjs';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gympappa',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function createUser() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await pool.query(`
      INSERT INTO "user" (user_id, role, university_email, name, password, password_set, auth_provider)
      VALUES ('s20001', 'student', 's20001@pdn.ac.lk', 'Test Student', $1, true, 'password')
      ON CONFLICT (user_id) DO NOTHING
    `, [hash]);
    console.log('✓ Test user created: s20001 / password123');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

createUser();