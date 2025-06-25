-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE sms_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sms_db')\gexec

-- Connect to the database
\c sms_db

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$
BEGIN
    -- User roles enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
    END IF;
    
    -- Grade level enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grade_level_enum') THEN
        CREATE TYPE grade_level_enum AS ENUM ('NURSERY', 'KINDERGARTEN', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12');
    END IF;
    
    -- Term enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'term_enum') THEN
        CREATE TYPE term_enum AS ENUM ('FIRST_TERM', 'SECOND_TERM', 'THIRD_TERM');
    END IF;
    
    -- Day of week enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'day_of_week_enum') THEN
        CREATE TYPE day_of_week_enum AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
    END IF;
END$$;

-- Create the schools table if it doesn't exist
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    profile_image_url TEXT,
    roles user_role_enum[] NOT NULL DEFAULT '{}',
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_username_per_school UNIQUE (username, school_id),
    CONSTRAINT uq_email_per_school UNIQUE (email, school_id)
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    grade_level grade_level_enum NOT NULL,
    section VARCHAR(10),
    academic_year VARCHAR(20) NOT NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    max_students INT DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_class_grade_section_year_school UNIQUE (grade_level, section, academic_year, school_id)
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    is_core BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_subject_code_school UNIQUE (code, school_id)
);

-- Create class_subjects junction table
CREATE TABLE IF NOT EXISTS class_subjects (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    academic_year VARCHAR(20) NOT NULL,
    term term_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (class_id, subject_id, academic_year, term)
);

-- Create students table (extends users)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    admission_number VARCHAR(50) NOT NULL,
    admission_date DATE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_admission_number_school UNIQUE (admission_number, school_id)
);

-- Create the teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    qualification TEXT,
    specialization VARCHAR(100),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_employee_id_school UNIQUE (employee_id, school_id),
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Add user_id column to students table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'students' AND column_name = 'user_id') THEN
        ALTER TABLE students ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Create class_schedule table
CREATE TABLE IF NOT EXISTS class_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    teacher_id UUID,
    user_id UUID,
    day_of_week day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    academic_year VARCHAR(20) NOT NULL,
    term term_enum NOT NULL,
    school_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_class_schedule_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_schedule_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_schedule_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    CONSTRAINT fk_class_schedule_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_class_schedule_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    CONSTRAINT chk_valid_time_slot CHECK (end_time > start_time),
    CONSTRAINT uq_class_schedule_slot UNIQUE (class_id, day_of_week, start_time, academic_year, term, school_id)
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at columns for all tables
DO $$
BEGIN
    -- For schools table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schools_updated_at') THEN
        CREATE TRIGGER update_schools_updated_at
        BEFORE UPDATE ON schools
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- For users table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- For classes table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_classes_updated_at') THEN
        CREATE TRIGGER update_classes_updated_at
        BEFORE UPDATE ON classes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- For subjects table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subjects_updated_at') THEN
        CREATE TRIGGER update_subjects_updated_at
        BEFORE UPDATE ON subjects
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- For class_subjects table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_class_subjects_updated_at') THEN
        CREATE TRIGGER update_class_subjects_updated_at
        BEFORE UPDATE ON class_subjects
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- For students table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
        CREATE TRIGGER update_students_updated_at
        BEFORE UPDATE ON students
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- For teachers table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_teachers_updated_at') THEN
        CREATE TRIGGER update_teachers_updated_at
        BEFORE UPDATE ON teachers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- For class_schedule table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_class_schedule_updated_at') THEN
        CREATE TRIGGER update_class_schedule_updated_at
        BEFORE UPDATE ON class_schedule
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class_id ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject_id ON class_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

-- Indexes for class_schedule
CREATE INDEX IF NOT EXISTS idx_class_schedule_class_id ON class_schedule(class_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_teacher_id ON class_schedule(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_subject_id ON class_schedule(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_school_id ON class_schedule(school_id);
CREATE INDEX IF NOT EXISTS idx_class_schedule_day_time ON class_schedule(day_of_week, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_class_schedule_academic_year ON class_schedule(academic_year, term);
