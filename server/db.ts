import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from "@shared/schema";
import { resolve } from 'path';
import sqlite3 from 'sqlite3';

// Create a SQLite database connection
const dbPath = resolve('./sqlite.db');
const sqliteDb = new sqlite3.Database(dbPath);

// Create a proxy for drizzle to use with sqlite3
const runQuery = async (query: string, params: any[]) => {
  return new Promise((resolve, reject) => {
    if (query.trim().toLowerCase().startsWith('select')) {
      sqliteDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    } else {
      sqliteDb.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
};

// Initialize the database with drizzle
export const db = drizzle(runQuery, { schema });

// Export the sqlite instance for potential direct usage
export { sqliteDb };