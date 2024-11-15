CREATE TABLE public.milestone (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  title varchar(250) NOT NULL,
  "date" date NOT NULL,
  CONSTRAINT milestone_pk PRIMARY KEY (id)
);

CREATE TABLE public.promotion_level (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  initialism varchar(10) NOT NULL,
  value varchar(250) NOT NULL,
  CONSTRAINT promotion_level_pk PRIMARY KEY (id)
);

CREATE TABLE public.promotion (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "year" int2 DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int2 NOT NULL,
  promotion_level_id uuid NOT NULL,
  CONSTRAINT promotion_check_year CHECK (((year >= 2000) AND (year <= 2099))),
  CONSTRAINT promotion_pk PRIMARY KEY (id),
  CONSTRAINT promotion_fk_promotion_level FOREIGN KEY (promotion_level_id) REFERENCES public.promotion_level(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public."role" (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  value varchar(13) NOT NULL,
  CONSTRAINT role_pk PRIMARY KEY (id),
  CONSTRAINT role_unique_value UNIQUE (value)
);

CREATE TABLE public.subject (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  initialism varchar(10) NOT NULL,
  value varchar(250) NOT NULL,
  CONSTRAINT subject_pk PRIMARY KEY (id),
  CONSTRAINT subject_unique_initialism_value UNIQUE (initialism, value)
);

CREATE TABLE public."template" (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  subject_id uuid NOT NULL,
  CONSTRAINT template_pk PRIMARY KEY (id),
  CONSTRAINT template_fk_subject FOREIGN KEY (subject_id) REFERENCES public.subject(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public.repository (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  template_id uuid NOT NULL,
  CONSTRAINT repository_pk PRIMARY KEY (id),
  CONSTRAINT repository_fk_template FOREIGN KEY (template_id) REFERENCES public."template"(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public.template_milestone (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  template_id uuid NOT NULL,
  milestone_id uuid NOT NULL,
  CONSTRAINT template_milestone_pk PRIMARY KEY (id),
  CONSTRAINT template_milestone_fk_template FOREIGN KEY (template_id) REFERENCES public."template"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT template_milestone_fk_milestone FOREIGN KEY (milestone_id) REFERENCES public.milestone(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT template_milestone_unique_template_milestone UNIQUE (template_id, milestone_id)
);

CREATE TABLE public."user" (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  email varchar(254) NOT NULL,
  password_salt bpchar(32) NOT NULL,
  password_hash bpchar(128) NOT NULL,
  github_id bpchar(8) DEFAULT NULL,
  CONSTRAINT user_unique_email UNIQUE (email),
  CONSTRAINT user_pk PRIMARY KEY (id),
  CONSTRAINT user_unique_github_id UNIQUE (github_id)
);

CREATE TABLE public.user_promotion (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  CONSTRAINT user_promotion_pk PRIMARY KEY (id),
  CONSTRAINT user_promotion_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_promotion_fk_promotion FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_promotion_unique_user_promotion UNIQUE (user_id, promotion_id)
);

CREATE TABLE public.user_repository (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  repository_id uuid NOT NULL,
  CONSTRAINT user_repository_pk PRIMARY KEY (id),
  CONSTRAINT user_repository_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_repository_fk_repository FOREIGN KEY (repository_id) REFERENCES public.repository(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_repository_unique_user_repository UNIQUE (user_id, repository_id)
);

CREATE TABLE public.user_role (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  CONSTRAINT user_role_pk PRIMARY KEY (id),
  CONSTRAINT user_role_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_role_fk_role FOREIGN KEY (role_id) REFERENCES public."role"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_role_unique_user_role UNIQUE (user_id, role_id)
);

CREATE TABLE public.temporary_code (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  temporary_code int CHECK (temporary_code BETWEEN 100000 AND 999999) NOT NULL,
  expiration_date timestamp NOT NULL,
  CONSTRAINT temporary_code_pk PRIMARY KEY (id),
  CONSTRAINT temporary_code_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE
);
