CREATE OR REPLACE FUNCTION check_user_role()
RETURNS TRIGGER AS
$$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM public.user
      JOIN public.role ON public.user.role_id = public.role.id
      WHERE public.user.id = NEW.user_id AND public.role.keyword = TG_ARGV[0]
    )
    THEN
      RAISE EXCEPTION 'User % does not have the % role', NEW.user_id, TG_ARGV[0];
    END IF;

    RETURN NEW;
  END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_archive()
RETURNS TRIGGER AS
$$
  BEGIN
    IF OLD.archived_at IS NOT NULL AND NEW.archived_at IS NOT NULL THEN
      RAISE EXCEPTION 'Cannot modify an entity that is archived';
    END IF;

    RETURN NEW;
  END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION text_normalization_and_check()
RETURNS TRIGGER AS
$$
  DECLARE
    record_ RECORD;
    column_value TEXT;
  BEGIN
    FOR record_ IN
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = TG_TABLE_SCHEMA
      AND table_name   = TG_TABLE_NAME
      AND data_type IN ('character varying', 'text', 'character')
    LOOP
      EXECUTE format('SELECT ($1).%I', record_.column_name) INTO column_value USING NEW;
      
      IF column_value IS NOT NULL THEN        
        IF column_value = '' THEN
          RAISE EXCEPTION '% column cannot be empty', record_.column_name;
        END IF;
        
        IF (column_value ~ '^\s') OR (column_value ~ '\s$') OR (column_value ~ '\s{2,}') THEN
          RAISE EXCEPTION '% column has forbidden spacing (leading, trailing or multiple consecutive spaces)', record_.column_name;
        END IF;

        IF NOT (column_value ~ '^[[:alnum:][:punct:][:space:]]+$') THEN
          RAISE EXCEPTION '% column contains invalid characters', record_.column_name;
        END IF;
      END IF;
    END LOOP;

    RETURN NEW;
  END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS
$$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
  END;
$$
LANGUAGE plpgsql;



CREATE TRIGGER user_promotion_check_user_role
BEFORE INSERT OR UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION check_user_role('student');



CREATE TRIGGER repository_check_archive
BEFORE UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION check_archive();



CREATE TRIGGER role_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.role
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER user_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.user
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER token_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.token
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER temporary_code_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.temporary_code
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER diploma_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.diploma
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER promotion_level_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.promotion_level
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER promotion_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.promotion
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER user_promotion_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER ue_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.enseignement_unit
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER template_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.template
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER repository_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER user_repository_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.user_repository
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();

CREATE TRIGGER milestone_text_normalization_and_check
BEFORE INSERT OR UPDATE ON public.milestone
FOR EACH ROW
EXECUTE FUNCTION text_normalization_and_check();



CREATE TRIGGER role_update_updated_at
BEFORE UPDATE ON public.role
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_update_updated_at
BEFORE UPDATE ON public.user
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER token_update_updated_at
BEFORE UPDATE ON public.token
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER temporary_code_update_updated_at
BEFORE UPDATE ON public.temporary_code
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER diploma_update_updated_at
BEFORE UPDATE ON public.diploma
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER promotion_level_update_updated_at
BEFORE UPDATE ON public.promotion_level
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER promotion_update_updated_at
BEFORE UPDATE ON public.promotion
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_promotion_update_updated_at
BEFORE UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ue_update_updated_at
BEFORE UPDATE ON public.enseignement_unit
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER template_update_updated_at
BEFORE UPDATE ON public.template
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER repository_update_updated_at
BEFORE UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_repository_update_updated_at
BEFORE UPDATE ON public.user_repository
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestone_update_updated_at
BEFORE UPDATE ON public.milestone
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
