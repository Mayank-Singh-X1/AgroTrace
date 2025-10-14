#!/usr/bin/env node

/**
 * Direct SQL insertion script using sqlite3 directly
 */

import sqlite3 from 'sqlite3';
import path from 'path';

const sqlite = sqlite3.verbose();
const dbPath = path.resolve('./sqlite.db');

const sampleData = {
  users: [
    {
      id: 'dev-farmer-1',
      email: 'farmer@example.com',
      firstName: 'John',
      lastName: 'Farmer',
      role: 'farmer',
      companyName: 'Test Farm',
      location: 'Test Location',
      verificationStatus: 'verified',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    },
    {
      id: 'inspector-1',
      email: 'inspector@example.com',
      firstName: 'Alice',
      lastName: 'Inspector',
      role: 'inspector',
      companyName: 'Quality Assurance',
      location: 'Quality Lab',
      verificationStatus: 'verified',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
  ],
  products: [
    {
      id: 'product-wheat-1',
      name: 'Organic Wheat',
      description: 'Premium organic wheat',
      productType: 'Grain',
      batchNumber: 'WHEAT-2024-001',
      quantity: 1500.0,
      unit: 'kg',
      originFarmId: 'dev-farmer-1',
      harvestDate: Math.floor(new Date('2024-03-15').getTime() / 1000),
      expiryDate: Math.floor(new Date('2025-03-15').getTime() / 1000),
      status: 'in_production',
      qrCode: 'QR-WHEAT001',
      createdBy: 'dev-farmer-1',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    },
    {
      id: 'product-apple-1',
      name: 'Red Apples',
      description: 'Fresh red apples',
      productType: 'Fruit',
      batchNumber: 'APPLE-2024-002',
      quantity: 800.5,
      unit: 'kg',
      originFarmId: 'dev-farmer-1',
      harvestDate: Math.floor(new Date('2024-03-20').getTime() / 1000),
      expiryDate: Math.floor(new Date('2024-04-20').getTime() / 1000),
      status: 'quality_check',
      qrCode: 'QR-APPLE002',
      createdBy: 'dev-farmer-1',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000)
    }
  ]
};

async function insertSampleData() {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to SQLite database');
    });

    db.serialize(() => {
      console.log('📝 Inserting sample data...');

      // Insert users
      const userInsert = db.prepare(`
        INSERT OR REPLACE INTO users (
          id, email, first_name, last_name, role, company_name, 
          location, verification_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleData.users.forEach(user => {
        userInsert.run(
          user.id, user.email, user.firstName, user.lastName, user.role,
          user.companyName, user.location, user.verificationStatus,
          user.createdAt, user.updatedAt
        );
        console.log(`   ✅ Added user: ${user.firstName} ${user.lastName} (${user.role})`);
      });
      userInsert.finalize();

      // Insert products
      const productInsert = db.prepare(`
        INSERT OR REPLACE INTO products (
          id, name, description, product_type, batch_number, quantity, unit,
          origin_farm_id, harvest_date, expiry_date, status, qr_code,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleData.products.forEach(product => {
        productInsert.run(
          product.id, product.name, product.description, product.productType,
          product.batchNumber, product.quantity, product.unit, product.originFarmId,
          product.harvestDate, product.expiryDate, product.status, product.qrCode,
          product.createdBy, product.createdAt, product.updatedAt
        );
        console.log(`   ✅ Added product: ${product.name} (${product.batchNumber})`);
      });
      productInsert.finalize();

      // Add a supply chain stage
      const stageInsert = db.prepare(`
        INSERT OR REPLACE INTO supply_chain_stages (
          id, product_id, stage_name, stage_type, handler_id, location,
          timestamp, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stageInsert.run(
        'stage-wheat-1',
        'product-wheat-1',
        'Farm Production',
        'production',
        'dev-farmer-1',
        'Test Farm Location',
        Math.floor(Date.now() / 1000),
        'Initial production stage',
        'completed'
      );
      console.log('   ✅ Added supply chain stage');
      stageInsert.finalize();

      // Add a verification
      const verificationInsert = db.prepare(`
        INSERT OR REPLACE INTO verifications (
          id, product_id, verifier_id, verification_type, result,
          notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      verificationInsert.run(
        'verification-wheat-1',
        'product-wheat-1',
        'inspector-1',
        'quality',
        'passed',
        'Meets quality standards',
        Math.floor(Date.now() / 1000)
      );
      console.log('   ✅ Added verification');
      verificationInsert.finalize();

      console.log('\n🎉 Sample data inserted successfully!');
      
      // Verify data
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
          console.error('Error counting users:', err);
        } else {
          console.log(`📊 Users in database: ${row.count}`);
        }
      });

      db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
          console.error('Error counting products:', err);
        } else {
          console.log(`📦 Products in database: ${row.count}`);
        }
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            console.log('✅ Database connection closed');
            resolve();
          }
        });
      });
    });
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  insertSampleData()
    .then(() => {
      console.log('\n🚀 Ready to test! You can now:');
      console.log('   1. Start the server: npm run dev');
      console.log('   2. Run tests: node scripts/test-system.js');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to insert sample data:', error);
      process.exit(1);
    });
}

export { insertSampleData };