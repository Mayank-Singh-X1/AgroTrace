import { sql } from 'drizzle-orm';
import {
  index,
  sqliteTable,
  text,
  integer,
  real,
  blob,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // Store JSON as text in SQLite
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// For SQLite, we'll use text fields instead of enums
// These are the valid values for reference
export const USER_ROLES = ['farmer', 'distributor', 'retailer', 'consumer', 'inspector'] as const;
export type UserRole = typeof USER_ROLES[number];

export const PRODUCT_STATUSES = ['created', 'in_production', 'quality_check', 'in_transit', 'delivered', 'sold'] as const;
export type ProductStatus = typeof PRODUCT_STATUSES[number];

export const TRANSACTION_STATUSES = ['pending', 'verified', 'completed', 'rejected'] as const;
export type TransactionStatus = typeof TRANSACTION_STATUSES[number];

// Users table for Replit Auth
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().default('consumer'),
  companyName: text("company_name"),
  location: text("location"),
  verificationStatus: text("verification_status").default('pending'),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Products table
export const products = sqliteTable("products", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description"),
  productType: text("product_type").notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  originFarmId: text("origin_farm_id").notNull(),
  harvestDate: integer("harvest_date", { mode: 'timestamp' }),
  expiryDate: integer("expiry_date", { mode: 'timestamp' }),
  status: text("status").notNull().default('created'),
  qrCode: text("qr_code").unique(),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Supply chain stages table
export const supplyChainStages = sqliteTable("supply_chain_stages", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  productId: text("product_id").notNull(),
  stageName: text("stage_name").notNull(),
  stageType: text("stage_type").notNull(), // production, inspection, transport, retail
  handlerId: text("handler_id").notNull(),
  location: text("location"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  notes: text("notes"),
  verificationData: text("verification_data"), // Store JSON as text in SQLite
  status: text("status").default('completed'),
});

// Transactions table
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  productId: text("product_id").notNull(),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  transactionType: text("transaction_type").notNull(), // transfer, sale, inspection
  quantity: real("quantity").notNull(),
  price: real("price"),
  currency: text("currency").default('USD'),
  status: text("status").notNull().default('pending'),
  blockchainHash: text("blockchain_hash"), // For future blockchain integration
  verificationSignature: text("verification_signature"),
  metadata: text("metadata"), // Store JSON as text in SQLite
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Verifications table
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  productId: text("product_id").notNull(),
  verifierId: text("verifier_id").notNull(),
  verificationType: text("verification_type").notNull(), // quality, organic, safety
  result: text("result").notNull(), // passed, failed, conditional
  certificateUrl: text("certificate_url"),
  notes: text("notes"),
  validUntil: integer("valid_until", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  createdProducts: many(products, { relationName: "createdProducts" }),
  fromTransactions: many(transactions, { relationName: "fromTransactions" }),
  toTransactions: many(transactions, { relationName: "toTransactions" }),
  supplyChainStages: many(supplyChainStages),
  verifications: many(verifications),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id],
    relationName: "createdProducts",
  }),
  supplyChainStages: many(supplyChainStages),
  transactions: many(transactions),
  verifications: many(verifications),
}));

export const supplyChainStagesRelations = relations(supplyChainStages, ({ one }) => ({
  product: one(products, {
    fields: [supplyChainStages.productId],
    references: [products.id],
  }),
  handler: one(users, {
    fields: [supplyChainStages.handlerId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  product: one(products, {
    fields: [transactions.productId],
    references: [products.id],
  }),
  fromUser: one(users, {
    fields: [transactions.fromUserId],
    references: [users.id],
    relationName: "fromTransactions",
  }),
  toUser: one(users, {
    fields: [transactions.toUserId],
    references: [users.id],
    relationName: "toTransactions",
  }),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  product: one(products, {
    fields: [verifications.productId],
    references: [products.id],
  }),
  verifier: one(users, {
    fields: [verifications.verifierId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  qrCode: true,
});

export const insertSupplyChainStageSchema = createInsertSchema(supplyChainStages).omit({
  id: true,
  timestamp: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  blockchainHash: true,
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertSupplyChainStage = z.infer<typeof insertSupplyChainStageSchema>;
export type SupplyChainStage = typeof supplyChainStages.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;
