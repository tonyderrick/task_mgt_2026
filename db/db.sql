-- ============================================================
--  Task Manager — database setup
--  kLab Tech Upskill Program, full-stack coding challenge
--
--  Run with:  mysql -u root -p < db.sql
--  Or paste into MySQL Workbench / phpMyAdmin and execute.
-- ============================================================

CREATE DATABASE IF NOT EXISTS task_mgt
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE task_mgt;

-- ------------------------------------------------------------
--  Table: tasks
-- ------------------------------------------------------------
DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(120)                   NOT NULL,
  description   TEXT                           NULL,
  status        ENUM('pending', 'completed')   NOT NULL DEFAULT 'pending',
  priority      ENUM('low', 'medium', 'high')  NOT NULL DEFAULT 'medium',
  created_at    TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,

  -- every list query filters on status and orders by created_at
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
--  Sample data (optional — delete this block for an empty list)
-- ------------------------------------------------------------
INSERT INTO tasks (title, description, status, priority) VALUES
  ('Fix login page bug',
   'Users are reporting a 500 error when submitting the login form on Safari.',
   'pending',   'high'),

  ('Review pull request #142',
   'Check the new authentication middleware before merging to main.',
   'pending',   'medium'),

  ('Deploy backend to staging',
   'Push the latest build and confirm the health check endpoint responds.',
   'completed', 'high'),

  ('Update Node dependencies',
   'Run npm audit and bump outdated packages, especially express and mysql2.',
   'pending',   'low'),

  ('Back up production database',
   'Run the nightly mysqldump job and verify the backup file uploads correctly.',
   'completed', 'high'),

  ('Write unit tests for task controller',
   'Cover create, update, and delete endpoints, including validation failures.',
   'pending',   'medium'),

  ('Set up CI pipeline',
   'Add a GitHub Actions workflow that runs lint and tests on every push.',
   'pending',   'medium'),

  ('Rotate API keys',
   'Old keys expire this week — generate new ones and update the .env on all servers.',
   'completed', 'high');

-- ------------------------------------------------------------
--  Verify
-- ------------------------------------------------------------
SELECT id, title, status, priority, created_at FROM tasks ORDER BY created_at DESC;
