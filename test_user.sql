INSERT INTO "user" (user_id, role, university_email, name, password, password_set, auth_provider)
VALUES ('e22018', 'student', 'e22018@eng.pdn.ac.lk', 'Test Student', '$2b$10$dummy.hash.for.password123', true, 'password')
ON CONFLICT (user_id) DO NOTHING;