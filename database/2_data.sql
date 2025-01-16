INSERT INTO public."role" (id, created_at, updated_at, keyword, name) VALUES
  ('f6c1c99e-39cb-484a-964c-61a719b39662'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'student', 'Étudiant'),
  ('01e2bcf2-5a03-48b4-ac13-96a7dfa632ec'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'teacher', 'Enseignant'),
  ('8d4b62b8-737a-4c53-bff7-1f19b36ceee0'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'administrator', 'Administrateur');

INSERT INTO public."user" (id, created_at, updated_at, email, password_hash, password_salt, full_name, role_id, github_id) VALUES
  ('a940c6f9-fa0b-4154-8656-7b9c05d60963'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'anne.lapujade@u-picardie.fr', NULL, NULL, 'LAPUJADE ANNE', '8d4b62b8-737a-4c53-bff7-1f19b36ceee0'::uuid, NULL);

INSERT INTO public.diploma (id, created_at, updated_at, initialism, name) VALUES
  ('392f9a18-78e9-4c8b-a304-a92a74ea7e5c'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'MIAGE', 'Méthodes Informatiques Appliquées à la Gestion des Entreprises');

INSERT INTO public.promotion_level (id, created_at, updated_at, initialism, name) VALUES
  ('fe176233-f73a-4da7-b6bc-283a78e15333'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'M1', 'Master 1'),
  ('badb0636-db18-4d24-84c2-72569e918818'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'M2', 'Master 2');

INSERT INTO public.ue (id, created_at, updated_at, initialism, name) VALUES
  ('a4f37644-6081-461b-a8d9-219c0e64cf44'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PRO_05', 'Étude de cas SI'),
  ('0cb6aff3-9db5-40a5-a548-08af8cd7b3f0'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'PRO_03', 'Étude de cas thématique');
