-- Grant permissions to anon role for anonymous incident reporting
-- This is required in addition to RLS policies

-- Allow anonymous users to INSERT incidents (critical for anonymous reporting)
GRANT INSERT ON incidents TO anon;

-- Allow anonymous users to SELECT plant_locations (for dropdown)
GRANT SELECT ON plant_locations TO anon;

-- Allow anonymous users to SELECT daily_report_counts (for rate limiting check)
GRANT SELECT ON daily_report_counts TO anon;

-- Note: The anon role already has these permissions set by default in Supabase,
-- but we're being explicit here to ensure anonymous reporting works correctly
