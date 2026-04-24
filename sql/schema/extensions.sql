-- EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- We will call the markdown text as GFM
CREATE DOMAIN GFM AS TEXT;

-- Enums for strict data integrity
CREATE TYPE user_role AS ENUM ('tourist', 'guide', 'hotel_owner', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'reported');
CREATE TYPE booking_request_status AS ENUM ('pending', 'approved', 'rejected', 'confirmed', 'cancelled');
