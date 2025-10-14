#!/usr/bin/env node

/**
 * Script to add sample products to SQLite database for development
 * Run this script from the project root directory
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path (same as in server/db.ts)
const dbPath = path.resolve('./sqlite.db');

// SQL file path
const sqlFilePath = path.resolve('./sql/add_products.sql');

// Initialize sqlite3 with verbose mode
const sqlite = sqlite3.verbose();

async function addSampleProducts() {
  console.log('🌱 Adding sample products to Agri-Trace database...\n');

  // Check if SQL file exists
  if (!fs.existsSync(sqlFilePath)) {
    console.error('❌ SQL file not found:', sqlFilePath);
    process.exit(1);
  }

  // Read SQL file
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Split SQL content into statements (for SQLite, we only need the first part)
  const sqlStatements = sqlContent
    .split('-- ==================================================')[1] // Get SQLite section
    .split('\n')
    .filter(line => 
      line.trim() && 
      !line.trim().startsWith('--') && 
      !line.trim().startsWith('/*') &&
      !line.trim().includes('PostgreSQL')
    )
    .join('\n')
    .split(';')
    .filter(stmt => stmt.trim())
    .map(stmt => stmt.trim() + ';');

  const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
  });

  try {
    // Begin transaction
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('📝 Executing SQL statements...\n');

    // Execute each SQL statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      if (statement.length > 10) { // Skip very short statements
        try {
          await new Promise((resolve, reject) => {
            db.run(statement, function(err) {
              if (err) {
                // Log but don't fail on "already exists" errors
                if (err.message.includes('UNIQUE constraint failed') || 
                    err.message.includes('already exists')) {
                  console.log(`⚠️  Skipped: ${err.message.split('UNIQUE')[0].trim()}`);
                  resolve();
                } else {
                  reject(err);
                }
              } else {
                const action = statement.includes('INSERT') ? 
                  (this.changes > 0 ? `✅ Inserted ${this.changes} row(s)` : '⚠️  No changes') : 
                  '✅ Executed';
                console.log(`${action}: ${statement.substring(0, 50)}...`);
                resolve();
              }
            });
          });
        } catch (error) {
          console.error(`❌ Error executing statement: ${error.message}`);
          console.log(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('\n🎉 Sample products added successfully!');
    console.log('\n📊 Database Summary:');
    
    // Show summary
    const queries = [
      { name: 'Users', sql: 'SELECT COUNT(*) as count FROM users' },
      { name: 'Products', sql: 'SELECT COUNT(*) as count FROM products' },
      { name: 'Supply Chain Stages', sql: 'SELECT COUNT(*) as count FROM supply_chain_stages' },
      { name: 'Verifications', sql: 'SELECT COUNT(*) as count FROM verifications' }
    ];

    for (const query of queries) {
      try {
        const result = await new Promise((resolve, reject) => {
          db.get(query.sql, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        console.log(`   ${query.name}: ${result.count}`);
      } catch (error) {
        console.log(`   ${query.name}: Error getting count`);
      }
    }

    console.log('\n🚀 You can now start the development server and see the sample products!');
    console.log('   Run: npm run dev');

  } catch (error) {
    // Rollback on error
    await new Promise((resolve) => {
      db.run('ROLLBACK', () => resolve());
    });
    console.error('❌ Transaction failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  }
}

// Handle CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleProducts().catch(console.error);
}

export { addSampleProducts };
