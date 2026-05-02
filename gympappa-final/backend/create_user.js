import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/gympappa_final'
});

async function createUser() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    await pool.query(`
      INSERT INTO "user" (user_id, role, university_email, name, password, password_set, auth_provider)
      VALUES ('e22018', 'student', 'e22018@eng.pdn.ac.lk', 'Test Student', $1, true, 'password')
      ON CONFLICT (user_id) DO NOTHING
    `, [hash]);
    console.log('Test user created');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

createUser();