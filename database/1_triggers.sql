CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_repository_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.archived_at IS NOT NULL AND (
    NEW.updated_at IS DISTINCT FROM OLD.updated_at OR
    NEW.archived_at IS DISTINCT FROM OLD.archived_at OR
    ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*)
  ) THEN
    RAISE EXCEPTION 'Cannot modify a repository that is archived';
  END IF;

  NEW.updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_user
BEFORE UPDATE ON public."user"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_temporary_code
BEFORE UPDATE ON public.temporary_code
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_role
BEFORE UPDATE ON public."role"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_user_promotion
BEFORE UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_promotion
BEFORE UPDATE ON public.promotion
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_promotion_level
BEFORE UPDATE ON public.promotion_level
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_user_repository
BEFORE UPDATE ON public.user_repository
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER handle_repository_update
BEFORE UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION handle_repository_update();

CREATE TRIGGER set_updated_at_template
BEFORE UPDATE ON public."template"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_ue
BEFORE UPDATE ON public.ue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_template_milestone
BEFORE UPDATE ON public.template_milestone
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_milestone
BEFORE UPDATE ON public.milestone
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
