import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['farmer', 'distributor', 'retailer', 'consumer', 'inspector']);

// Product status enum
export const productStatusEnum = pgEnum('product_status', ['created', 'in_production', 'quality_check', 'in_transit', 'delivered', 'sold']);

// Transaction status enum
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'verified', 'completed', 'rejected']);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default('consumer'),
  companyName: varchar("company_name"),
  location: varchar("location"),
  verificationStatus: varchar("verification_status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  productType: varchar("product_type").notNull(),
  batchNumber: varchar("batch_number").notNull().unique(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(),
  originFarmId: varchar("origin_farm_id").notNull(),
  harvestDate: timestamp("harvest_date"),
  expiryDate: timestamp("expiry_date"),
  status: productStatusEnum("status").notNull().default('created'),
  qrCode: varchar("qr_code").unique(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supply chain stages table
export const supplyChainStages = pgTable("supply_chain_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  stageName: varchar("stage_name").notNull(),
  stageType: varchar("stage_type").notNull(), // production, inspection, transport, retail
  handlerId: varchar("handler_id").notNull(),
  location: varchar("location"),
  timestamp: timestamp("timestamp").defaultNow(),
  notes: text("notes"),
  verificationData: jsonb("verification_data"),
  status: varchar("status").default('completed'),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  transactionType: varchar("transaction_type").notNull(), // transfer, sale, inspection
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default('USD'),
  status: transactionStatusEnum("status").notNull().default('pending'),
  blockchainHash: varchar("blockchain_hash"), // For future blockchain integration
  verificationSignature: text("verification_signature"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verifications table
export const verifications = pgTable("verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  verifierId: varchar("verifier_id").notNull(),
  verificationType: varchar("verification_type").notNull(), // quality, organic, safety
  result: varchar("result").notNull(), // passed, failed, conditional
  certificateUrl: varchar("certificate_url"),
  notes: text("notes"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
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
