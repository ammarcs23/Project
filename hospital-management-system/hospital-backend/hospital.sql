-- ============================================
--   HOSPITAL MANAGEMENT SYSTEM - DATABASE
-- ============================================

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;


-- ── 1. USERS (common login table) ──────────────
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255)        NOT NULL,  -- bcrypt hashed
    role        ENUM('admin','doctor','patient') NOT NULL DEFAULT 'patient',
    is_active   BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── 2. DOCTORS ─────────────────────────────────
CREATE TABLE doctors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL UNIQUE,
    doctor_id   VARCHAR(10)  NOT NULL UNIQUE,  -- e.g. D001 (admin generates)
    specialty   VARCHAR(100) NOT NULL,
    experience  VARCHAR(20),
    fee         DECIMAL(10,2),
    phone       VARCHAR(20),
    avatar      TEXT,
    status      ENUM('Active','On Leave','Inactive') DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 3. PATIENTS ────────────────────────────────
CREATE TABLE patients (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT         NOT NULL UNIQUE,
    age         INT,
    gender      ENUM('Male','Female','Other'),
    blood_type  VARCHAR(5),
    phone       VARCHAR(20),
    address     TEXT,
    condition_   VARCHAR(255),
    avatar      TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 4. APPOINTMENTS ────────────────────────────
CREATE TABLE appointments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT  NOT NULL,
    doctor_id     INT  NOT NULL,
    date          DATE NOT NULL,
    time_slot     VARCHAR(20) NOT NULL,
    visit_type    ENUM('in-person','online') DEFAULT 'in-person',
    status        ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    problem       TEXT,
    notes         TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
);

