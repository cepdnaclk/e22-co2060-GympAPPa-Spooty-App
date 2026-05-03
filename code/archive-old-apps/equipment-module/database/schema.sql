-- ============================================================
-- GympAPPa - Equipment Module Database Schema
-- Fixed version: uses CASCADE to handle dependent tables
-- ============================================================

-- Drop in correct order with CASCADE
DROP TABLE IF EXISTS issued_equipment CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- ============================================================
-- STUDENTS TABLE
-- ============================================================
CREATE TABLE students (
    student_id   SERIAL PRIMARY KEY,
    reg_number   VARCHAR(20) UNIQUE NOT NULL,
    full_name    VARCHAR(100) NOT NULL,
    faculty      VARCHAR(100),
    email        VARCHAR(100)
);

INSERT INTO students (reg_number, full_name, faculty, email) VALUES
('E22001', 'Kasun Perera',       'Engineering', 'e22001@eng.pdn.ac.lk'),
('E22002', 'Nimali Silva',       'Science',     'e22002@sci.pdn.ac.lk'),
('E22003', 'Ruwan Fernando',     'Engineering', 'e22003@eng.pdn.ac.lk'),
('E22004', 'Dilini Jayawardena', 'Arts',        'e22004@arts.pdn.ac.lk');

-- ============================================================
-- EQUIPMENT TABLE
-- ============================================================
CREATE TABLE equipment (
    equipment_id   SERIAL PRIMARY KEY,
    equipment_name VARCHAR(100) NOT NULL,
    total_quantity INTEGER NOT NULL,
    available_qty  INTEGER NOT NULL
);

INSERT INTO equipment (equipment_name, total_quantity, available_qty) VALUES
('Football',             10, 10),
('Basketball',            8,  8),
('Netball',               6,  6),
('Volleyball',            6,  6),
('Badminton Racket',     15, 15),
('Shuttlecock (tube)',   20, 20),
('Table Tennis Bat',     12, 12),
('Table Tennis Ball',    30, 30),
('Cricket Bat',           8,  8),
('Cricket Ball',         10, 10),
('Elle Bat',              6,  6),
('Hockey Stick',         10, 10),
('Hockey Ball',          10, 10),
('Rugby Ball',            5,  5),
('Tennis Racket',         8,  8),
('Tennis Ball',          20, 20),
('Baseball Bat',          4,  4),
('Baseball',             10, 10);

-- ============================================================
-- ISSUED EQUIPMENT TABLE
-- ============================================================
CREATE TABLE issued_equipment (
    issue_id      SERIAL PRIMARY KEY,
    student_id    INTEGER NOT NULL REFERENCES students(student_id),
    equipment_id  INTEGER NOT NULL REFERENCES equipment(equipment_id),
    quantity      INTEGER NOT NULL DEFAULT 1,
    issue_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_time   TIMESTAMP,
    status        VARCHAR(20) DEFAULT 'ISSUED',
    issued_by     VARCHAR(100)
);z