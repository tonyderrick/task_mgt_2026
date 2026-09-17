CREATE TABLE IF NOT EXISTS tasks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(120)  NOT NULL,
  description   TEXT          NULL,
  status        ENUM('pending', 'completed')    NOT NULL DEFAULT 'pending',
  priority      ENUM('low', 'medium', 'high')   NOT NULL DEFAULT 'medium',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
