-- GympAPPa Combined Database Schema
-- PERA sports and gymnasium management system
-- Combined from all mini-apps: login-profile-pages, availability-dashboard, equipment-handling, equipment-module

-- Create user table (from login-profile-pages)
CREATE TABLE IF NOT EXISTS "user" (
  user_id VARCHAR(20) PRIMARY KEY,
  role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'games-captain', 'admin', 'counter-staff', 'psu', 'faculty-coordinator', 'coach', 'private-coach', 'academic-staff')),
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

-- Allow password to be null for Firebase users
ALTER TABLE "user" ALTER COLUMN password DROP NOT NULL;
ALTER TABLE "user" ALTER COLUMN password DROP DEFAULT;

-- Add missing columns if not present
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password_set BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'password';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;

-- Update constraint
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_auth_provider_check;
ALTER TABLE "user" ADD CONSTRAINT user_auth_provider_check CHECK (auth_provider IN ('password', 'firebase', 'hybrid'));

-- Update existing users
UPDATE "user"
SET password_set = CASE WHEN password IS NOT NULL THEN TRUE ELSE FALSE END,
    auth_provider = CASE WHEN password IS NOT NULL THEN 'password' ELSE 'firebase' END;

-- Create indexes for user table
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

-- Create indexes for role requests
CREATE INDEX IF NOT EXISTS idx_role_request_user_id ON role_request(user_id);
CREATE INDEX IF NOT EXISTS idx_role_request_status ON role_request(status);

-- Create sports table (from availability-dashboard)
CREATE TABLE IF NOT EXISTS sports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Create equipment table (from availability-dashboard)
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Create sport_equipment table (from availability-dashboard)
CREATE TABLE IF NOT EXISTS sport_equipment (
  id SERIAL PRIMARY KEY,
  sport_id INT REFERENCES sports(id) ON DELETE CASCADE,
  equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
  display_name VARCHAR(150) NOT NULL,
  total_quantity INT NOT NULL,
  remaining_quantity INT NOT NULL
);

-- Create requested_equipment table (from availability-dashboard)
CREATE TABLE IF NOT EXISTS requested_equipment (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  equipment_id INT REFERENCES sport_equipment(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  pickup_time VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'pending_return', 'returned')),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for equipment tables
CREATE INDEX IF NOT EXISTS idx_sport_equipment_sport_id ON sport_equipment(sport_id);
CREATE INDEX IF NOT EXISTS idx_sport_equipment_equipment_id ON sport_equipment(equipment_id);
CREATE INDEX IF NOT EXISTS idx_requested_equipment_student_id ON requested_equipment(student_id);
CREATE INDEX IF NOT EXISTS idx_requested_equipment_equipment_id ON requested_equipment(equipment_id);
CREATE INDEX IF NOT EXISTS idx_requested_equipment_status ON requested_equipment(status);

-- Add trigger to update updated_at timestamp for user table
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

-- Insert sample data
INSERT INTO sports (name) VALUES ('Badminton'), ('Baseball'), ('Basketball'), ('Boxing'), ('Chess'), ('Cricket'), ('Elle'), ('Football'), ('Hockey'), ('Rugby'), ('Table Tennis'), ('Tennis'), ('Track & Field'), ('Volleyball') ON CONFLICT DO NOTHING;

INSERT INTO equipment (name) VALUES ('Bat'), ('Ball'), ('Racket'), ('Shuttlecock'), ('Gloves'), ('Shoes'), ('Uniform'), ('Pad'), ('Helmet'), ('Javelin'), ('Shot Put'), ('Clock') ON CONFLICT DO NOTHING;

INSERT INTO sport_equipment (sport_id, equipment_id, display_name, total_quantity, remaining_quantity) VALUES
(6, 1, 'Cricket Bat', 6, 6),
(6, 2, 'Cricket Ball', 10, 10),
(2, 1, 'Baseball Bat', 6, 6),
(2, 2, 'Baseball', 10, 10),
(3, 2, 'Basketball', 6, 6),
(12, 3, 'Tennis Racket', 8, 8),
(12, 2, 'Tennis Ball', 20, 20),
(11, 3, 'Table Tennis Racket', 10, 10),
(11, 2, 'Table Tennis Ball', 20, 20),
(1, 3, 'Badminton Racket', 10, 10),
(1, 4, 'Shuttlecock', 20, 20),
(14, 2, 'Volleyball', 6, 6),
(8, 2, 'Football', 6, 6),
(10, 2, 'Rugby Ball', 4, 4),
(9, 2, 'Hockey Ball', 10, 10),
(7, 2, 'Elle Ball', 6, 6),
(5, 8, 'Chess Board', 5, 5),
(7, 1, 'Elle Bat', 10, 10),
(9, 1, 'Hockey Bat', 10, 10),
(4, 5, 'Boxing Gloves', 10, 10),
(13, 10, 'Javelin', 10, 10),
(13, 11, 'Shot Put', 10, 10),
(5, 12, 'Chess Clock', 10, 10) ON CONFLICT DO NOTHING;