-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE sms_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sms_db')\gexec

-- Connect to the database
\c sms_db

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for user roles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
    END IF;
END$$;

-- Create the schools table if it doesn't exist
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    address TEXT,
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
    roles user_role_enum[] NOT NULL DEFAULT '{}',
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_username_per_school UNIQUE (username, school_id),
    CONSTRAINT uq_email_per_school UNIQUE (email, school_id)
);

-- Create index for school_id for better query performance
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at columns
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
END$$;