-- ── 5. DOCTOR SCHEDULES ────────────────────────
CREATE TABLE doctor_schedules (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id   INT         NOT NULL,
    day         VARCHAR(10) NOT NULL,  -- Monday, Tuesday...
    start_time  VARCHAR(10) NOT NULL,
    end_time    VARCHAR(10) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- ── DEFAULT ADMIN ──────────────────────────────
-- Password: admin123 (bcrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('Super Admin', 'admin@hospital.com',
 'ammar007',   -- replace with real hash after setup
 'admin');


-- ── SAMPLE DOCTORS ─────────────────────────────
INSERT INTO users (name, email, password, role) VALUES
('Dr. Sarah Johnson', 'sarah@hospital.com', '$2b$10$YourHashHere', 'doctor'),
('Dr. Michael Chen',  'michael@hospital.com','$2b$10$YourHashHere', 'doctor');

INSERT INTO doctors (user_id, doctor_id, specialty, experience, fee, phone) VALUES
(2, 'D001', 'Cardiologist',  '8 yrs', 120.00, '+1-555-0101'),
(3, 'D002', 'Neurologist',   '12 yrs', 150.00, '+1-555-0102');

UPDATE users 
SET password='$2a$10$kOto4Sm95oMuxfhbx.G2AORehePpWaOtAWyMbfPojboaOnRvMgbpu' 
WHERE email='admin@hospital.com';






-- Homepage content table
CREATE TABLE IF NOT EXISTS homepage_content (
    id      INT PRIMARY KEY DEFAULT 1,
    content LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctor specialties table (Admin se categories manage ho)
CREATE TABLE IF NOT EXISTS specialties (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(50),
    color       VARCHAR(20),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default specialties insert
INSERT IGNORE INTO specialties (name, description, icon, color) VALUES
('Cardiology',    'Heart and cardiovascular system',   'FaHeartbeat', '#3b82f6'),
('Neurology',     'Brain and nervous system',          'FaBrain',     '#8b5cf6'),
('Orthopedics',   'Bones, joints and muscles',        'FaBone',      '#10b981'),
('Pediatrics',    'Children healthcare',               'FaBaby',      '#f59e0b'),
('Ophthalmology', 'Eye care and vision',               'FaEye',       '#ef4444'),
('Pulmonology',   'Lungs and respiratory system',     'FaLungs',     '#06b6d4'),
('Dermatology',   'Skin, hair and nails',              'FaUserMd',    '#ec4899'),
('General',       'General medicine and checkups',    'FaStethoscope','#64748b');



use hospital_db;

-- Doctor Queries --






USE hospital_db;
 
-- ── 1. USERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255)        NOT NULL,
    role        ENUM('admin','doctor','patient') NOT NULL DEFAULT 'patient',
    is_active   BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
 
-- ── 2. DOCTORS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL UNIQUE,
    doctor_id   VARCHAR(10)  NOT NULL UNIQUE,
    specialty   VARCHAR(100) NOT NULL,
    experience  VARCHAR(20),
    fee         DECIMAL(10,2),
    phone       VARCHAR(20),
    avatar      TEXT,
    status      ENUM('Active','On Leave','Inactive') DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- ── 3. PATIENTS ────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT         NOT NULL UNIQUE,
    age         INT,
    gender      ENUM('Male','Female','Other'),
    blood_type  VARCHAR(5),
    phone       VARCHAR(20),
    address     TEXT,
    condition_  VARCHAR(255),
    avatar      TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
 
-- ── 4. APPOINTMENTS ────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT  NOT NULL,
    doctor_id     INT  NOT NULL,
    date          DATE NOT NULL,
    time_slot     VARCHAR(20) NOT NULL,
    visit_type    ENUM('in-person','online') DEFAULT 'in-person',
    status        ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    problem       TEXT,
    notes         TEXT,
    ai_analysis   TEXT        DEFAULT NULL,
    ai_risk       VARCHAR(20) DEFAULT NULL,
    cancel_reason TEXT        DEFAULT NULL,
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
);
 
-- ── 5. DOCTOR SCHEDULES ────────────────────────
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id     INT        NOT NULL,
    day           VARCHAR(10) NOT NULL,
    start_time    VARCHAR(8)  NOT NULL,
    end_time      VARCHAR(8)  NOT NULL,
    break_start   VARCHAR(8)  DEFAULT NULL,
    break_end     VARCHAR(8)  DEFAULT NULL,
    slot_duration INT         NOT NULL DEFAULT 30,
    is_available  BOOLEAN     DEFAULT TRUE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_day (doctor_id, day)
);
 
-- ── 6. HOMEPAGE CONTENT ────────────────────────
CREATE TABLE IF NOT EXISTS homepage_content (
    id         INT PRIMARY KEY DEFAULT 1,
    content    LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
 
-- ── 7. APPOINTMENT SLOTS (optional tracking) ───
CREATE TABLE IF NOT EXISTS appointment_slots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id   INT      NOT NULL,
    slot_date   DATE     NOT NULL,
    slot_time   VARCHAR(8) NOT NULL,
    is_booked   BOOLEAN  DEFAULT FALSE,
    appt_id     INT      DEFAULT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (doctor_id, slot_date, slot_time)
);
 
ALTER TABLE appointment_slots
ADD CONSTRAINT fk_slot_appt
FOREIGN KEY (appt_id) REFERENCES appointments(id) ON DELETE SET NULL;
 
-- ═══════════════════════════════════════════════
-- STEP 1: Run generateHash.js to get bcrypt hash
--   cd hospital-backend
--   node generateHash.js
--
-- STEP 2: Copy the hash and run this INSERT:
-- ═══════════════════════════════════════════════
 
-- INSERT INTO users (name, email, password, role) VALUES
-- ('Super Admin', 'admin@hospital.com', 'PASTE_HASH_HERE', 'admin');
 
-- ─── NOTE ──────────────────────────────────────
-- Doctors are added ONLY via Admin Dashboard.
-- Admin logs in → Doctors → Add Doctor.
-- System auto-generates Doctor ID (D001, D002...).
-- Doctor uses email + password + Doctor ID to login.







-- ============================================================
--   APPOINTMENTS TABLE FIX
--   MySQL Workbench mein run karo — step by step
-- ============================================================

USE hospital_db;

-- STEP 1: Pehle dekho actual columns kya hain
SHOW COLUMNS FROM appointments;

-- ============================================================
-- STEP 2: Agar column names different hain to yeh run karo
-- (sirf wo ALTER chalao jo zaroori ho)
-- ============================================================

-- Agar column ka naam 'appointment_date' hai to rename karo:
-- ALTER TABLE appointments RENAME COLUMN appointment_date TO date;

-- Agar column ka naam 'appointment_time' hai to rename karo:
-- ALTER TABLE appointments RENAME COLUMN appointment_time TO time_slot;

-- Agar column 'slot_time' hai to:
-- ALTER TABLE appointments RENAME COLUMN slot_time TO time_slot;

-- ============================================================
-- FASTEST FIX: Agar appointments table bilkul galat hai
-- to drop karke dobara banao (data jayega lekin test data hi hoga)
-- ============================================================

-- Option A: Drop and recreate (safest if no real data yet)
DROP TABLE IF EXISTS appointment_slots;
DROP TABLE IF EXISTS appointments;

CREATE TABLE appointments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT  NOT NULL,
    doctor_id     INT  NOT NULL,
    date          DATE NOT NULL,
    time_slot     VARCHAR(20) NOT NULL,
    visit_type    ENUM('in-person','online') DEFAULT 'in-person',
    status        ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    problem       TEXT,
    notes         TEXT,
    ai_analysis   TEXT        DEFAULT NULL,
    ai_risk       VARCHAR(20) DEFAULT NULL,
    cancel_reason TEXT        DEFAULT NULL,
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
);

