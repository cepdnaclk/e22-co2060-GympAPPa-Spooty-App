-- GympAPPa Database Schema
-- PERA sports and gymnasium management system

-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
  user_id VARCHAR(20) PRIMARY KEY,
  role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'games-captain', 'admin', 'counter-staff', 'psu', 'faculty-cordinator', 'coach', 'private-coach', 'academic-staff')),
  university_email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  password_set BOOLEAN NOT NULL DEFAULT FALSE,
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'password' CHECK (auth_provider IN ('password', 'firebase', 'hybrid')),
  firebase_uid VARCHAR(255) UNIQUE,
  profile_picture TEXT,
  tel VARCHAR(20),
  personal_email VARCHAR(255),
  district VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "user" ALTER COLUMN password DROP NOT NULL;
ALTER TABLE "user" ALTER COLUMN password DROP DEFAULT;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password_set BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'password';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;

ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_auth_provider_check;
ALTER TABLE "user" ADD CONSTRAINT user_auth_provider_check CHECK (auth_provider IN ('password', 'firebase', 'hybrid'));

UPDATE "user"
SET password_set = CASE WHEN password IS NOT NULL THEN TRUE ELSE FALSE END,
    auth_provider = CASE WHEN password IS NOT NULL THEN 'password' ELSE 'firebase' END;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_id ON "user"(user_id);
CREATE INDEX IF NOT EXISTS idx_university_email ON "user"(university_email);
CREATE INDEX IF NOT EXISTS idx_role ON "user"(role);

-- Create role request table for future functionality
CREATE TABLE IF NOT EXISTS role_request (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  requested_role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES "user"(user_id) ON DELETE SET NULL
);

-- Create index for role requests
CREATE INDEX IF NOT EXISTS idx_role_request_user_id ON role_request(user_id);
CREATE INDEX IF NOT EXISTS idx_role_request_status ON role_request(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_updated_at ON "user";
CREATE TRIGGER trigger_update_user_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_user_updated_at();
