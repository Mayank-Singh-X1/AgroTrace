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
import { db, sqliteDb } from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";

// Helper function to parse JSON stored as text in SQLite
function parseJsonField(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Error parsing JSON from SQLite:', e);
    return null;
  }
}

// Helper function to stringify JSON for SQLite storage
function stringifyJsonField(value: any) {
  if (!value) return null;
  try {
    return JSON.stringify(value);
  } catch (e) {
    console.error('Error stringifying JSON for SQLite:', e);
    return null;
  }
}
import { randomUUID } from "crypto";
import { qrCodeService } from './qrService';

export interface IStorage {
  // Database initialization
  initializeTables(): Promise<void>;
  
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getProducts(createdBy?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByBatchNumber(batchNumber: string): Promise<Product | undefined>;
  getProductsByStatus(status: string, createdBy?: string): Promise<Product[]>;
  getProductsByType(productType: string, createdBy?: string): Promise<Product[]>;
  getRecentProducts(limit?: number, createdBy?: string): Promise<Product[]>;
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
  searchProducts(query: string, filters?: {
    status?: string;
    productType?: string;
    createdBy?: string;
    location?: string;
  }): Promise<Product[]>;
  searchProductsAdvanced(searchParams: {
    query?: string;
    status?: string[];
    productTypes?: string[];
    harvestDateFrom?: Date;
    harvestDateTo?: Date;
    location?: string;
    verified?: boolean;
    limit?: number;
  }): Promise<Product[]>;
}

export class DatabaseStorage implements IStorage {
  // Initialize database tables if they don't exist
  async initializeTables(): Promise<void> {
    try {
      // This will create tables if they don't exist based on the schema
      console.log('Initializing database tables...');
      
      // Test connection by trying to query users table
      try {
        await db.select().from(users).limit(1);
        console.log('✅ Database tables are ready');
      } catch (error) {
        console.log('⚠️ Database tables may not exist, but schema should handle creation');
      }
      
      // Initialize sample data for development
      if (process.env.NODE_ENV === 'development') {
        await this.initializeSampleData();
      }
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }
  
  // Initialize sample data for development
  async initializeSampleData(): Promise<void> {
    try {
      console.log('Initializing sample data for development...');
      
      // Check if sample users already exist
      const existingUsers = await this.getAllUsers();
      if (existingUsers.length > 0) {
        console.log('✅ Sample data already exists, skipping initialization');
        return;
      }
      
      // Create sample users
      const sampleUsers = [
        {
          id: "dev-farmer-1",
          email: "farmer@example.com",
          firstName: "John",
          lastName: "Farmer",
          profileImageUrl: "https://ui-avatars.com/api/?name=John+Farmer&background=16a34a&color=ffffff",
          role: "farmer",
          companyName: "Green Acres Farm",
          location: "Farmville, CA",
          verificationStatus: "verified",
        },
        {
          id: "dev-distributor-1",
          email: "distributor@example.com",
          firstName: "Sarah",
          lastName: "Distribution",
          profileImageUrl: "https://ui-avatars.com/api/?name=Sarah+Distribution&background=2563eb&color=ffffff",
          role: "distributor",
          companyName: "FastTrack Logistics",
          location: "Los Angeles, CA",
          verificationStatus: "verified",
        },
        {
          id: "dev-retailer-1",
          email: "retailer@example.com",
          firstName: "Mike",
          lastName: "Store",
          profileImageUrl: "https://ui-avatars.com/api/?name=Mike+Store&background=dc2626&color=ffffff",
          role: "retailer",
          companyName: "Fresh Market Store",
          location: "San Francisco, CA",
          verificationStatus: "verified",
        },
        {
          id: "dev-inspector-1",
          email: "inspector@example.com",
          firstName: "Emma",
          lastName: "Inspector",
          profileImageUrl: "https://ui-avatars.com/api/?name=Emma+Inspector&background=7c3aed&color=ffffff",
          role: "inspector",
          companyName: "Quality Assurance Corp",
          location: "Sacramento, CA",
          verificationStatus: "verified",
        },
        {
          id: "dev-consumer-1",
          email: "consumer@example.com",
          firstName: "Alex",
          lastName: "Consumer",
          profileImageUrl: "https://ui-avatars.com/api/?name=Alex+Consumer&background=059669&color=ffffff",
          role: "consumer",
          companyName: null,
          location: "San Jose, CA",
          verificationStatus: "verified",
        }
      ];
      
      // Insert sample users
      for (const userData of sampleUsers) {
        await this.upsertUser(userData);
        console.log(`✅ Created sample user: ${userData.email} (${userData.role})`);
      }
      
      // Create some sample products for the farmer
      const sampleProducts = [
        {
          name: "Organic Tomatoes",
          description: "Fresh organic tomatoes grown using sustainable farming practices",
          productType: "vegetables",
          batchNumber: "TOM-2024-001",
          quantity: 100,
          unit: "kg",
          originFarmId: "dev-farmer-1",
          harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          status: "created",
          createdBy: "dev-farmer-1"
        },
        {
          name: "Fresh Apples",
          description: "Crisp and sweet apples from our family orchard",
          productType: "fruits",
          batchNumber: "APP-2024-002",
          quantity: 50,
          unit: "kg",
          originFarmId: "dev-farmer-1",
          harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: "in_production",
          createdBy: "dev-farmer-1"
        },
        {
          name: "Free-Range Eggs",
          description: "Farm-fresh eggs from free-range chickens",
          productType: "dairy",
          batchNumber: "EGG-2024-003",
          quantity: 24,
          unit: "dozen",
          originFarmId: "dev-farmer-1",
          harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          status: "quality_check",
          createdBy: "dev-farmer-1"
        }
      ];
      
      // Insert sample products
      for (const productData of sampleProducts) {
        try {
          const product = await this.createProduct(productData);
          console.log(`✅ Created sample product: ${product.name} (${product.batchNumber})`);
        } catch (error) {
          console.error(`❌ Failed to create sample product ${productData.name}:`, error);
        }
      }
      
      console.log('✅ Sample data initialization completed');
      
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
      // Don't throw the error - sample data is not critical
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    if (!id) {
      console.log("No user ID provided, returning undefined");
      return undefined;
    }
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }
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
    try {
      let query = db.select().from(products);
      
      if (createdBy) {
        query = query.where(eq(products.createdBy, createdBy));
      }
      
      const result = await query.orderBy(desc(products.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  async getProductsByStatus(status: string, createdBy?: string): Promise<Product[]> {
    try {
      let query = db.select().from(products).where(eq(products.status, status));
      
      if (createdBy) {
        query = query.where(and(eq(products.status, status), eq(products.createdBy, createdBy)));
      }
      
      return await query.orderBy(desc(products.createdAt));
    } catch (error) {
      console.error("Error fetching products by status:", error);
      return [];
    }
  }

  async getProductsByType(productType: string, createdBy?: string): Promise<Product[]> {
    try {
      let query = db.select().from(products).where(eq(products.productType, productType));
      
      if (createdBy) {
        query = query.where(and(eq(products.productType, productType), eq(products.createdBy, createdBy)));
      }
      
      return await query.orderBy(desc(products.createdAt));
    } catch (error) {
      console.error("Error fetching products by type:", error);
      return [];
    }
  }

  async getRecentProducts(limit: number = 10, createdBy?: string): Promise<Product[]> {
    try {
      let query = db.select().from(products);
      
      if (createdBy) {
        query = query.where(eq(products.createdBy, createdBy));
      }
      
      return await query.orderBy(desc(products.createdAt)).limit(limit);
    } catch (error) {
      console.error("Error fetching recent products:", error);
      return [];
    }
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
    // Generate a unique QR code identifier
    const qrCodeId = `QR-${randomUUID().slice(0, 8).toUpperCase()}`;
    
    // Create the product first
    const [newProduct] = await db
      .insert(products)
      .values({ ...product, qrCode: qrCodeId })
      .returning();
    
    try {
      // Get farmer information for QR code
      const farmer = await this.getUser(product.createdBy);
      const farmerName = farmer ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() : 'Unknown Farmer';
      
      // Generate QR code data and image
      const qrData = qrCodeService.generateQRData(newProduct, farmerName);
      const qrCodeImage = await qrCodeService.generateQRCode(qrData);
      
      console.log(`✅ Generated QR code for product ${newProduct.name} (${newProduct.batchNumber})`);
      
      // You could store the QR code image in a file system or cloud storage here
      // For now, we'll just log that it was generated
      
    } catch (qrError) {
      console.error('⚠️ Failed to generate QR code for product:', qrError);
      // Don't fail the product creation if QR generation fails
    }
    
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
    try {
      // For mock products, return mock supply chain stages
      if (productId.startsWith('mock-')) {
        console.log("Returning mock supply chain stages for mock product");
        return [
          {
            id: "mock-stage-1",
            productId: productId,
            stageName: "Farm Production",
            location: "Mock Farm, Country",
            timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            description: "Harvested and processed at the farm",
            handledBy: "Farmer John",
            verificationData: { method: "QR Code", verifier: "AgriCert", timestamp: new Date() },
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          {
            id: "mock-stage-2",
            productId: productId,
            stageName: "Quality Check",
            location: "Quality Lab, Country",
            timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
            description: "Passed quality inspection",
            handledBy: "Inspector Smith",
            verificationData: { method: "Lab Test", verifier: "QualityLabs", timestamp: new Date() },
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          },
          {
            id: "mock-stage-3",
            productId: productId,
            stageName: "Distribution",
            location: "Distribution Center, Country",
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            description: "Packaged and prepared for shipping",
            handledBy: "Logistics Manager",
            verificationData: { method: "Blockchain", verifier: "SupplyChainVerify", timestamp: new Date() },
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          }
        ];
      }
      
      try {
        const stages = await db
          .select()
          .from(supplyChainStages)
          .where(eq(supplyChainStages.productId, productId))
          .orderBy(supplyChainStages.timestamp);
        
        if (stages.length === 0) {
          console.log("No supply chain stages found, returning empty array");
          return [];
        }
        
        // Parse JSON fields
        return stages.map(stage => ({
          ...stage,
          verificationData: stage.verificationData ? parseJsonField(stage.verificationData as unknown as string) : null
        }));
      } catch (dbError) {
        console.error("Database error in getSupplyChainStages:", dbError);
        return [];
      }
    } catch (error) {
      console.error("Error in getSupplyChainStages:", error);
      return [];
    }
  }

  async addSupplyChainStage(stage: InsertSupplyChainStage): Promise<SupplyChainStage> {
    // Stringify JSON fields
    const preparedStage = {
      ...stage,
      verificationData: stage.verificationData ? stringifyJsonField(stage.verificationData) : null
    };
    
    const [newStage] = await db
      .insert(supplyChainStages)
      .values(preparedStage)
      .returning();
      
    return {
      ...newStage,
      verificationData: newStage.verificationData ? parseJsonField(newStage.verificationData as unknown as string) : null
    };
  }

  // Transaction operations
  async getTransactions(userId?: string): Promise<Transaction[]> {
    const query = db.select().from(transactions);
    
    let results;
    if (userId) {
      results = await query
        .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
        .orderBy(desc(transactions.createdAt));
    } else {
      results = await query.orderBy(desc(transactions.createdAt));
    }
    
    // Parse JSON fields
    return results.map(transaction => ({
      ...transaction,
      metadata: transaction.metadata ? parseJsonField(transaction.metadata as unknown as string) : null
    }));
  }

  async getProductTransactions(productId: string): Promise<Transaction[]> {
    const results = await db
      .select()
      .from(transactions)
      .where(eq(transactions.productId, productId))
      .orderBy(desc(transactions.createdAt));
      
    // Parse JSON fields
    return results.map(transaction => ({
      ...transaction,
      metadata: transaction.metadata ? parseJsonField(transaction.metadata as unknown as string) : null
    }));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    // Stringify JSON fields
    const preparedTransaction = {
      ...transaction,
      metadata: transaction.metadata ? stringifyJsonField(transaction.metadata) : null
    };
    
    const [newTransaction] = await db
      .insert(transactions)
      .values(preparedTransaction)
      .returning();
      
    return {
      ...newTransaction,
      metadata: newTransaction.metadata ? parseJsonField(newTransaction.metadata as unknown as string) : null
    };
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ 
        status: status, 
        updatedAt: Math.floor(Date.now() / 1000) // Unix timestamp for SQLite
      })
      .where(eq(transactions.id, id))
      .returning();
      
    return {
      ...updatedTransaction,
      metadata: updatedTransaction.metadata ? parseJsonField(updatedTransaction.metadata as unknown as string) : null
    };
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
    // For development environment, return mock stats if userId is undefined
    if (!userId) {
      console.log("No userId provided for getUserStats, returning mock data");
      return {
        activeProducts: 5,
        verifiedTransactions: 12,
        partners: 3,
        revenue: 15000.00
      };
    }
    
    try {
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
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        activeProducts: 0,
        verifiedTransactions: 0,
        partners: 0,
        revenue: 0
      };
    }

    try {
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
    } catch (error) {
      console.error("Error calculating user stats:", error);
      return {
        activeProducts: 0,
        verifiedTransactions: 0,
        partners: 0,
        revenue: 0
      };
    }
  }

  // Search operations
  async searchProducts(query: string, filters?: {
    status?: string;
    productType?: string;
    createdBy?: string;
    location?: string;
  }): Promise<Product[]> {
    try {
      let searchQuery = db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          productType: products.productType,
          batchNumber: products.batchNumber,
          quantity: products.quantity,
          unit: products.unit,
          originFarmId: products.originFarmId,
          harvestDate: products.harvestDate,
          expiryDate: products.expiryDate,
          status: products.status,
          qrCode: products.qrCode,
          createdBy: products.createdBy,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          farmerName: users.firstName,
          farmerLastName: users.lastName,
          farmLocation: users.location
        })
        .from(products)
        .leftJoin(users, eq(products.createdBy, users.id))
        .where(or(
          like(products.name, `%${query}%`),
          like(products.batchNumber, `%${query}%`),
          like(products.productType, `%${query}%`),
          like(products.description, `%${query}%`)
        ));

      // Apply filters if provided
      if (filters) {
        if (filters.status) {
          searchQuery = searchQuery.where(eq(products.status, filters.status));
        }
        if (filters.productType) {
          searchQuery = searchQuery.where(eq(products.productType, filters.productType));
        }
        if (filters.createdBy) {
          searchQuery = searchQuery.where(eq(products.createdBy, filters.createdBy));
        }
        if (filters.location) {
          searchQuery = searchQuery.where(like(users.location, `%${filters.location}%`));
        }
      }

      return await searchQuery.orderBy(desc(products.createdAt));
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  async searchProductsAdvanced(searchParams: {
    query?: string;
    status?: string[];
    productTypes?: string[];
    harvestDateFrom?: Date;
    harvestDateTo?: Date;
    location?: string;
    verified?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    try {
      let searchQuery = db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          productType: products.productType,
          batchNumber: products.batchNumber,
          quantity: products.quantity,
          unit: products.unit,
          originFarmId: products.originFarmId,
          harvestDate: products.harvestDate,
          expiryDate: products.expiryDate,
          status: products.status,
          qrCode: products.qrCode,
          createdBy: products.createdBy,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          farmerName: users.firstName,
          farmerLastName: users.lastName,
          farmLocation: users.location,
          hasVerification: verifications.id
        })
        .from(products)
        .leftJoin(users, eq(products.createdBy, users.id))
        .leftJoin(verifications, eq(products.id, verifications.productId));

      let conditions = [];

      if (searchParams.query) {
        conditions.push(or(
          like(products.name, `%${searchParams.query}%`),
          like(products.batchNumber, `%${searchParams.query}%`),
          like(products.productType, `%${searchParams.query}%`),
          like(products.description, `%${searchParams.query}%`)
        ));
      }

      if (searchParams.status && searchParams.status.length > 0) {
        const statusConditions = searchParams.status.map(s => eq(products.status, s));
        conditions.push(or(...statusConditions));
      }

      if (searchParams.productTypes && searchParams.productTypes.length > 0) {
        const typeConditions = searchParams.productTypes.map(t => eq(products.productType, t));
        conditions.push(or(...typeConditions));
      }

      if (searchParams.location) {
        conditions.push(like(users.location, `%${searchParams.location}%`));
      }

      if (conditions.length > 0) {
        searchQuery = searchQuery.where(and(...conditions));
      }

      const result = await searchQuery
        .orderBy(desc(products.createdAt))
        .limit(searchParams.limit || 50);

      return result;
    } catch (error) {
      console.error("Error in advanced product search:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
