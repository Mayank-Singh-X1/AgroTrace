import sqlite3 from 'sqlite3';
import path from 'path';

const sqlite = sqlite3.verbose();
const dbPath = path.resolve('./sqlite.db');

console.log('🔍 Testing database connection...');

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Check if tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('❌ Error querying tables:', err);
  } else {
    console.log('📋 Tables found:', tables.map(t => t.name));
  }

  // Check users
  db.all("SELECT COUNT(*) as count FROM users", (err, result) => {
    if (err) {
      console.error('❌ Error counting users:', err);
    } else {
      console.log(`👥 Users: ${result[0].count}`);
    }

    // Check products
    db.all("SELECT COUNT(*) as count FROM products", (err, result) => {
      if (err) {
        console.error('❌ Error counting products:', err);
      } else {
        console.log(`📦 Products: ${result[0].count}`);
      }
      
      // If no data, insert some
      if (result[0].count === 0) {
        console.log('📝 No products found, inserting sample data...');
        
        // Insert sample user
        db.run(`
          INSERT OR REPLACE INTO users (
            id, email, first_name, last_name, role, company_name, 
            location, verification_status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'dev-farmer-1', 'farmer@example.com', 'John', 'Farmer', 'farmer',
          'Test Farm', 'Test Location', 'verified', 
          Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)
        ], function(err) {
          if (err) {
            console.error('❌ Error inserting user:', err);
          } else {
            console.log('✅ Inserted sample user');
          }
        });

        // Insert sample product
        db.run(`
          INSERT OR REPLACE INTO products (
            id, name, description, product_type, batch_number, quantity, unit,
            origin_farm_id, harvest_date, expiry_date, status, qr_code,
            created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'product-wheat-1', 'Organic Wheat', 'Premium organic wheat', 'Grain',
          'WHEAT-2024-001', 1500.0, 'kg', 'dev-farmer-1',
          Math.floor(new Date('2024-03-15').getTime() / 1000),
          Math.floor(new Date('2025-03-15').getTime() / 1000),
          'in_production', 'QR-WHEAT001', 'dev-farmer-1',
          Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)
        ], function(err) {
          if (err) {
            console.error('❌ Error inserting product:', err);
          } else {
            console.log('✅ Inserted sample product');
          }
          
          db.close(() => {
            console.log('🎉 Database test complete! Ready to start server.');
          });
        });
      } else {
        db.close(() => {
          console.log('🎉 Database has data! Ready to start server.');
        });
      }
    });
  });
});