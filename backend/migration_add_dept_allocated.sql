-- Migration: Add dept_allocated column to grievances table
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS dept_allocated TEXT;

-- Allocate departments based on category
UPDATE grievances SET dept_allocated = 'BMC - Water Supply Department' WHERE LOWER(category) IN ('water');
UPDATE grievances SET dept_allocated = 'BMC - Roads & Infrastructure (PWD)' WHERE LOWER(category) IN ('road', 'roads', 'infrastructure');
UPDATE grievances SET dept_allocated = 'BMC - Solid Waste Management' WHERE LOWER(category) IN ('sanitation', 'garbage');
UPDATE grievances SET dept_allocated = 'BMC - Storm Water Drains' WHERE LOWER(category) IN ('drainage');
UPDATE grievances SET dept_allocated = 'BMC - Public Health Department' WHERE LOWER(category) IN ('safety', 'noise');
UPDATE grievances SET dept_allocated = 'Mumbai Police' WHERE LOWER(category) IN ('illegal activity', 'traffic');
UPDATE grievances SET dept_allocated = 'Maharashtra State Electricity Distribution Company (MSEDCL)' WHERE LOWER(category) IN ('electricity', 'power');
UPDATE grievances SET dept_allocated = 'Mumbai Fire Brigade' WHERE LOWER(category) IN ('emergency');
UPDATE grievances SET dept_allocated = 'Maharashtra Pollution Control Board (MPCB)' WHERE LOWER(category) IN ('pollution');
UPDATE grievances SET dept_allocated = 'Mumbai Metropolitan Region Development Authority (MMRDA)' WHERE LOWER(category) IN ('environment');
UPDATE grievances SET dept_allocated = 'General Administration (BMC)' WHERE dept_allocated IS NULL;
