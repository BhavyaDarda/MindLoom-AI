-- Critical Security Fixes Migration

-- Phase 1: Update RLS policies to remove anonymous access
-- Drop existing policies that allow anonymous access
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Users can create uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON public.file_uploads;

DROP POLICY IF EXISTS "Users can view their own transformations" ON public.transformations;
DROP POLICY IF EXISTS "Users can create transformations" ON public.transformations;
DROP POLICY IF EXISTS "Users can delete their own transformations" ON public.transformations;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create secure RLS policies that require authentication
CREATE POLICY "Authenticated users can view their own uploads" 
ON public.file_uploads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own uploads" 
ON public.file_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own uploads" 
ON public.file_uploads 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own transformations" 
ON public.transformations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own transformations" 
ON public.transformations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own transformations" 
ON public.transformations 
FOR DELETE 
USING (auth.uid() = user_id);

-- More restrictive profile access - users can only see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Phase 2: Add database constraints for security
-- Make user_id columns NOT NULL to prevent anonymous data
ALTER TABLE public.file_uploads 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.transformations 
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraints for referential integrity
ALTER TABLE public.file_uploads 
ADD CONSTRAINT fk_file_uploads_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transformations 
ADD CONSTRAINT fk_transformations_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add constraint to link transformations to file uploads
ALTER TABLE public.transformations 
ADD CONSTRAINT fk_transformations_file_upload_id 
FOREIGN KEY (file_upload_id) REFERENCES public.file_uploads(id) ON DELETE CASCADE;

-- Phase 3: Add audit logging table for security monitoring
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow reading audit logs for system administrators
CREATE POLICY "System access to audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (false); -- No direct access via API

-- Phase 4: Add file upload limits table
CREATE TABLE public.user_upload_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_upload_count INTEGER NOT NULL DEFAULT 0,
  daily_upload_size BIGINT NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_files_uploaded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on upload limits
ALTER TABLE public.user_upload_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own upload limits" 
ON public.user_upload_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own upload limits" 
ON public.user_upload_limits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage upload limits" 
ON public.user_upload_limits 
FOR INSERT 
WITH CHECK (true);

-- Add trigger to update upload limits timestamp
CREATE TRIGGER update_user_upload_limits_updated_at
BEFORE UPDATE ON public.user_upload_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 5: Create security functions
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to check and update upload limits
CREATE OR REPLACE FUNCTION public.check_upload_limits(
  p_file_size BIGINT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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