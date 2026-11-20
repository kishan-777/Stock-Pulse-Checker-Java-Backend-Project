-- ==============================================================
-- Smart Inventory Demand Predictor Seed Data
-- ==============================================================

USE `smart_inventory_db`;

-- Insert Categories
INSERT INTO `categories` (`category_id`, `name`, `description`) VALUES
(1, 'Electronics', 'Computer peripherals, accessories and gadgets'),
(2, 'Stationery', 'Office supplies, notebooks, pens and desk essentials'),
(3, 'Groceries & Snacks', 'Packaged food items, tea, coffee and beverages'),
(4, 'Personal Care', 'Daily hygiene and wellness products');

-- Insert Products with varied stock levels and lead times
INSERT INTO `products` (`product_id`, `sku`, `name`, `category_id`, `unit_price`, `cost_price`, `current_stock`, `lead_time_days`, `safety_stock`, `target_stock_days`) VALUES
(1, 'ELEC-LOGI-M170', 'Logitech Wireless Mouse M170', 1, 650.00, 480.00, 8, 4, 6, 30),
(2, 'ELEC-SANS-USB32', 'SanDisk 32GB Ultra USB 3.0 Flash Drive', 1, 420.00, 310.00, 12, 3, 5, 25),
(3, 'ELEC-BOAT-EP100', 'boAt Bassheads 100 Wired Earphones', 1, 399.00, 260.00, 4, 5, 8, 30),
(4, 'ELEC-TYPEC-CBL', 'Braided Type-C Fast Charging Cable 1.5m', 1, 199.00, 110.00, 25, 2, 6, 20),
(5, 'ELEC-LAP-STAND', 'Adjustable Aluminum Laptop Stand', 1, 899.00, 580.00, 5, 6, 4, 30),
(6, 'STAT-CLASS-A4', 'Classmate Spiral Notebook A4 (300 Pages)', 2, 140.00, 95.00, 10, 3, 10, 30),
(7, 'STAT-REYN-PEN', 'Reynolds 045 Fine Carbure Ball Pen (Pack of 10)', 2, 100.00, 70.00, 45, 2, 12, 20),
(8, 'STAT-FABER-HL', 'Faber-Castell Textliner Highlighters (Set of 5)', 2, 125.00, 85.00, 6, 4, 5, 30),
(9, 'STAT-POSTIT-PD', '3M Post-it Sticky Notes (3x3 inch, 100 sheets)', 2, 65.00, 42.00, 18, 3, 5, 25),
(10, 'STAT-KANG-STP', 'Kangaro No. 10 Stapler + 1000 Pins Box', 2, 85.00, 55.00, 9, 3, 4, 30),
(11, 'GROC-NESC-CL50', 'Nescafe Classic Instant Coffee Jar 50g', 3, 185.00, 145.00, 7, 4, 6, 30),
(12, 'GROC-TATATEA-25', 'Tata Tea Gold Premium Blend 250g', 3, 160.00, 125.00, 22, 3, 8, 25),
(13, 'GROC-PARLE-G', 'Parle-G Gold Biscuits (1kg Family Pack)', 3, 120.00, 96.00, 14, 2, 10, 20),
(14, 'GROC-AMUL-DRK', 'Amul 55% Dark Chocolate Bar 150g', 3, 110.00, 85.00, 3, 5, 6, 25),
(15, 'CARE-DETT-LIQ', 'Dettol Liquid Handwash Refill 750ml', 4, 115.00, 88.00, 15, 3, 6, 30),
(16, 'CARE-HIM-FW100', 'Himalaya Purifying Neem Face Wash 100ml', 4, 145.00, 108.00, 5, 4, 5, 30),
(17, 'CARE-COLG-MAX', 'Colgate MaxFresh Spicy Fresh Toothpaste 150g', 4, 110.00, 82.00, 28, 2, 8, 25),
(18, 'CARE-NIV-CREAM', 'Nivea Soft Moisturizing Cream 100ml', 4, 195.00, 148.00, 6, 5, 5, 30);

