# Agri-Trace Database SQL

This directory contains SQL files for managing the Agri-Trace database, including scripts to add sample products and manage the database schema.

## Files Overview

### `add_products.sql`
Contains comprehensive SQL statements for adding sample products to both SQLite (development) and PostgreSQL (production) databases. This includes:

- **Sample Users**: Farmers and inspectors
- **Sample Products**: 5 different agricultural products with realistic data
- **Supply Chain Stages**: Tracking information for each product
- **Verification Records**: Quality and certification data
- **Templates**: For adding new products manually

## Quick Start

### For Development (SQLite)

**Option 1: Using the Node.js Script (Recommended)**
```bash
# From the project root directory
node scripts/add-sample-products.js
```

**Option 2: Using SQLite CLI**
```bash
# Open SQLite database
sqlite3 sqlite.db

# Execute the SQLite portion of the SQL file
.read sql/add_products.sql

# Check the results
SELECT COUNT(*) FROM products;
.quit
```

### For Production (PostgreSQL)

```bash
# Connect to your PostgreSQL database
psql -h your-host -U your-username -d your-database

# Execute the PostgreSQL portion
\i sql/add_products.sql

# Check the results
SELECT COUNT(*) FROM products;
\q
```

## Sample Data Included

### Users (Farmers & Inspectors)
- **John Smith** - Green Valley Farm (Iowa, USA)
- **Mary Green** - Organic Harvest Co. (California, USA) 
- **David Field** - Field Fresh Farms (Texas, USA)
- **Alice Johnson** - AgriCert Inspections (Inspector)

### Products
1. **Premium Organic Wheat** - 1,500 kg
2. **Red Delicious Apples** - 800.5 kg
3. **Vine-Ripened Tomatoes** - 600.75 kg
4. **Sweet Corn** - 1,200 kg
5. **Organic Soybeans** - 2,000.25 kg

### Product Statuses
- `created` - Initial state
- `in_production` - Being processed
- `quality_check` - Under inspection
- `in_transit` - Being transported
- `delivered` - Delivered to destination
- `sold` - Final state

## Database Schema

The SQL works with the following tables:
- `users` - User accounts (farmers, distributors, retailers, consumers, inspectors)
- `products` - Agricultural products
- `supply_chain_stages` - Tracking stages for each product
- `transactions` - Product transfers and sales
- `verifications` - Quality and certification records
- `sessions` - User session management

## Adding New Products

### Using the API (Recommended)
```bash
# POST to the products endpoint
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Product Name",
    "description": "Product description",
    "productType": "Grain|Fruit|Vegetable|Legume|Dairy|Meat",
    "batchNumber": "UNIQUE-BATCH-001",
    "quantity": 100.00,
    "unit": "kg",
    "harvestDate": "2024-03-01T00:00:00Z",
    "expiryDate": "2024-06-01T00:00:00Z"
  }'
```

### Using SQL Templates
Use the commented templates in `add_products.sql`:

**SQLite:**
```sql
INSERT OR IGNORE INTO products (
  id, name, description, product_type, batch_number, quantity, unit, 
  origin_farm_id, harvest_date, expiry_date, status, qr_code, created_by, 
  created_at, updated_at
)
VALUES 
  ('your-product-id', 'Product Name', 'Description', 'Type', 'BATCH-001', 100.00, 'kg', 'farmer-id', datetime('2024-03-01'), datetime('2024-06-01'), 'created', 'QR-CODE', 'farmer-id', datetime('now'), datetime('now'));
```

**PostgreSQL:**
```sql
INSERT INTO products (
  id, name, description, product_type, batch_number, quantity, unit, 
  origin_farm_id, harvest_date, expiry_date, status, qr_code, created_by, 
  created_at, updated_at
)
VALUES 
  ('your-product-id', 'Product Name', 'Description', 'Type', 'BATCH-001', 100.00, 'kg', 'farmer-id', '2024-03-01'::timestamp, '2024-06-01'::timestamp, 'created', 'QR-CODE', 'farmer-id', NOW(), NOW())
ON CONFLICT (batch_number) DO NOTHING;
```

## Useful Queries

### View All Products
```sql
SELECT * FROM products ORDER BY created_at DESC;
```

### View Products by Farmer
```sql
SELECT * FROM products WHERE created_by = 'farmer-001';
```

### View Products by Status
```sql
SELECT * FROM products WHERE status = 'in_production';
```

### View Product with Supply Chain
```sql
SELECT p.*, s.* FROM products p 
LEFT JOIN supply_chain_stages s ON p.id = s.product_id 
WHERE p.id = 'product-001';
```

### View Verified Products
```sql
SELECT p.*, v.* FROM products p 
LEFT JOIN verifications v ON p.id = v.product_id 
WHERE v.result = 'passed';
```

## Troubleshooting

### Common Issues

1. **Database not found**
   - Make sure you're running the commands from the project root
   - Check that `sqlite.db` exists (run migrations first)

2. **Permission denied**
   - Make sure the script is executable: `chmod +x scripts/add-sample-products.js`
   - Use `node` instead of direct execution if needed

3. **Duplicate key errors**
   - The SQL uses `INSERT OR IGNORE` (SQLite) and `ON CONFLICT DO NOTHING` (PostgreSQL)
   - These errors are expected and handled gracefully

4. **Foreign key constraint errors**
   - Make sure users exist before adding products
   - The SQL file creates users first, then products

## Development Tips

1. **Reset Database**: Delete `sqlite.db` and run migrations to start fresh
2. **Backup**: Copy `sqlite.db` before running scripts
3. **Testing**: Use different batch numbers for testing to avoid conflicts
4. **Production**: Always test SQL on a staging environment first

## Contributing

When adding new SQL files:
1. Include both SQLite and PostgreSQL versions
2. Use transactions for data integrity
3. Handle conflicts gracefully
4. Add comments explaining the purpose
5. Update this README with new functionality