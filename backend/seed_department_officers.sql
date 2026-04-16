-- ============================================================
--  Seed Department Officer Users
--  Run this in the Supabase SQL Editor
-- ============================================================

-- First, add 'officer' to the userrole enum if not already present
ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'officer';

INSERT INTO users (id, full_name, email, mobile_number, hashed_password, city, role, is_email_verified, created_at)
VALUES
  (gen_random_uuid(), 'Water Supply Officer',         'waterdept@email.com',       '9000000001', 'water@1234',         'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'Roads & Infrastructure Officer','roadsdept@email.com',      '9000000002', 'roads@1234',         'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'Solid Waste Management Officer','swastemdept@email.com',    '9000000003', 'swaste@1234',        'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'Storm Water Drains Officer',    'stormwaterdept@email.com', '9000000004', 'stormwater@1234',    'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'Public Health Officer',          'pubhealthdept@email.com', '9000000005', 'pubhealth@1234',     'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'Mumbai Police Officer',          'policedept@email.com',    '9000000006', 'police@1234',        'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'MSEDCL Officer',                 'msedcldept@email.com',    '9000000007', 'msedcl@1234',        'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'Fire Brigade Officer',           'firebrigade@email.com',   '9000000008', 'firebrigade@1234',   'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'MMRDA Officer',                  'mmrdadept@email.com',     '9000000009', 'mmrda@1234',         'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'SRA Officer',                    'sradept@email.com',       '9000000010', 'sra@12345',          'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'MPCB Officer',                   'mpcbdept@email.com',      '9000000011', 'mpcb@1234',          'Mumbai', 'officer', 'true', now()),
  (gen_random_uuid(), 'General Administration Officer', 'generaladmin@email.com',  '9000000012', 'generaladmin@1234',  'Mumbai', 'officer', 'true', now())
ON CONFLICT (email) DO NOTHING;
