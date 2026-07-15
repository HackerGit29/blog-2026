-- Migration: Add 'superadmin' to app_role enum
-- Must run alone: ALTER TYPE ADD VALUE cannot coexist with other DML in same tx

alter type app_role add value if not exists 'superadmin';
