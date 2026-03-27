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


