-- Task 4: Customer Management SQL Commands
-- Run these commands to set up the database for Task 4

-- ============================================
-- 1. Add new columns to users table
-- ============================================
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(50) AFTER password,
ADD COLUMN last_name VARCHAR(50) AFTER first_name,
ADD COLUMN phone_number VARCHAR(20) AFTER last_name,
ADD COLUMN status TINYINT(1) NOT NULL DEFAULT 1 AFTER phone_number,
ADD COLUMN updated_at DATETIME AFTER created_at;

-- ============================================
-- 2. Set default status for existing users
-- ============================================
UPDATE users SET status = 1 WHERE status IS NULL;

-- ============================================
-- 3. Update existing users with sample first/last names (optional)
-- ============================================
-- Update admin user
UPDATE users 
SET first_name = 'Admin', 
    last_name = 'User',
    phone_number = '9876543210'
WHERE username = 'admin';

-- Update regular users with placeholder names based on their username
UPDATE users 
SET first_name = CONCAT(UPPER(LEFT(username, 1)), SUBSTRING(username, 2)),
    last_name = 'User',
    phone_number = CONCAT('9', FLOOR(100000000 + RAND() * 899999999))
WHERE first_name IS NULL AND username != 'admin';

-- ============================================
-- 4. Verify the changes
-- ============================================
SELECT id, username, email, first_name, last_name, phone_number, status, created_at, updated_at 
FROM users;

-- ============================================
-- 5. Create a new admin user (optional - if needed)
-- ============================================
-- Note: Password is 'admin123' encoded with BCrypt
-- INSERT INTO users (username, email, password, first_name, last_name, phone_number, status, created_at) 
-- VALUES ('admin', 'admin@workflow.com', '$2a$10$N9qo8uLOogjWLX.x0sX.h.Z3Q5Uj6x5BVBz6W8qQ8hOJPq9hXyCzW', 'Admin', 'User', '9876543210', 1, NOW());

-- ============================================
-- 6. Create a new regular user (optional)
-- ============================================
-- Note: Password is 'user123' encoded with BCrypt
-- INSERT INTO users (username, email, password, first_name, last_name, phone_number, status, created_at) 
-- VALUES ('john_doe', 'john@example.com', '$2a$10$N9qo8uLOogjWLX.x0sX.h.Z3Q5Uj6x5BVBz6W8qQ8hOJPq9hXyCzW', 'John', 'Doe', '9123456789', 1, NOW());

-- ============================================
-- 7. Check order counts per user (for dashboard)
-- ============================================
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(o.order_id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username, u.email;

-- ============================================
-- 8. Deactivate a user (soft delete)
-- ============================================
-- UPDATE users SET status = 0, updated_at = NOW() WHERE id = 2;

-- ============================================
-- 9. Reactivate a user
-- ============================================
-- UPDATE users SET status = 1, updated_at = NOW() WHERE id = 2;

-- ============================================
-- 10. Find users by email pattern (for search functionality)
-- ============================================
-- SELECT * FROM users WHERE email LIKE '%john%';
