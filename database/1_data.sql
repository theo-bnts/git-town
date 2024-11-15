INSERT INTO public.promotion_level (id, created_at, updated_at, initialism, value) VALUES
	('fe176233-f73a-4da7-b6bc-283a78e15333'::uuid, '2024-11-15 16:08:37.704104', '2024-11-15 16:08:37.704104', 'M1', 'Master 1'),
	('badb0636-db18-4d24-84c2-72569e918818'::uuid, '2024-11-15 16:08:37.711353', '2024-11-15 16:08:37.711353', 'M2', 'Master 2');

INSERT INTO public.subject (id, created_at, updated_at, initialism, value) VALUES
	('a4f37644-6081-461b-a8d9-219c0e64cf44'::uuid, '2024-11-15 16:21:17.347173', '2024-11-15 16:21:17.347173', 'EDC', 'Étude de cas');

INSERT INTO public."role" (id, created_at, updated_at, value) VALUES
	('f6c1c99e-39cb-484a-964c-61a719b39662'::uuid, '2024-11-15 16:17:28.19145', '2024-11-15 16:17:28.19145', 'student'),
	('01e2bcf2-5a03-48b4-ac13-96a7dfa632ec'::uuid, '2024-11-15 16:17:28.195317', '2024-11-15 16:17:28.195317', 'teacher'),
	('8d4b62b8-737a-4c53-bff7-1f19b36ceee0'::uuid, '2024-11-15 16:17:44.040722', '2024-11-15 16:17:44.040722', 'administrator');
