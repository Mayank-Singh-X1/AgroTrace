-- ==================================================
-- AGRI-TRACE: SQL FOR ADDING PRODUCTS
-- ==================================================
-- This file contains SQL statements for adding products to the Agri-Trace database
-- Compatible with both SQLite (development) and PostgreSQL (production)

-- ==================================================
-- SQLITE VERSION (Development)
-- ==================================================

-- Sample users (farmers) for development
INSERT OR IGNORE INTO users (id, email, first_name, last_name, role, company_name, location, verification_status, created_at, updated_at)
VALUES 
  ('farmer-001', 'john.farmer@example.com', 'John', 'Smith', 'farmer', 'Green Valley Farm', 'Iowa, USA', 'verified', datetime('now'), datetime('now')),
  ('farmer-002', 'mary.green@example.com', 'Mary', 'Green', 'farmer', 'Organic Harvest Co.', 'California, USA', 'verified', datetime('now'), datetime('now')),
  ('farmer-003', 'david.field@example.com', 'David', 'Field', 'farmer', 'Field Fresh Farms', 'Texas, USA', 'verified', datetime('now'), datetime('now'));

-- Sample products for SQLite
INSERT OR IGNORE INTO products (
  id, name, description, product_type, batch_number, quantity, unit, 
  origin_farm_id, harvest_date, expiry_date, status, qr_code, created_by, 
  created_at, updated_at
)
VALUES 
  -- Organic Wheat
  ('product-001', 'Premium Organic Wheat', 'High-quality organic wheat grown without pesticides', 'Grain', 'WHEAT-2024-001', 1500.00, 'kg', 'farmer-001', datetime('2024-03-15'), datetime('2025-03-15'), 'in_production', 'QR-WHEAT001', 'farmer-001', datetime('now'), datetime('now')),
  
  -- Fresh Apples
  ('product-002', 'Red Delicious Apples', 'Crispy and sweet red delicious apples', 'Fruit', 'APPLE-2024-002', 800.50, 'kg', 'farmer-002', datetime('2024-03-20'), datetime('2024-04-20'), 'quality_check', 'QR-APPLE002', 'farmer-002', datetime('now'), datetime('now')),
  
  -- Organic Tomatoes
  ('product-003', 'Vine-Ripened Tomatoes', 'Fresh organic tomatoes ripened on the vine', 'Vegetable', 'TOMATO-2024-003', 600.75, 'kg', 'farmer-003', datetime('2024-03-18'), datetime('2024-04-08'), 'in_transit', 'QR-TOMATO003', 'farmer-003', datetime('now'), datetime('now')),
  
  -- Corn
  ('product-004', 'Sweet Corn', 'Non-GMO sweet corn perfect for fresh consumption', 'Vegetable', 'CORN-2024-004', 1200.00, 'kg', 'farmer-001', datetime('2024-03-10'), datetime('2024-04-10'), 'delivered', 'QR-CORN004', 'farmer-001', datetime('now'), datetime('now')),
  
  -- Soybeans
  ('product-005', 'Organic Soybeans', 'Premium organic soybeans for processing', 'Legume', 'SOY-2024-005', 2000.25, 'kg', 'farmer-002', datetime('2024-03-05'), datetime('2025-03-05'), 'created', 'QR-SOY005', 'farmer-002', datetime('now'), datetime('now'));

-- ==================================================
-- POSTGRESQL VERSION (Production)
-- ==================================================

