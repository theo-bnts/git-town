CREATE TABLE public.role (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  keyword varchar(20) NOT NULL,
  name varchar(250) NOT NULL,
  hierarchy_level int2 DEFAULT 1 NOT NULL,
  CONSTRAINT role_pk PRIMARY KEY (id),
  CONSTRAINT role_unique_keyword UNIQUE (keyword),
  CONSTRAINT role_check_keyword CHECK (keyword ~ '^[a-z]+$'),
  CONSTRAINT role_unique_name UNIQUE (name),
  CONSTRAINT role_check_name CHECK (trim(name) <> ''),
  CONSTRAINT role_check_hierarchy_level CHECK (hierarchy_level >= 1)
);

CREATE TABLE public.user (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  email_address varchar(250) NOT NULL,
  password_hash_salt char(128) DEFAULT NULL,
  password_hash char(128) DEFAULT NULL,
  full_name varchar(250) NOT NULL,
  role_id uuid NOT NULL,
  github_id int8 DEFAULT NULL,
  github_organization_member boolean DEFAULT false NOT NULL,
  CONSTRAINT user_pk PRIMARY KEY (id),
  CONSTRAINT user_unique_email_address UNIQUE (email_address),
  CONSTRAINT user_check_email_address CHECK (email_address ~ '^[a-zA-Z0-9\._%+-]+@(?:etud\.)?u-picardie.fr$'),
  CONSTRAINT user_unique_password_hash_salt UNIQUE (password_hash_salt),
  CONSTRAINT user_check_password_hash_salt CHECK (password_hash_salt ~ '^[a-f0-9]*$'),
  CONSTRAINT user_unique_password_hash UNIQUE (password_hash),
  CONSTRAINT user_check_password_hash CHECK (password_hash ~ '^[a-f0-9]*$'),
  CONSTRAINT user_password_hash_salt_and_password_hash_dependent CHECK (
    (password_hash_salt IS NULL AND password_hash IS NULL)
    OR
    (password_hash_salt IS NOT NULL AND password_hash IS NOT NULL)
  ),
  CONSTRAINT user_check_full_name CHECK (trim(full_name) <> ''),
  CONSTRAINT user_fk_role FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_unique_github_id UNIQUE (github_id),
  CONSTRAINT user_check_github_id CHECK (github_id IS NULL OR github_id >= 1),
  CONSTRAINT user_check_github_id_and_github_organization_member_dependent CHECK (
    (github_id IS NULL AND github_organization_member = false)
    OR
    (github_id IS NOT NULL)
  )
);

CREATE TABLE public.temporary_code (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  value char(6) NOT NULL,
  CONSTRAINT temporary_code_pk PRIMARY KEY (id),
  CONSTRAINT temporary_code_fk_user FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT temporary_code_check_value CHECK (value ~ '^[0-9]*$')
);

CREATE TABLE public.token (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  value char(128) NOT NULL,
  CONSTRAINT token_pk PRIMARY KEY (id),
  CONSTRAINT token_fk_user FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT token_unique_value UNIQUE (value),
  CONSTRAINT token_check_value CHECK (value ~ '^[a-f0-9]*$')
);

CREATE TABLE public.diploma (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  initialism varchar(10) NOT NULL,
  name varchar(250) NOT NULL,
  CONSTRAINT diploma_pk PRIMARY KEY (id),
  CONSTRAINT diploma_unique_initialism UNIQUE (initialism),
  CONSTRAINT diploma_check_initialism CHECK (initialism ~ '^[A-Z0-9_]+$'),
  CONSTRAINT diploma_unique_name UNIQUE (name),
  CONSTRAINT diploma_check_name CHECK (trim(name) <> '')
);

CREATE TABLE public.promotion_level (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  initialism varchar(10) NOT NULL,
  name varchar(250) NOT NULL,
  CONSTRAINT promotion_level_pk PRIMARY KEY (id),
  CONSTRAINT promotion_level_unique_initialism UNIQUE (initialism),
  CONSTRAINT promotion_level_check_initialism CHECK (initialism ~ '^[A-Z0-9_]+$'),
  CONSTRAINT promotion_level_unique_name UNIQUE (name),
  CONSTRAINT promotion_level_check_name CHECK (trim(name) <> '')
);

