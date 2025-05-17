CREATE OR REPLACE FUNCTION assert_user_email_domain_role()
RETURNS TRIGGER AS
$$
  DECLARE
      role_keyword TEXT;
  BEGIN
      SELECT keyword
      INTO role_keyword
      FROM public.role
      WHERE id = NEW.role_id;

      IF (
        (role_keyword = 'student' AND NEW.email_address NOT LIKE '%@etud.u-picardie.fr')
        OR (role_keyword != 'student' AND NEW.email_address NOT LIKE '%@u-picardie.fr')
      ) THEN
        RAISE EXCEPTION 'Email domain is not valid for user role';
      END IF;

      RETURN NEW;
  END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assert_user_role()
RETURNS TRIGGER AS
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.user u
    JOIN public.role     r ON u.role_id = r.id
    WHERE u.id = NEW.user_id
    AND r.keyword = ANY (TG_ARGV)
  ) THEN
    RAISE EXCEPTION
      'User % is not %',
      NEW.user_id,
      array_to_string(TG_ARGV, ' or ');
  END IF;

  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assert_non_archive()
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

CREATE OR REPLACE FUNCTION assert_template_promotion_same_year()
RETURNS TRIGGER AS
$$
DECLARE
  template_year SMALLINT;
  promotion_year SMALLINT;
BEGIN
  SELECT year INTO template_year FROM public.template WHERE id = NEW.template_id;
  SELECT year INTO promotion_year FROM public.promotion WHERE id = NEW.promotion_id;

  IF template_year != promotion_year THEN
    RAISE EXCEPTION 'Template and promotion must have the same year';
  END IF;

  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assert_strings_rules()
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



CREATE TRIGGER user_assert_email_role
BEFORE INSERT OR UPDATE ON public.user
FOR EACH ROW
EXECUTE FUNCTION assert_user_email_domain_role();




CREATE TRIGGER repository_assert_user_role
BEFORE INSERT OR UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION assert_user_role('teacher', 'administrator');

CREATE TRIGGER user_promotion_assert_user_role
BEFORE INSERT OR UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION assert_user_role('student');

CREATE TRIGGER user_repository_assert_user_role
BEFORE INSERT OR UPDATE ON public.user_repository
FOR EACH ROW
EXECUTE FUNCTION assert_user_role('student');



CREATE TRIGGER repository_assert_non_archive
BEFORE UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION assert_non_archive();



CREATE TRIGGER repository_assert_template_promotion_same_year
BEFORE INSERT OR UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION assert_template_promotion_same_year();



CREATE TRIGGER role_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.role
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER user_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.user
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER token_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.token
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER temporary_code_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.temporary_code
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER diploma_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.diploma
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER promotion_level_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.promotion_level
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER promotion_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.promotion
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER user_promotion_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.user_promotion
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER ue_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.enseignement_unit
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER template_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.template
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER repository_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.repository
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER user_repository_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.user_repository
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();

CREATE TRIGGER milestone_assert_strings_rules
BEFORE INSERT OR UPDATE ON public.milestone
FOR EACH ROW
EXECUTE FUNCTION assert_strings_rules();



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
