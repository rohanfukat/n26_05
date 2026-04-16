-- ============================================================
--  Migration: Add department column to users table
--  Run this in the Supabase SQL Editor
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(255);

-- Update existing officer users with their department mapping
UPDATE users SET department = 'BMC - Water Supply Department' WHERE email = 'waterdept@email.com';
UPDATE users SET department = 'BMC - Roads & Infrastructure (PWD)' WHERE email = 'roadsdept@email.com';
UPDATE users SET department = 'BMC - Solid Waste Management' WHERE email = 'swastemdept@email.com';
UPDATE users SET department = 'BMC - Storm Water Drains' WHERE email = 'stormwaterdept@email.com';
UPDATE users SET department = 'BMC - Public Health Department' WHERE email = 'pubhealthdept@email.com';
UPDATE users SET department = 'Mumbai Police' WHERE email = 'policedept@email.com';
UPDATE users SET department = 'Maharashtra State Electricity Distribution Company (MSEDCL)' WHERE email = 'msedcldept@email.com';
UPDATE users SET department = 'Mumbai Fire Brigade' WHERE email = 'firebrigade@email.com';
UPDATE users SET department = 'Mumbai Metropolitan Region Development Authority (MMRDA)' WHERE email = 'mmrdadept@email.com';
UPDATE users SET department = 'Slum Rehabilitation Authority (SRA)' WHERE email = 'sradept@email.com';
UPDATE users SET department = 'Maharashtra Pollution Control Board (MPCB)' WHERE email = 'mpcbdept@email.com';
UPDATE users SET department = 'General Administration (BMC)' WHERE email = 'generaladmin@email.com';
