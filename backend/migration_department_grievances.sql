-- ============================================================
--  Migration: Create department_grievances table
--  Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS department_grievances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_issue    TEXT NOT NULL,
    category        VARCHAR(255),
    priority        VARCHAR(50) DEFAULT 'medium',
    status          VARCHAR(50) DEFAULT 'pending',
    dept_allocated  VARCHAR(255) NOT NULL,
    child_grievance_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dept_grievances_dept ON department_grievances(dept_allocated);
CREATE INDEX IF NOT EXISTS idx_dept_grievances_status ON department_grievances(status);
