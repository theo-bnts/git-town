CREATE OR REPLACE FUNCTION insert_update_handler()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public."user"
    JOIN public."role" ON public."user".role_id = public."role".id
    WHERE public."user".id = NEW.user_id AND public."role".keyword = TG_ARGV[0]
  ) THEN
    RAISE EXCEPTION 'User % does not have the % role', NEW.user_id, TG_ARGV[0];
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_handler()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'repository' THEN
    IF OLD.archived_at IS NOT NULL AND (
      NEW.updated_at IS DISTINCT FROM OLD.updated_at OR
      NEW.archived_at IS DISTINCT FROM OLD.archived_at OR
      ROW(NEW.*) IS DISTINCT FROM ROW(OLD.*)
    ) THEN
      RAISE EXCEPTION 'Cannot modify a repository that is archived';
    END IF;
  END IF;

  NEW.updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER role_update
BEFORE UPDATE ON public."role"
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER user_update
BEFORE UPDATE ON public."user"
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER temporary_code_update
BEFORE UPDATE ON public.temporary_code
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER promotion_level_update
BEFORE UPDATE ON public.promotion_level
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER promotion_update
BEFORE UPDATE ON public.promotion
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER user_promotion_insert_update
BEFORE INSERT OR UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION insert_update_handler('student');

CREATE TRIGGER user_promotion_update
BEFORE UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER ue_update
BEFORE UPDATE ON public.ue
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER template_update
BEFORE UPDATE ON public."template"
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER repository_insert_update
BEFORE INSERT OR UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION insert_update_handler('teacher');

CREATE TRIGGER repository_update
BEFORE UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER user_repository_insert_update
BEFORE INSERT OR UPDATE ON public.user_repository
FOR EACH ROW
EXECUTE FUNCTION insert_update_handler('student');

CREATE TRIGGER user_repository_update
BEFORE UPDATE ON public.user_repository
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER milestone_update
BEFORE UPDATE ON public.milestone
FOR EACH ROW
EXECUTE FUNCTION update_handler();

CREATE TRIGGER template_milestone_update
BEFORE UPDATE ON public.template_milestone
FOR EACH ROW
EXECUTE FUNCTION update_handler();
