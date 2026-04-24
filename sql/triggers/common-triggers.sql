-- UPDATED_AT AUTOMATION
CREATE OR REPLACE FUNCTION public.handle_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
-- (In a fully modular system, these triggers might be in their respective module files, 
-- but keeping the generic function here is standard)
