-- v17_fal_rate_limits.sql

-- 1. Table for tracking generation usage per user/ip for different time windows
CREATE TABLE IF NOT EXISTS fal_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key TEXT NOT NULL, -- e.g., 'user:UUID' or 'ip:HASH'
  period_type TEXT NOT NULL, -- 'hourly' or 'daily'
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_key, period_type)
);

-- 2. Table for logging abuse / rate limit hits
CREATE TABLE IF NOT EXISTS fal_abuse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key TEXT NOT NULL,
  plan TEXT NOT NULL,
  period_type TEXT NOT NULL, -- 'hourly' or 'daily'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Atomic RPC to check limits and increment counters
CREATE OR REPLACE FUNCTION check_fal_generation_limit(
  p_user_key    TEXT,
  p_plan        TEXT,
  p_hourly_limit INTEGER,
  p_daily_limit  INTEGER
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_hourly_start TIMESTAMPTZ := date_trunc('hour', NOW());
  v_daily_start TIMESTAMPTZ := date_trunc('day', NOW());
  
  v_hourly_count INTEGER := 0;
  v_daily_count INTEGER := 0;
BEGIN
  -- A. Clean up old windows for this user to keep table small
  DELETE FROM fal_api_usage 
  WHERE user_key = p_user_key 
    AND ((period_type = 'hourly' AND window_start < v_hourly_start) OR
         (period_type = 'daily' AND window_start < v_daily_start));

  -- B. Read current counts (if they exist for the current window)
  SELECT request_count INTO v_hourly_count FROM fal_api_usage 
  WHERE user_key = p_user_key AND period_type = 'hourly' AND window_start = v_hourly_start;
  
  SELECT request_count INTO v_daily_count FROM fal_api_usage 
  WHERE user_key = p_user_key AND period_type = 'daily' AND window_start = v_daily_start;

  v_hourly_count := COALESCE(v_hourly_count, 0);
  v_daily_count := COALESCE(v_daily_count, 0);

  -- C. Check Limits FIRST
  IF v_hourly_count >= p_hourly_limit THEN
    -- Log Abuse
    INSERT INTO fal_abuse_logs (user_key, plan, period_type) VALUES (p_user_key, p_plan, 'hourly');
    RETURN json_build_object('allowed', false, 'reason', 'hourly_limit');
  END IF;

  IF v_daily_count >= p_daily_limit THEN
    -- Log Abuse
    INSERT INTO fal_abuse_logs (user_key, plan, period_type) VALUES (p_user_key, p_plan, 'daily');
    RETURN json_build_object('allowed', false, 'reason', 'daily_limit');
  END IF;

  -- D. If we reach here, it's allowed. Increment both counts.
  INSERT INTO fal_api_usage (user_key, period_type, window_start, request_count)
  VALUES (p_user_key, 'hourly', v_hourly_start, 1)
  ON CONFLICT (user_key, period_type)
  DO UPDATE SET request_count = fal_api_usage.request_count + 1;

  INSERT INTO fal_api_usage (user_key, period_type, window_start, request_count)
  VALUES (p_user_key, 'daily', v_daily_start, 1)
  ON CONFLICT (user_key, period_type)
  DO UPDATE SET request_count = fal_api_usage.request_count + 1;

  RETURN json_build_object(
    'allowed', true, 
    'hourly_remaining', p_hourly_limit - (v_hourly_count + 1),
    'daily_remaining', p_daily_limit - (v_daily_count + 1)
  );
END;
$$;

-- 4. Restrict execution to service_role ONLY (called by proxy backend)
REVOKE ALL ON FUNCTION check_fal_generation_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION check_fal_generation_limit(TEXT, TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION check_fal_generation_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