CREATE TABLE appointment_slots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id   INT      NOT NULL,
    slot_date   DATE     NOT NULL,
    slot_time   VARCHAR(8) NOT NULL,
    is_booked   BOOLEAN  DEFAULT FALSE,
    appt_id     INT      DEFAULT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (doctor_id, slot_date, slot_time)
);

ALTER TABLE appointment_slots 
ADD CONSTRAINT fk_slot_appt 
FOREIGN KEY (appt_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- Verify
SHOW COLUMNS FROM appointments;












-- ============================================================
--   APPOINTMENTS TABLE FINAL FIX
--   MySQL Workbench mein run karo — ek ek block alag se
-- ============================================================

USE hospital_db;

-- ── BLOCK 1: Pehle dekho current table structure ──────────
SHOW COLUMNS FROM appointments;

-- ── BLOCK 2: Drop both tables (order matters - slots first)
DROP TABLE IF EXISTS appointment_slots;
DROP TABLE IF EXISTS appointments;

-- ── BLOCK 3: Recreate appointments with CORRECT columns ───
CREATE TABLE appointments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT  NOT NULL,
    doctor_id     INT  NOT NULL,
    date          DATE NOT NULL,
    time_slot     VARCHAR(20) NOT NULL,
    visit_type    ENUM('in-person','online') DEFAULT 'in-person',
    status        ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    problem       TEXT,
    notes         TEXT,
    ai_analysis   TEXT        DEFAULT NULL,
    ai_risk       VARCHAR(20) DEFAULT NULL,
    cancel_reason TEXT        DEFAULT NULL,
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
);

-- ── BLOCK 4: Recreate appointment_slots ───────────────────
CREATE TABLE appointment_slots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id   INT        NOT NULL,
    slot_date   DATE       NOT NULL,
    slot_time   VARCHAR(8) NOT NULL,
    is_booked   BOOLEAN    DEFAULT FALSE,
    appt_id     INT        DEFAULT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (doctor_id, slot_date, slot_time)
);

ALTER TABLE appointment_slots
ADD CONSTRAINT fk_slot_appt
FOREIGN KEY (appt_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- ── BLOCK 5: Verify ───────────────────────────────────────
SHOW COLUMNS FROM appointments;
SELECT 'appointments table ready!' as status;






-- ============================================================
--   APPOINTMENTS TABLE FINAL FIX
--   MySQL Workbench mein run karo — ek ek block alag se
-- ============================================================

USE hospital_db;

-- ── BLOCK 1: Pehle dekho current table structure ──────────
SHOW COLUMNS FROM appointments;

-- ── BLOCK 2: Drop both tables (order matters - slots first)
DROP TABLE IF EXISTS appointment_slots;
DROP TABLE IF EXISTS appointments;

-- ── BLOCK 3: Recreate appointments with CORRECT columns ───
CREATE TABLE appointments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    patient_id    INT  NOT NULL,
    doctor_id     INT  NOT NULL,
    date          DATE NOT NULL,
    time_slot     VARCHAR(20) NOT NULL,
    visit_type    ENUM('in-person','online') DEFAULT 'in-person',
    status        ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
    problem       TEXT,
    notes         TEXT,
    ai_analysis   TEXT        DEFAULT NULL,
    ai_risk       VARCHAR(20) DEFAULT NULL,
    cancel_reason TEXT        DEFAULT NULL,
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE
);

-- ── BLOCK 4: Recreate appointment_slots ───────────────────
CREATE TABLE appointment_slots (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id   INT        NOT NULL,
    slot_date   DATE       NOT NULL,
    slot_time   VARCHAR(8) NOT NULL,
    is_booked   BOOLEAN    DEFAULT FALSE,
    appt_id     INT        DEFAULT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (doctor_id, slot_date, slot_time)
);

ALTER TABLE appointment_slots
ADD CONSTRAINT fk_slot_appt
FOREIGN KEY (appt_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- ── BLOCK 5: Verify ───────────────────────────────────────
SHOW COLUMNS FROM appointments;
SELECT 'appointments table ready!' as status;





-- Run this in MySQL Workbench
USE hospital_db;

CREATE TABLE IF NOT EXISTS chat_messages (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT          NOT NULL,
    sender_role    ENUM('doctor','patient') NOT NULL,
    sender_name    VARCHAR(100) NOT NULL,
    message        TEXT         NOT NULL,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appt_chat (appointment_id, created_at)
);

SELECT 'chat_messages table created!' as status;