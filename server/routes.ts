import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProductSchema, insertSupplyChainStageSchema, insertTransactionSchema, insertVerificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // In development, use the user ID directly from req.user
      // In production, get it from claims.sub
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user.id : req.user.claims.sub;
      
      if (isDevelopment && req.user) {
        // In development, return the mock user directly
        return res.json(req.user);
      }
      
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product routes
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      // In development mode, handle the case when req.user might be undefined
      const isDevelopment = process.env.NODE_ENV === "development";
      
      if (isDevelopment) {
        // For development, if req.user is undefined or doesn't have an id, return all products
        if (!req.user || !req.user.id) {
          console.log("No user found in request, returning all products");
          const products = await storage.getProducts();
          return res.json(products);
        }
        
        // If we have a user, proceed normally
        const userId = req.user.id;
        const user = await storage.getUser(userId);
        
        // If farmer, show only their products. Others can see all
        const products = user?.role === 'farmer' 
          ? await storage.getProducts(userId)
          : await storage.getProducts();
        
        return res.json(products);
      } else {
        // Production mode
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        
        // If farmer, show only their products. Others can see all
        const products = user?.role === 'farmer' 
          ? await storage.getProducts(userId)
          : await storage.getProducts();
        
        return res.json(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get('/api/products/batch/:batchNumber', async (req, res) => {
    try {
      const product = await storage.getProductByBatchNumber(req.params.batchNumber);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'farmer') {
        return res.status(403).json({ message: "Only farmers can create products" });
      }

      const productData = insertProductSchema.parse({
        ...req.body,
        createdBy: userId,
        originFarmId: userId,
      });

      const product = await storage.createProduct(productData);
      
      // Add initial supply chain stage
      await storage.addSupplyChainStage({
        productId: product.id,
        stageName: "Farm Production",
        stageType: "production",
        handlerId: userId,
        location: user.location || "Farm Location",
        notes: "Product created and registered on farm",
        status: "completed",
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Supply chain routes
  app.get('/api/products/:id/supply-chain', async (req, res) => {
    try {
      const stages = await storage.getSupplyChainStages(req.params.id);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching supply chain:", error);
      res.status(500).json({ message: "Failed to fetch supply chain" });
    }
  });

  app.post('/api/products/:id/supply-chain', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stageData = insertSupplyChainStageSchema.parse({
        ...req.body,
        productId: req.params.id,
        handlerId: userId,
      });

      const stage = await storage.addSupplyChainStage(stageData);
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error adding supply chain stage:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add supply chain stage" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/products/:id/transactions', async (req, res) => {
    try {
      const transactions = await storage.getProductTransactions(req.params.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching product transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        fromUserId: userId,
      });

      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch('/api/transactions/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const transaction = await storage.updateTransactionStatus(req.params.id, status);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Verification routes
  app.get('/api/products/:id/verifications', async (req, res) => {
    try {
      const verifications = await storage.getVerifications(req.params.id);
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ message: "Failed to fetch verifications" });
    }
  });

  app.post('/api/products/:id/verifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'inspector') {
        return res.status(403).json({ message: "Only inspectors can create verifications" });
      }

      const verificationData = insertVerificationSchema.parse({
        ...req.body,
        productId: req.params.id,
        verifierId: userId,
      });

      const verification = await storage.createVerification(verificationData);
      res.status(201).json(verification);
    } catch (error) {
      console.error("Error creating verification:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid verification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create verification" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      // In development, use the user ID directly from req.user
      // In production, get it from claims.sub
      const isDevelopment = process.env.NODE_ENV === "development";
      let userId;
      
      if (isDevelopment) {
        // Handle case where req.user might be undefined in development
        userId = req.user?.id;
      } else {
        userId = req.user?.claims?.sub;
      }
      
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Search routes
  app.get('/api/search/products', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const products = await storage.searchProducts(q);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Consumer lookup route (public)
  app.get('/api/lookup/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // Try to find by batch number first, then by product ID
      let product = await storage.getProductByBatchNumber(identifier);
      if (!product) {
        product = await storage.getProduct(identifier);
      }
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Get full supply chain and verification data
      const [supplyChain, verifications, transactions] = await Promise.all([
        storage.getSupplyChainStages(product.id),
        storage.getVerifications(product.id),
        storage.getProductTransactions(product.id),
      ]);

      res.json({
        product,
        supplyChain,
        verifications,
        transactions: transactions.filter(tx => tx.status === 'verified' || tx.status === 'completed'),
      });
    } catch (error) {
      console.error("Error in product lookup:", error);
      res.status(500).json({ message: "Failed to lookup product" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