-- Initial Stock-In records
INSERT INTO `stock_movements` (`product_id`, `movement_type`, `quantity`, `reason`, `movement_date`) VALUES
(1, 'IN', 50, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(2, 'IN', 60, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(3, 'IN', 40, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(4, 'IN', 80, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(5, 'IN', 30, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(6, 'IN', 100, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(7, 'IN', 120, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(8, 'IN', 50, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(9, 'IN', 60, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(10, 'IN', 40, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(11, 'IN', 50, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(12, 'IN', 60, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(13, 'IN', 70, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(14, 'IN', 40, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(15, 'IN', 50, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(16, 'IN', 40, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(17, 'IN', 60, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(18, 'IN', 40, 'Initial opening batch stock', DATE_SUB(NOW(), INTERVAL 35 DAY));

-- 30 Days of realistic historical sales (spread over past month)
-- Sale 1 (28 days ago)
INSERT INTO `sales` (`sale_id`, `invoice_no`, `sale_date`, `total_amount`, `customer_name`, `payment_mode`) VALUES
(1, 'INV-2026-001', DATE_SUB(NOW(), INTERVAL 28 DAY), 2140.00, 'Rahul Sharma', 'UPI'),
(2, 'INV-2026-002', DATE_SUB(NOW(), INTERVAL 26 DAY), 1250.00, 'Priya Patel', 'Cash'),
(3, 'INV-2026-003', DATE_SUB(NOW(), INTERVAL 24 DAY), 3450.00, 'Amit Verma', 'Credit Card'),
(4, 'INV-2026-004', DATE_SUB(NOW(), INTERVAL 22 DAY), 980.00, 'Sneha Joshi', 'UPI'),
(5, 'INV-2026-005', DATE_SUB(NOW(), INTERVAL 20 DAY), 1850.00, 'Vikas Singh', 'Cash'),
(6, 'INV-2026-006', DATE_SUB(NOW(), INTERVAL 18 DAY), 2600.00, 'Ananya Roy', 'UPI'),
(7, 'INV-2026-007', DATE_SUB(NOW(), INTERVAL 16 DAY), 1430.00, 'Karan Malhotra', 'UPI'),
(8, 'INV-2026-008', DATE_SUB(NOW(), INTERVAL 14 DAY), 3120.00, 'Deepak Gupta', 'Cash'),
(9, 'INV-2026-009', DATE_SUB(NOW(), INTERVAL 12 DAY), 2200.00, 'Neha Reddy', 'Credit Card'),
(10, 'INV-2026-010', DATE_SUB(NOW(), INTERVAL 10 DAY), 1780.00, 'Manoj Nair', 'UPI'),
(11, 'INV-2026-011', DATE_SUB(NOW(), INTERVAL 8 DAY), 2950.00, 'Pooja Bhatia', 'UPI'),
(12, 'INV-2026-012', DATE_SUB(NOW(), INTERVAL 6 DAY), 1640.00, 'Rohan Kapoor', 'Cash'),
(13, 'INV-2026-013', DATE_SUB(NOW(), INTERVAL 4 DAY), 3800.00, 'Simran Kaur', 'UPI'),
(14, 'INV-2026-014', DATE_SUB(NOW(), INTERVAL 2 DAY), 2410.00, 'Alok Mishra', 'Credit Card'),
(15, 'INV-2026-015', DATE_SUB(NOW(), INTERVAL 1 DAY), 1890.00, 'Tanvi Saxena', 'UPI'),
(16, 'INV-2026-016', NOW(), 1298.00, 'Walk-in Customer', 'Cash');

-- Sale Items for the historical sales
INSERT INTO `sale_items` (`sale_id`, `product_id`, `quantity`, `unit_price`, `subtotal`) VALUES
-- Inv 1: Mouse, Flash Drive
(1, 1, 2, 650.00, 1300.00),
(1, 2, 2, 420.00, 840.00),
-- Inv 2: Earphones, Cable, Pen
(2, 3, 2, 399.00, 798.00),
(2, 4, 1, 199.00, 199.00),
(2, 7, 2, 100.00, 200.00),
-- Inv 3: Laptop Stand, Mouse, Coffee
(3, 5, 2, 899.00, 1798.00),
(3, 1, 1, 650.00, 650.00),
(3, 11, 4, 185.00, 740.00),
-- Inv 4: Notebook, Pen, Post-it
(4, 6, 4, 140.00, 560.00),
(4, 7, 2, 100.00, 200.00),
(4, 9, 3, 65.00, 195.00),
-- Inv 5: Amul Dark, Nescafe, Dettol
(5, 14, 5, 110.00, 550.00),
(5, 11, 4, 185.00, 740.00),
(5, 15, 4, 115.00, 460.00),
-- Inv 6: boAt Earphones, Mouse, Chocolate
(6, 3, 3, 399.00, 1197.00),
(6, 1, 1, 650.00, 650.00),
(6, 14, 5, 110.00, 550.00),
-- Inv 7: Face Wash, Moisturizer, Toothpaste
(7, 16, 4, 145.00, 580.00),
(7, 18, 3, 195.00, 585.00),
(7, 17, 2, 110.00, 220.00),
-- Inv 8: Laptop stand, Mouse, USB
(8, 5, 2, 899.00, 1798.00),
(8, 1, 1, 650.00, 650.00),
(8, 2, 1, 420.00, 420.00),
-- Inv 9: Notebooks, Tea, Biscuits
(9, 6, 8, 140.00, 1120.00),
(9, 12, 4, 160.00, 640.00),
(9, 13, 3, 120.00, 360.00),
-- Inv 10: Earphones, Highlighters, Stapler
(10, 3, 2, 399.00, 798.00),
(10, 8, 5, 125.00, 625.00),
(10, 10, 3, 85.00, 255.00),
-- Inv 11: Laptop stand, Mouse, Coffee
(11, 5, 2, 899.00, 1798.00),
(11, 1, 1, 650.00, 650.00),
(11, 11, 2, 185.00, 370.00),
-- Inv 12: Dettol, Facewash, Cream
(12, 15, 5, 115.00, 575.00),
(12, 16, 4, 145.00, 580.00),
(12, 18, 2, 195.00, 390.00),
-- Inv 13: Mouse, USB, Earphones, Chocolate
(13, 1, 2, 650.00, 1300.00),
(13, 2, 2, 420.00, 840.00),
(13, 3, 2, 399.00, 798.00),
(13, 14, 6, 110.00, 660.00),
-- Inv 14: Laptop stand, Highlighters, Notebooks
(14, 5, 1, 899.00, 899.00),
(14, 8, 5, 125.00, 625.00),
(14, 6, 6, 140.00, 840.00),
-- Inv 15: Earphones, Mouse, Coffee
(15, 3, 2, 399.00, 798.00),
(15, 1, 1, 650.00, 650.00),
(15, 11, 2, 185.00, 370.00),
-- Inv 16: Mouse, Cable, Biscuits
(16, 1, 1, 650.00, 650.00),
(16, 4, 2, 199.00, 398.00),
(16, 13, 2, 120.00, 240.00);
