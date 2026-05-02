-- =====================================================
-- GympAPPa Clean Database Initialization Script
-- Drops everything and recreates from scratch
-- =====================================================

-- =========================
-- DROP ALL TABLES (ORDER MATTERS)
-- =========================
DROP TABLE IF EXISTS requested_equipment CASCADE;
DROP TABLE IF EXISTS sport_equipment CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS role_request CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- =========================
-- USER TABLE
-- =========================
CREATE TABLE "user" (
  user_id VARCHAR(20) PRIMARY KEY,
  role VARCHAR(50) NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'games-captain', 'admin', 'counter-staff', 'psu', 'faculty-coordinator', 'coach', 'private-coach', 'academic-staff')),
  university_email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  password_set BOOLEAN NOT NULL DEFAULT FALSE,
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'password'
    CHECK (auth_provider IN ('password', 'firebase', 'hybrid')),
  firebase_uid VARCHAR(255) UNIQUE,
  profile_picture TEXT,
  tel VARCHAR(20),
  personal_email VARCHAR(255),
  district VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_id ON "user"(user_id);
CREATE INDEX idx_university_email ON "user"(university_email);
CREATE INDEX idx_role ON "user"(role);

-- =========================
-- ROLE REQUEST TABLE
-- =========================
CREATE TABLE role_request (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  requested_role VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(20),

  FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES "user"(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_role_request_user_id ON role_request(user_id);
CREATE INDEX idx_role_request_status ON role_request(status);

-- =========================
-- SPORTS TABLE
-- =========================
CREATE TABLE sports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- EQUIPMENT TABLE (FIXED)
-- =========================
CREATE TABLE equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- SPORT_EQUIPMENT TABLE
-- =========================
CREATE TABLE sport_equipment (
  id SERIAL PRIMARY KEY,
  sport_id INT NOT NULL,
  equipment_id INT NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  total_quantity INT NOT NULL,
  remaining_quantity INT NOT NULL,

  FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

-- =========================
-- REQUESTED EQUIPMENT TABLE
-- =========================
CREATE TABLE requested_equipment (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  equipment_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  pickup_time VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'issued'
    CHECK (status IN ('issued', 'pending_return', 'returned')),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (equipment_id) REFERENCES sport_equipment(id) ON DELETE CASCADE
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_sport_equipment_sport_id ON sport_equipment(sport_id);
CREATE INDEX idx_sport_equipment_equipment_id ON sport_equipment(equipment_id);
CREATE INDEX idx_requested_equipment_student_id ON requested_equipment(student_id);
CREATE INDEX idx_requested_equipment_equipment_id ON requested_equipment(equipment_id);
CREATE INDEX idx_requested_equipment_status ON requested_equipment(status);

-- =========================
-- TRIGGER FUNCTION
-- =========================
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION update_user_updated_at();

-- =========================
-- INSERT SAMPLE DATA
-- =========================

-- SPORTS
INSERT INTO sports (name) VALUES
('Badminton'), ('Baseball'), ('Basketball'), ('Boxing'), ('Chess'),
('Cricket'), ('Elle'), ('Football'), ('Hockey'), ('Rugby'),
('Table Tennis'), ('Tennis'), ('Track & Field'), ('Volleyball');

-- EQUIPMENT
INSERT INTO equipment (name) VALUES
('Bat'), ('Ball'), ('Racket'), ('Shuttlecock'),
('Gloves'), ('Shoes'), ('Uniform'), ('Pad'),
('Helmet'), ('Javelin'), ('Shot Put'), ('Clock');

-- SPORT_EQUIPMENT
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
(5, 12, 'Chess Clock', 10, 10);

-- =========================
-- SAMPLE USERS FOR DEMO
-- =========================

INSERT INTO "user" (user_id, role, university_email, name, password, password_set, auth_provider)
VALUES
('e22001', 'student', 'e22001@eng.pdn.ac.lk', 'Student One', 'pass123', TRUE, 'password'),
('e22002', 'games-captain', 'e22002@eng.pdn.ac.lk', 'Games Captain', 'pass123', TRUE, 'password'),
('admin01', 'admin', 'admin@gympappa.com', 'System Admin', 'admin123', TRUE, 'password'),
('staff01', 'counter-staff', 'staff@gympappa.com', 'Counter Staff', 'staff123', TRUE, 'password'),
('psu01', 'psu@gympappa.com', 'PSU Officer', 'psu123', TRUE, 'password'),
('fc01', 'faculty-coordinator', 'fc@eng.pdn.ac.lk', 'Faculty Coordinator', 'fc123', TRUE, 'password'),
('coach01', 'coach@gympappa.com', 'University Coach', 'coach123', TRUE, 'password'),
('pcoach01', 'private-coach@gympappa.com', 'Private Coach', 'coach123', TRUE, 'password'),
('acad01', 'academic-staff', 'staff@eng.pdn.ac.lk', 'Academic Staff', 'acad123', TRUE, 'password');