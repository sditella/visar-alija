-- Add UNIQUE constraint on username if not exists
ALTER TABLE admin_users ADD CONSTRAINT admin_users_username_unique UNIQUE (username);
