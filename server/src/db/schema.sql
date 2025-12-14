-- Fitz Hotel Concierge Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'concierge' CHECK (role IN ('concierge', 'manager', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  room_number VARCHAR(20),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  arrival_method VARCHAR(50) CHECK (arrival_method IN ('flight', 'train', 'car', 'bus', 'other')),
  flight_number VARCHAR(20),
  check_in_date TIMESTAMPTZ,
  check_out_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) DEFAULT 'guest_request' CHECK (type IN ('guest_request', 'internal_request', 'reminder', 'arrival_alert', 'transport_alert')),
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  guest_name VARCHAR(255),
  room_number VARCHAR(20),
  summary TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'pending', 'confirmed', 'closed', 'transferred')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_time TIMESTAMPTZ DEFAULT NOW(),
  assigned_to UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket notes table
CREATE TABLE IF NOT EXISTS ticket_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (email history)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  channel VARCHAR(20) DEFAULT 'email' CHECK (channel IN ('email')),
  subject VARCHAR(500),
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internal notes table (shift notes, concierge-only)
CREATE TABLE IF NOT EXISTS internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flight cache table
CREATE TABLE IF NOT EXISTS flight_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number VARCHAR(20) UNIQUE NOT NULL,
  airline VARCHAR(100),
  origin VARCHAR(100),
  arrival_time TIMESTAMPTZ,
  scheduled_arrival TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'landed', 'delayed', 'cancelled')),
  delay_minutes INTEGER DEFAULT 0,
  terminal VARCHAR(10),
  gate VARCHAR(10),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Transport cache table
CREATE TABLE IF NOT EXISTS transport_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_key VARCHAR(100) UNIQUE NOT NULL,
  transport_type VARCHAR(20) CHECK (transport_type IN ('road', 'rail', 'bus')),
  travel_time_mins INTEGER,
  traffic_status VARCHAR(20) CHECK (traffic_status IN ('light', 'moderate', 'heavy', 'unknown')),
  disruption_info TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_scheduled_time ON tickets(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_tickets_guest_id ON tickets(guest_id);
CREATE INDEX IF NOT EXISTS idx_guests_room_number ON guests(room_number);
CREATE INDEX IF NOT EXISTS idx_guests_flight_number ON guests(flight_number);
CREATE INDEX IF NOT EXISTS idx_messages_guest_id ON messages(guest_id);
CREATE INDEX IF NOT EXISTS idx_flight_cache_flight_number ON flight_cache(flight_number);

-- Insert a demo staff user (password: demo123)
-- In production, use proper password hashing
INSERT INTO staff (email, name, password_hash, role)
VALUES ('demo@thefitz.hotel', 'Demo Concierge', '$2a$10$rQnM1Nh6Oa1qjDQxPVqKzOoRMW3yxPHHp9jvYoG7oHf9dIxVjzrXG', 'concierge')
ON CONFLICT (email) DO NOTHING;

-- Insert some demo data
INSERT INTO guests (name, room_number, contact_email, arrival_method, flight_number, check_in_date)
VALUES 
  ('John Smith', '101', 'john.smith@email.com', 'flight', 'EI123', NOW() + INTERVAL '2 hours'),
  ('Mary Johnson', '205', 'mary.j@email.com', 'train', NULL, NOW() + INTERVAL '4 hours'),
  ('Robert Williams', '312', 'r.williams@email.com', 'flight', 'BA456', NOW() + INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

-- Insert demo tickets
INSERT INTO tickets (type, guest_name, room_number, summary, status, priority, scheduled_time)
VALUES
  ('guest_request', 'John Smith', '101', 'Airport pickup arrangement', 'open', 'high', NOW() + INTERVAL '1 hour'),
  ('reminder', 'Mary Johnson', '205', 'Wake up call requested for 7:00 AM', 'pending', 'normal', NOW() + INTERVAL '12 hours'),
  ('guest_request', 'Robert Williams', '312', 'Restaurant reservation at The Ivy - 8pm, 4 people', 'confirmed', 'normal', NOW() + INTERVAL '5 hours'),
  ('internal_request', NULL, NULL, 'Check lobby flowers arrangement', 'open', 'low', NOW() + INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- Insert demo internal note
INSERT INTO internal_notes (content, priority)
VALUES ('VIP guest arriving tomorrow - Suite 501 needs special preparation', 'high')
ON CONFLICT DO NOTHING;

