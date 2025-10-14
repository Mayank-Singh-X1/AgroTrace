import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import { resolve } from 'path';
import Database from 'better-sqlite3';

// Create a SQLite database connection using better-sqlite3
const dbPath = resolve('./sqlite.db');
const sqliteDb = new Database(dbPath);

// Enable WAL mode for better concurrency
sqliteDb.pragma('journal_mode = WAL');

// Initialize the database with drizzle
export const db = drizzle(sqliteDb, { schema });

// Create tables if they don't exist
const createTables = () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      role TEXT NOT NULL DEFAULT 'consumer',
      company_name TEXT,
      location TEXT,
      verification_status TEXT DEFAULT 'pending',
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `;
  
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      description TEXT,
      product_type TEXT NOT NULL,
      batch_number TEXT NOT NULL UNIQUE,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      origin_farm_id TEXT NOT NULL,
      harvest_date INTEGER,
      expiry_date INTEGER,
      status TEXT NOT NULL DEFAULT 'created',
      qr_code TEXT UNIQUE,
      created_by TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `;
  
  const createSupplyChainStagesTable = `
    CREATE TABLE IF NOT EXISTS supply_chain_stages (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      product_id TEXT NOT NULL,
      stage_name TEXT NOT NULL,
      stage_type TEXT NOT NULL,
      handler_id TEXT NOT NULL,
      location TEXT,
      timestamp INTEGER DEFAULT (unixepoch()),
      notes TEXT,
      verification_data TEXT,
      status TEXT DEFAULT 'completed'
    )
  `;
  
  const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      product_id TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      price REAL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending',
      blockchain_hash TEXT,
      verification_signature TEXT,
      metadata TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `;
  
  const createVerificationsTable = `
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      product_id TEXT NOT NULL,
      verifier_id TEXT NOT NULL,
      verification_type TEXT NOT NULL,
      result TEXT NOT NULL,
      certificate_url TEXT,
      notes TEXT,
      valid_until INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `;
  
  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire INTEGER NOT NULL
    )
  `;
  
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire)',
  ];
  
  // Execute table creation
  [createUsersTable, createProductsTable, createSupplyChainStagesTable, 
   createTransactionsTable, createVerificationsTable, createSessionsTable, 
   ...createIndexes].forEach(sql => {
    try {
      sqliteDb.exec(sql);
    } catch (err) {
      console.error('Error creating table/index:', err);
    }
  });
};

// Create tables on startup
createTables();

// Export the sqlite instance for potential direct usage
export { sqliteDb };
