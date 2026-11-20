-- ==============================================================
-- Smart Inventory Demand Predictor Database Schema
-- Compatible with MySQL Server 8.0 & MySQL Workbench
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `smart_inventory_db`;
USE `smart_inventory_db`;

-- 1. Drop existing tables if needed (in foreign key order)
DROP TABLE IF EXISTS `sale_items`;
DROP TABLE IF EXISTS `sales`;
DROP TABLE IF EXISTS `stock_movements`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;

-- 2. Categories Table
CREATE TABLE `categories` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
CREATE TABLE `products` (
    `product_id` INT AUTO_INCREMENT PRIMARY KEY,
    `sku` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `category_id` INT,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `cost_price` DECIMAL(10, 2) NOT NULL,
    `current_stock` INT NOT NULL DEFAULT 0,
    `lead_time_days` INT NOT NULL DEFAULT 3,
    `safety_stock` INT NOT NULL DEFAULT 5,
    `target_stock_days` INT NOT NULL DEFAULT 30,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) 
        REFERENCES `categories`(`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Stock Movements (Stock-In, Stock-Out, Adjustments)
CREATE TABLE `stock_movements` (
    `movement_id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `movement_type` ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    `quantity` INT NOT NULL,
    `reason` VARCHAR(255) DEFAULT 'Standard stock movement',
    `movement_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_movement_product` FOREIGN KEY (`product_id`) 
        REFERENCES `products`(`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sales Invoices
CREATE TABLE `sales` (
    `sale_id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_no` VARCHAR(50) NOT NULL UNIQUE,
    `sale_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `customer_name` VARCHAR(100) DEFAULT 'Walk-in Customer',
    `payment_mode` VARCHAR(50) DEFAULT 'Cash'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Individual Sale Items
CREATE TABLE `sale_items` (
    `item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `sale_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    CONSTRAINT `fk_sale_parent` FOREIGN KEY (`sale_id`) 
        REFERENCES `sales`(`sale_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) 
        REFERENCES `products`(`product_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for lightning fast demand analytics & sales aggregations
CREATE INDEX `idx_sales_date` ON `sales`(`sale_date`);
CREATE INDEX `idx_item_product` ON `sale_items`(`product_id`);
CREATE INDEX `idx_stock_product` ON `stock_movements`(`product_id`);
