-- Add assigned_by field to track who assigned the incident
ALTER TABLE incidents
ADD COLUMN assigned_by uuid REFERENCES users(id);

-- Add comment for clarity
COMMENT ON COLUMN incidents.assigned_by IS 'User who assigned this incident to someone (typically Safety Officer)';

-- Update existing assigned incidents to set assigned_by from auth.uid() at assignment time
-- For existing data, we can't know who assigned it, so leave as NULL
