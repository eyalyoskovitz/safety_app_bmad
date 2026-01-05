-- Daily Report Limit Feature (Story 2.9)
-- Creates function to atomically check and increment daily report count
-- Auto-resets at midnight via date-based rows

-- Create table for tracking daily report counts
CREATE TABLE IF NOT EXISTS daily_report_counts (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to check and increment daily count atomically
-- Accepts limit as parameter, defaults to 15 if not provided
CREATE OR REPLACE FUNCTION check_and_increment_daily_count(p_daily_limit INTEGER DEFAULT 15)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get today's count (using SELECT FOR UPDATE to lock the row)
  SELECT count INTO current_count
  FROM daily_report_counts
  WHERE date = today_date
  FOR UPDATE;

  -- No row = first report today
  IF current_count IS NULL THEN
    INSERT INTO daily_report_counts (date, count, updated_at)
    VALUES (today_date, 1, NOW());
    RETURN TRUE;
  END IF;

  -- Check limit (use parameter value)
  IF current_count >= p_daily_limit THEN
    RAISE EXCEPTION 'DAILY_LIMIT_EXCEEDED';
  END IF;

  -- Increment count
  UPDATE daily_report_counts
  SET count = count + 1, updated_at = NOW()
  WHERE date = today_date;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon users (public reporting)
GRANT EXECUTE ON FUNCTION check_and_increment_daily_count(INTEGER) TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION check_and_increment_daily_count(INTEGER) IS 'Atomically checks if daily report limit is exceeded and increments count. Accepts p_daily_limit parameter (defaults to 15). Raises DAILY_LIMIT_EXCEEDED exception when limit reached. Auto-resets at midnight via date-based rows.';

-- Enable Row Level Security on daily_report_counts table
ALTER TABLE daily_report_counts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous users to SELECT (read) daily counts
CREATE POLICY "Allow anon to read daily counts"
ON daily_report_counts
FOR SELECT
TO anon
USING (true);

-- RLS Policy: Allow anonymous users to INSERT new daily count rows
CREATE POLICY "Allow anon to insert daily counts"
ON daily_report_counts
FOR INSERT
TO anon
WITH CHECK (true);

-- RLS Policy: Allow anonymous users to UPDATE daily count rows
CREATE POLICY "Allow anon to update daily counts"
ON daily_report_counts
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
