import {
  users,
  products,
  supplyChainStages,
  transactions,
  verifications,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type SupplyChainStage,
  type InsertSupplyChainStage,
  type Transaction,
  type InsertTransaction,
  type Verification,
  type InsertVerification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getProducts(createdBy?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByBatchNumber(batchNumber: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  
  // Supply chain operations
  getSupplyChainStages(productId: string): Promise<SupplyChainStage[]>;
  addSupplyChainStage(stage: InsertSupplyChainStage): Promise<SupplyChainStage>;
  
  // Transaction operations
  getTransactions(userId?: string): Promise<Transaction[]>;
  getProductTransactions(productId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction>;
  
  // Verification operations
  getVerifications(productId: string): Promise<Verification[]>;
  createVerification(verification: InsertVerification): Promise<Verification>;
  
  // Analytics
  getUserStats(userId: string): Promise<{
    activeProducts: number;
    verifiedTransactions: number;
    partners: number;
    revenue: number;
  }>;
  
  // Search operations
  searchProducts(query: string): Promise<Product[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getProducts(createdBy?: string): Promise<Product[]> {
    const query = db.select().from(products);
    
    if (createdBy) {
      return await query.where(eq(products.createdBy, createdBy)).orderBy(desc(products.createdAt));
    }
    
    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductByBatchNumber(batchNumber: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.batchNumber, batchNumber));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const qrCode = `QR-${randomUUID().slice(0, 8).toUpperCase()}`;
    const [newProduct] = await db
      .insert(products)
      .values({ ...product, qrCode })
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  // Supply chain operations
  async getSupplyChainStages(productId: string): Promise<SupplyChainStage[]> {
    return await db
      .select()
      .from(supplyChainStages)
      .where(eq(supplyChainStages.productId, productId))
      .orderBy(supplyChainStages.timestamp);
  }

  async addSupplyChainStage(stage: InsertSupplyChainStage): Promise<SupplyChainStage> {
    const [newStage] = await db
      .insert(supplyChainStages)
      .values(stage)
      .returning();
    return newStage;
  }

  // Transaction operations
  async getTransactions(userId?: string): Promise<Transaction[]> {
    const query = db.select().from(transactions);
    
    if (userId) {
      return await query
        .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
        .orderBy(desc(transactions.createdAt));
    }
    
    return await query.orderBy(desc(transactions.createdAt));
  }

  async getProductTransactions(productId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.productId, productId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    const [updated] = await db
      .update(transactions)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updated;
  }

  // Verification operations
  async getVerifications(productId: string): Promise<Verification[]> {
    return await db
      .select()
      .from(verifications)
      .where(eq(verifications.productId, productId))
      .orderBy(desc(verifications.createdAt));
  }

  async createVerification(verification: InsertVerification): Promise<Verification> {
    const [newVerification] = await db
      .insert(verifications)
      .values(verification)
      .returning();
    return newVerification;
  }

  // Analytics
  async getUserStats(userId: string): Promise<{
    activeProducts: number;
    verifiedTransactions: number;
    partners: number;
    revenue: number;
  }> {
    // Get active products count
    const activeProductsResult = await db
      .select()
      .from(products)
      .where(and(
        eq(products.createdBy, userId),
        or(
          eq(products.status, 'in_production'),
          eq(products.status, 'quality_check'),
          eq(products.status, 'in_transit')
        )
      ));

    // Get verified transactions count
    const verifiedTransactionsResult = await db
      .select()
      .from(transactions)
      .where(and(
        or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)),
        eq(transactions.status, 'verified')
      ));

    // Get unique partners count
    const partnersFromResult = await db
      .select({ userId: transactions.toUserId })
      .from(transactions)
      .where(eq(transactions.fromUserId, userId));
    
    const partnersToResult = await db
      .select({ userId: transactions.fromUserId })
      .from(transactions)
      .where(eq(transactions.toUserId, userId));

    const uniquePartners = new Set([
      ...partnersFromResult.map(p => p.userId),
      ...partnersToResult.map(p => p.userId)
    ]);

    // Calculate revenue from completed sales
    const revenueResult = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.fromUserId, userId),
        eq(transactions.status, 'completed'),
        eq(transactions.transactionType, 'sale')
      ));

    const revenue = revenueResult.reduce((sum, tx) => sum + (parseFloat(tx.price || '0')), 0);

    return {
      activeProducts: activeProductsResult.length,
      verifiedTransactions: verifiedTransactionsResult.length,
      partners: uniquePartners.size,
      revenue: Math.round(revenue * 100) / 100,
    };
  }

  // Search operations
  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(or(
        like(products.name, `%${query}%`),
        like(products.batchNumber, `%${query}%`),
        like(products.productType, `%${query}%`)
      ))
      .orderBy(desc(products.createdAt));
  }
}

export const storage = new DatabaseStorage();
