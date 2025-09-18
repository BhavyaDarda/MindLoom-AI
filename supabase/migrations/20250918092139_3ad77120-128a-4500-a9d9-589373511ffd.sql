-- Fix security functions with proper search path
DROP FUNCTION IF EXISTS public.log_security_event(TEXT, TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS public.check_upload_limits(BIGINT);

-- Recreate security functions with proper search path
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata
  );
END;
$$;

-- Function to check and update upload limits with proper search path
CREATE OR REPLACE FUNCTION public.check_upload_limits(
  p_file_size BIGINT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_count INTEGER;
  v_current_size BIGINT;
  v_last_reset DATE;
  v_daily_limit_count INTEGER := 50; -- 50 files per day
  v_daily_limit_size BIGINT := 500 * 1024 * 1024; -- 500MB per day
BEGIN
  -- Ensure user is authenticated
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get or create user limits record
  INSERT INTO public.user_upload_limits (user_id) 
  VALUES (v_user_id) 
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current limits
  SELECT daily_upload_count, daily_upload_size, last_reset_date
  INTO v_current_count, v_current_size, v_last_reset
  FROM public.user_upload_limits
  WHERE user_id = v_user_id;
  
  -- Reset daily limits if needed
  IF v_last_reset < CURRENT_DATE THEN
    UPDATE public.user_upload_limits
    SET daily_upload_count = 0,
        daily_upload_size = 0,
        last_reset_date = CURRENT_DATE
    WHERE user_id = v_user_id;
    v_current_count := 0;
    v_current_size := 0;
  END IF;
  
  -- Check limits
  IF v_current_count >= v_daily_limit_count OR 
     (v_current_size + p_file_size) > v_daily_limit_size THEN
    RETURN false;
  END IF;
  
  -- Update limits
  UPDATE public.user_upload_limits
  SET daily_upload_count = daily_upload_count + 1,
      daily_upload_size = daily_upload_size + p_file_size,
      total_files_uploaded = total_files_uploaded + 1,
      updated_at = now()
  WHERE user_id = v_user_id;
  
  RETURN true;
END;
$$;