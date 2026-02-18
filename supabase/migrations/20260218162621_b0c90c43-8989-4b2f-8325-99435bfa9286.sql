-- Add length constraints to text columns for input validation

-- facilities
ALTER TABLE public.facilities
  ADD CONSTRAINT facilities_name_length CHECK (length(name) > 0 AND length(name) <= 200),
  ADD CONSTRAINT facilities_location_length CHECK (length(location) > 0 AND length(location) <= 200);

-- facility_components
ALTER TABLE public.facility_components
  ADD CONSTRAINT fc_name_length CHECK (length(name) > 0 AND length(name) <= 200);

-- faults
ALTER TABLE public.faults
  ADD CONSTRAINT faults_description_length CHECK (length(description) > 0 AND length(description) <= 2000),
  ADD CONSTRAINT faults_custom_type_length CHECK (custom_fault_type IS NULL OR length(custom_fault_type) <= 200);

-- reports
ALTER TABLE public.reports
  ADD CONSTRAINT reports_note_length CHECK (length(note) > 0 AND length(note) <= 5000),
  ADD CONSTRAINT reports_reported_by_length CHECK (reported_by IS NULL OR length(reported_by) <= 200);

-- workers
ALTER TABLE public.workers
  ADD CONSTRAINT workers_name_length CHECK (length(name) > 0 AND length(name) <= 200),
  ADD CONSTRAINT workers_custom_role_length CHECK (custom_role IS NULL OR length(custom_role) <= 100);

-- app_users
ALTER TABLE public.app_users
  ADD CONSTRAINT app_users_username_length CHECK (length(username) > 0 AND length(username) <= 100),
  ADD CONSTRAINT app_users_email_length CHECK (email IS NULL OR length(email) <= 255);

-- activity_logs
ALTER TABLE public.activity_logs
  ADD CONSTRAINT al_description_length CHECK (length(event_description) > 0 AND length(event_description) <= 2000),
  ADD CONSTRAINT al_entity_type_length CHECK (length(entity_type) > 0 AND length(entity_type) <= 100),
  ADD CONSTRAINT al_event_type_length CHECK (length(event_type) > 0 AND length(event_type) <= 100);
