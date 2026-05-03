import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gympappa_spooty',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to PostgreSQL database');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
};

export default sequelize;