CREATE TABLE public.promotion (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  diploma_id uuid NOT NULL,
  promotion_level_id uuid NOT NULL,
  year int2 DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int2 NOT NULL,
  CONSTRAINT promotion_pk PRIMARY KEY (id),
  CONSTRAINT promotion_fk_diploma FOREIGN KEY (diploma_id) REFERENCES public.diploma(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT promotion_fk_promotion_level FOREIGN KEY (promotion_level_id) REFERENCES public.promotion_level(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT promotion_check_year CHECK ((year >= 2000) AND (year <= 2099)),
  CONSTRAINT promotion_unique_diploma_promotion_level_year UNIQUE (diploma_id, promotion_level_id, year)
);

CREATE TABLE public.user_promotion (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  CONSTRAINT user_promotion_pk PRIMARY KEY (id),
  CONSTRAINT user_promotion_fk_user FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT user_promotion_fk_promotion FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT user_promotion_unique_user_promotion UNIQUE (user_id, promotion_id)
);

CREATE TABLE public.ue (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  initialism varchar(10) NOT NULL,
  name varchar(250) NOT NULL,
  CONSTRAINT ue_pk PRIMARY KEY (id),
  CONSTRAINT ue_unique_initialism UNIQUE (initialism),
  CONSTRAINT ue_check_initialism CHECK (initialism ~ '^[A-Z0-9_]+$'),
  CONSTRAINT ue_unique_name UNIQUE (name),
  CONSTRAINT ue_check_name CHECK (trim(name) <> '')
);

CREATE TABLE public.template (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ue_id uuid NOT NULL,
  year int2 DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int2 NOT NULL,
  CONSTRAINT template_pk PRIMARY KEY (id),
  CONSTRAINT template_fk_ue FOREIGN KEY (ue_id) REFERENCES public.ue(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT template_check_year CHECK ((year >= 2000) AND (year <= 2099)),
  CONSTRAINT template_unique_ue_year UNIQUE (ue_id, year)
);

CREATE TABLE public.repository (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  archived_at timestamp DEFAULT NULL,
  template_id uuid NOT NULL,
  promotion_id uuid NOT NULL,
  comment text DEFAULT NULL,
  github_id int8 DEFAULT NULL,
  github_team_id int8 DEFAULT NULL,
  CONSTRAINT repository_pk PRIMARY KEY (id),
  CONSTRAINT repository_fk_template FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT repository_fk_promotion FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT repository_unique_github_id UNIQUE (github_id),
  CONSTRAINT repository_check_github_id CHECK (github_id IS NULL OR github_id >= 100000000),
  CONSTRAINT repository_unique_github_team_id UNIQUE (github_team_id),
  CONSTRAINT repository_check_github_team_id CHECK (github_team_id IS NULL OR github_team_id >= 10000000)
);

CREATE TABLE public.user_repository (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  user_id uuid NOT NULL,
  repository_id uuid NOT NULL,
  CONSTRAINT user_repository_pk PRIMARY KEY (id),
  CONSTRAINT user_repository_fk_user FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT user_repository_fk_repository FOREIGN KEY (repository_id) REFERENCES public.repository(id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT user_repository_unique_user_repository UNIQUE (user_id, repository_id)
);

CREATE TABLE public.milestone (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  template_id uuid NOT NULL,
  title varchar(250) NOT NULL,
  date date NOT NULL,
  CONSTRAINT milestone_pk PRIMARY KEY (id),
  CONSTRAINT milestone_fk_template FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT milestone_check_title CHECK (trim(title) <> ''),
  CONSTRAINT milestone_check_date CHECK (date >= '2000-01-01' AND date <= '2099-12-31'),
  CONSTRAINT milestone_unique_template_title UNIQUE (template_id, title),
  CONSTRAINT milestone_unique_template_date UNIQUE (template_id, date)
);
