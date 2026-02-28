-- Task 8: Shipping Management SQL Commands

-- ============================================
-- 1. Create shipping table
-- ============================================
CREATE TABLE IF NOT EXISTS shipping (
    shipping_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    courier_service VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    shipping_status VARCHAR(50) NOT NULL,
    shipping_method VARCHAR(50) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_shipping_order (order_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- ============================================
-- 2. Verify table creation
-- ============================================
SHOW COLUMNS FROM shipping;