-- Sample users (farmers) for production
INSERT INTO users (id, email, first_name, last_name, role, company_name, location, verification_status, created_at, updated_at)
VALUES 
  ('farmer-001', 'john.farmer@example.com', 'John', 'Smith', 'farmer', 'Green Valley Farm', 'Iowa, USA', 'verified', NOW(), NOW()),
  ('farmer-002', 'mary.green@example.com', 'Mary', 'Green', 'farmer', 'Organic Harvest Co.', 'California, USA', 'verified', NOW(), NOW()),
  ('farmer-003', 'david.field@example.com', 'David', 'Field', 'farmer', 'Field Fresh Farms', 'Texas, USA', 'verified', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Sample products for PostgreSQL
INSERT INTO products (
  id, name, description, product_type, batch_number, quantity, unit, 
  origin_farm_id, harvest_date, expiry_date, status, qr_code, created_by, 
  created_at, updated_at
)
VALUES 
  -- Organic Wheat
  ('product-001', 'Premium Organic Wheat', 'High-quality organic wheat grown without pesticides', 'Grain', 'WHEAT-2024-001', 1500.00, 'kg', 'farmer-001', '2024-03-15'::timestamp, '2025-03-15'::timestamp, 'in_production', 'QR-WHEAT001', 'farmer-001', NOW(), NOW()),
  
  -- Fresh Apples
  ('product-002', 'Red Delicious Apples', 'Crispy and sweet red delicious apples', 'Fruit', 'APPLE-2024-002', 800.50, 'kg', 'farmer-002', '2024-03-20'::timestamp, '2024-04-20'::timestamp, 'quality_check', 'QR-APPLE002', 'farmer-002', NOW(), NOW()),
  
  -- Organic Tomatoes
  ('product-003', 'Vine-Ripened Tomatoes', 'Fresh organic tomatoes ripened on the vine', 'Vegetable', 'TOMATO-2024-003', 600.75, 'kg', 'farmer-003', '2024-03-18'::timestamp, '2024-04-08'::timestamp, 'in_transit', 'QR-TOMATO003', 'farmer-003', NOW(), NOW()),
  
  -- Corn
  ('product-004', 'Sweet Corn', 'Non-GMO sweet corn perfect for fresh consumption', 'Vegetable', 'CORN-2024-004', 1200.00, 'kg', 'farmer-001', '2024-03-10'::timestamp, '2024-04-10'::timestamp, 'delivered', 'QR-CORN004', 'farmer-001', NOW(), NOW()),
  
  -- Soybeans
  ('product-005', 'Organic Soybeans', 'Premium organic soybeans for processing', 'Legume', 'SOY-2024-005', 2000.25, 'kg', 'farmer-002', '2024-03-05'::timestamp, '2025-03-05'::timestamp, 'created', 'QR-SOY005', 'farmer-002', NOW(), NOW())
ON CONFLICT (batch_number) DO NOTHING;

-- ==================================================
-- SUPPLY CHAIN STAGES FOR SAMPLE PRODUCTS
-- ==================================================

-- SQLite version
INSERT OR IGNORE INTO supply_chain_stages (
  id, product_id, stage_name, stage_type, handler_id, location, 
  timestamp, notes, verification_data, status
)
VALUES 
  -- Wheat supply chain stages
  ('stage-001', 'product-001', 'Farm Production', 'production', 'farmer-001', 'Green Valley Farm, Iowa', datetime('2024-03-15'), 'Seeds planted and harvested', '{"method": "Organic Certification", "verifier": "USDA Organic"}', 'completed'),
  ('stage-002', 'product-001', 'Quality Inspection', 'inspection', 'farmer-001', 'Farm Quality Lab', datetime('2024-03-16'), 'Passed organic standards test', '{"test_results": "Grade A", "moisture_content": "12%"}', 'completed'),
  
  -- Apple supply chain stages
  ('stage-003', 'product-002', 'Farm Production', 'production', 'farmer-002', 'Organic Harvest Co., California', datetime('2024-03-20'), 'Hand-picked at optimal ripeness', '{"picking_method": "Hand-selected", "ripeness": "Perfect"}', 'completed'),
  ('stage-004', 'product-002', 'Quality Check', 'inspection', 'farmer-002', 'On-site Quality Center', datetime('2024-03-21'), 'Size grading and quality assessment', '{"grade": "Premium", "size": "Large"}', 'completed'),
  
  -- Tomato supply chain stages
  ('stage-005', 'product-003', 'Farm Production', 'production', 'farmer-003', 'Field Fresh Farms, Texas', datetime('2024-03-18'), 'Vine-ripened in greenhouse', '{"growing_method": "Hydroponic", "pesticide_free": true}', 'completed'),
  ('stage-006', 'product-003', 'Packaging', 'transport', 'farmer-003', 'Farm Packaging Center', datetime('2024-03-19'), 'Packed in eco-friendly containers', '{"package_type": "Biodegradable", "temperature": "4°C"}', 'completed');

-- PostgreSQL version
INSERT INTO supply_chain_stages (
  id, product_id, stage_name, stage_type, handler_id, location, 
  timestamp, notes, verification_data, status
)
VALUES 
  -- Wheat supply chain stages
  ('stage-001', 'product-001', 'Farm Production', 'production', 'farmer-001', 'Green Valley Farm, Iowa', '2024-03-15'::timestamp, 'Seeds planted and harvested', '{"method": "Organic Certification", "verifier": "USDA Organic"}', 'completed'),
  ('stage-002', 'product-001', 'Quality Inspection', 'inspection', 'farmer-001', 'Farm Quality Lab', '2024-03-16'::timestamp, 'Passed organic standards test', '{"test_results": "Grade A", "moisture_content": "12%"}', 'completed'),
  
  -- Apple supply chain stages
  ('stage-003', 'product-002', 'Farm Production', 'production', 'farmer-002', 'Organic Harvest Co., California', '2024-03-20'::timestamp, 'Hand-picked at optimal ripeness', '{"picking_method": "Hand-selected", "ripeness": "Perfect"}', 'completed'),
  ('stage-004', 'product-002', 'Quality Check', 'inspection', 'farmer-002', 'On-site Quality Center', '2024-03-21'::timestamp, 'Size grading and quality assessment', '{"grade": "Premium", "size": "Large"}', 'completed'),
  
  -- Tomato supply chain stages
  ('stage-005', 'product-003', 'Farm Production', 'production', 'farmer-003', 'Field Fresh Farms, Texas', '2024-03-18'::timestamp, 'Vine-ripened in greenhouse', '{"growing_method": "Hydroponic", "pesticide_free": true}', 'completed'),
  ('stage-006', 'product-003', 'Packaging', 'transport', 'farmer-003', 'Farm Packaging Center', '2024-03-19'::timestamp, 'Packed in eco-friendly containers', '{"package_type": "Biodegradable", "temperature": "4°C"}', 'completed')
ON CONFLICT (id) DO NOTHING;

-- ==================================================
-- VERIFICATION RECORDS
-- ==================================================

-- Sample inspectors
INSERT OR IGNORE INTO users (id, email, first_name, last_name, role, company_name, location, verification_status, created_at, updated_at)
VALUES 
  ('inspector-001', 'alice.inspector@certify.com', 'Alice', 'Johnson', 'inspector', 'AgriCert Inspections', 'National Office', 'verified', datetime('now'), datetime('now'));

-- PostgreSQL version
INSERT INTO users (id, email, first_name, last_name, role, company_name, location, verification_status, created_at, updated_at)
VALUES 
  ('inspector-001', 'alice.inspector@certify.com', 'Alice', 'Johnson', 'inspector', 'AgriCert Inspections', 'National Office', 'verified', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Verification records (SQLite)
INSERT OR IGNORE INTO verifications (
  id, product_id, verifier_id, verification_type, result, 
  certificate_url, notes, valid_until, created_at
)
VALUES 
  ('verification-001', 'product-001', 'inspector-001', 'organic', 'passed', 'https://certs.usda.gov/wheat-001', 'Meets all organic farming standards', datetime('2025-03-15'), datetime('now')),
  ('verification-002', 'product-002', 'inspector-001', 'quality', 'passed', 'https://certs.agri.gov/apple-002', 'Grade A quality certification', datetime('2024-06-20'), datetime('now')),
  ('verification-003', 'product-003', 'inspector-001', 'safety', 'passed', 'https://certs.fda.gov/tomato-003', 'Food safety standards met', datetime('2024-09-18'), datetime('now'));

-- Verification records (PostgreSQL)
INSERT INTO verifications (
  id, product_id, verifier_id, verification_type, result, 
  certificate_url, notes, valid_until, created_at
)
VALUES 
  ('verification-001', 'product-001', 'inspector-001', 'organic', 'passed', 'https://certs.usda.gov/wheat-001', 'Meets all organic farming standards', '2025-03-15'::timestamp, NOW()),
  ('verification-002', 'product-002', 'inspector-001', 'quality', 'passed', 'https://certs.agri.gov/apple-002', 'Grade A quality certification', '2024-06-20'::timestamp, NOW()),
  ('verification-003', 'product-003', 'inspector-001', 'safety', 'passed', 'https://certs.fda.gov/tomato-003', 'Food safety standards met', '2024-09-18'::timestamp, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================================================
-- ADDITIONAL PRODUCT TEMPLATES
-- ==================================================

-- Template for adding a single product (SQLite)
/*
INSERT OR IGNORE INTO products (
  id, name, description, product_type, batch_number, quantity, unit, 
  origin_farm_id, harvest_date, expiry_date, status, qr_code, created_by, 
  created_at, updated_at
)
VALUES 
  ('your-product-id', 'Product Name', 'Product Description', 'Product Type', 'BATCH-NUMBER', 100.00, 'kg', 'farmer-id', datetime('2024-03-01'), datetime('2024-06-01'), 'created', 'QR-CODE', 'farmer-id', datetime('now'), datetime('now'));
*/

-- Template for adding a single product (PostgreSQL)
/*
INSERT INTO products (
  id, name, description, product_type, batch_number, quantity, unit, 
  origin_farm_id, harvest_date, expiry_date, status, qr_code, created_by, 
  created_at, updated_at
)
VALUES 
  ('your-product-id', 'Product Name', 'Product Description', 'Product Type', 'BATCH-NUMBER', 100.00, 'kg', 'farmer-id', '2024-03-01'::timestamp, '2024-06-01'::timestamp, 'created', 'QR-CODE', 'farmer-id', NOW(), NOW())
ON CONFLICT (batch_number) DO NOTHING;
*/

-- ==================================================
-- USEFUL QUERIES FOR PRODUCT MANAGEMENT
-- ==================================================

-- Check all products
-- SELECT * FROM products ORDER BY created_at DESC;

-- Check products by farmer
-- SELECT * FROM products WHERE created_by = 'farmer-001';

-- Check products by status
-- SELECT * FROM products WHERE status = 'in_production';

-- Get product with supply chain
-- SELECT p.*, s.* FROM products p 
-- LEFT JOIN supply_chain_stages s ON p.id = s.product_id 
-- WHERE p.id = 'product-001';

-- Get products with verifications
-- SELECT p.*, v.* FROM products p 
-- LEFT JOIN verifications v ON p.id = v.product_id 
-- WHERE v.result = 'passed';