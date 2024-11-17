CREATE TABLE public."role" (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  name varchar(13) NOT NULL,
  CONSTRAINT role_pk PRIMARY KEY (id),
  CONSTRAINT role_unique_name UNIQUE (name)
);

CREATE TABLE public."user" (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  email varchar(250) NOT NULL,
  password varchar(250) NOT NULL,
  full_name varchar(250) NOT NULL,
  role_id uuid NOT NULL,
  CONSTRAINT user_pk PRIMARY KEY (id),
  CONSTRAINT user_fk_role FOREIGN KEY (role_id) REFERENCES public."role"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_unique_email UNIQUE (email)
);

CREATE TABLE public.temporary_code (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  "code" varchar(6) NOT NULL,
  CONSTRAINT temporary_code_pk PRIMARY KEY (id),
  CONSTRAINT temporary_code_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public.promotion_level (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  initialism varchar(10) NOT NULL,
  name varchar(250) NOT NULL,
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

CREATE TABLE public.user_promotion (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  CONSTRAINT user_promotion_pk PRIMARY KEY (id),
  CONSTRAINT user_promotion_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_promotion_fk_promotion FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public.ue (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  initialism varchar(10) NOT NULL,
  name varchar(250) NOT NULL,
  CONSTRAINT ue_pk PRIMARY KEY (id),
  CONSTRAINT ue_unique_initialism_name UNIQUE (initialism, name)
);

CREATE TABLE public."template" (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ue_id uuid NOT NULL,
  CONSTRAINT template_pk PRIMARY KEY (id),
  CONSTRAINT template_fk_ue FOREIGN KEY (ue_id) REFERENCES public.ue(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public.repository (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  template_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  teachers_comment text DEFAULT NULL,
  CONSTRAINT repository_pk PRIMARY KEY (id),
  CONSTRAINT repository_fk_template FOREIGN KEY (template_id) REFERENCES public."template"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT repository_fk_promotion FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public.user_repository (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  repository_id uuid NOT NULL,
  CONSTRAINT user_repository_pk PRIMARY KEY (id),
  CONSTRAINT user_repository_fk_user FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_repository_fk_repository FOREIGN KEY (repository_id) REFERENCES public.repository(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE public.milestone (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  title varchar(250) NOT NULL,
  "date" date NOT NULL,
  CONSTRAINT milestone_pk PRIMARY KEY (id)
);

CREATE TABLE public.template_milestone (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  template_id uuid NOT NULL,
  milestone_id uuid NOT NULL,
  CONSTRAINT template_milestone_pk PRIMARY KEY (id),
  CONSTRAINT template_milestone_fk_template FOREIGN KEY (template_id) REFERENCES public."template"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT template_milestone_fk_milestone FOREIGN KEY (milestone_id) REFERENCES public.milestone(id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
