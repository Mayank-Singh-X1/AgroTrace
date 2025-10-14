import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../database/storage";
import { setupAuth, isAuthenticated } from "../middleware/replitAuth";
import { insertProductSchema, insertSupplyChainStageSchema, insertTransactionSchema, insertVerificationSchema } from "@shared/schema";
import { qrCodeService } from "../services/qrService";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database tables
  try {
    await storage.initializeTables();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }

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
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
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
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
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
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user.id : req.user.claims.sub;
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
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
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
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
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

  // Enhanced search routes
  app.get('/api/search/products', async (req, res) => {
    try {
      const { q, status, productType, location, limit } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const filters = {
        status: status as string,
        productType: productType as string,
        location: location as string
      };
      
      const products = await storage.searchProducts(q, filters);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.post('/api/search/products/advanced', async (req, res) => {
    try {
      const searchParams = req.body;
      const products = await storage.searchProductsAdvanced(searchParams);
      res.json(products);
    } catch (error) {
      console.error("Error in advanced search:", error);
      res.status(500).json({ message: "Failed to perform advanced search" });
    }
  });

  // Role-based product routes
  app.get('/api/products/by-status/:status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.params;
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
      
      const user = userId ? await storage.getUser(userId) : null;
      const createdBy = user?.role === 'farmer' ? userId : undefined;
      
      const products = await storage.getProductsByStatus(status, createdBy);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by status:", error);
      res.status(500).json({ message: "Failed to fetch products by status" });
    }
  });

  app.get('/api/products/by-type/:productType', isAuthenticated, async (req: any, res) => {
    try {
      const { productType } = req.params;
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
      
      const user = userId ? await storage.getUser(userId) : null;
      const createdBy = user?.role === 'farmer' ? userId : undefined;
      
      const products = await storage.getProductsByType(productType, createdBy);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by type:", error);
      res.status(500).json({ message: "Failed to fetch products by type" });
    }
  });

  app.get('/api/products/recent', isAuthenticated, async (req: any, res) => {
    try {
      const { limit = 10 } = req.query;
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
      
      const user = userId ? await storage.getUser(userId) : null;
      const createdBy = user?.role === 'farmer' ? userId : undefined;
      
      const products = await storage.getRecentProducts(parseInt(limit as string), createdBy);
      res.json(products);
    } catch (error) {
      console.error("Error fetching recent products:", error);
      res.status(500).json({ message: "Failed to fetch recent products" });
    }
  });

  // QR Code routes
  app.get('/api/products/:id/qr', async (req, res) => {
    try {
      const { id } = req.params;
      const { format = 'png' } = req.query;
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const farmer = await storage.getUser(product.createdBy);
      const farmerName = farmer ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() : 'Unknown Farmer';
      
      const qrData = qrCodeService.generateQRData(product, farmerName);
      
      if (format === 'svg') {
        const qrCodeSVG = await qrCodeService.generateQRCodeSVG(qrData);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(qrCodeSVG);
      } else {
        const qrCodeImage = await qrCodeService.generateQRCode(qrData);
        // Return base64 data URL
        res.json({ qrCode: qrCodeImage, qrData });
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  app.get('/api/products/:id/qr/tracking', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const trackingQR = await qrCodeService.generateTrackingQR(product.batchNumber);
      res.json({ trackingQR, batchNumber: product.batchNumber });
    } catch (error) {
      console.error("Error generating tracking QR code:", error);
      res.status(500).json({ message: "Failed to generate tracking QR code" });
    }
  });

  app.get('/api/products/:id/label', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const farmer = await storage.getUser(product.createdBy);
      const farmerName = farmer ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() : 'Unknown Farmer';
      
      const qrData = qrCodeService.generateQRData(product, farmerName);
      const qrCodeImage = await qrCodeService.generateQRCode(qrData);
      const label = qrCodeService.generateProductLabel(product, qrData, qrCodeImage);
      
      res.json(label);
    } catch (error) {
      console.error("Error generating product label:", error);
      res.status(500).json({ message: "Failed to generate product label" });
    }
  });

  app.post('/api/qr/parse', async (req, res) => {
    try {
      const { qrContent } = req.body;
      
      if (!qrContent) {
        return res.status(400).json({ message: "QR content is required" });
      }

      const qrData = qrCodeService.parseQRCode(qrContent);
      if (!qrData) {
        return res.status(400).json({ message: "Invalid QR code format" });
      }

      res.json({ success: true, qrData });
    } catch (error) {
      console.error("Error parsing QR code:", error);
      res.status(500).json({ message: "Failed to parse QR code" });
    }
  });

  // Test QR generation endpoint (JSON)
  app.get('/api/qr/test', async (req, res) => {
    try {
      // Get the first available product
      const products = await storage.getProducts();
      if (products.length === 0) {
        return res.status(404).json({ message: "No products available to generate QR code" });
      }

      const product = products[0];
      const farmer = await storage.getUser(product.createdBy);
      const farmerName = farmer ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() : 'Unknown Farmer';
      
      const qrData = qrCodeService.generateQRData(product, farmerName);
      const qrCodeImage = await qrCodeService.generateQRCode(qrData);
      
      res.json({ 
        message: "QR Code generated successfully!", 
        productName: product.name,
        batchNumber: product.batchNumber,
        qrCode: qrCodeImage, 
        qrData,
        instructions: "Copy the qrCode value (base64 data URL) and paste it in an HTML img tag or save it as an image file."
      });
    } catch (error) {
      console.error("Error generating test QR code:", error);
      res.status(500).json({ message: "Failed to generate test QR code", error: error.message });
    }
  });

  // Visual QR code display endpoint (HTML)
  app.get('/qr/test', async (req, res) => {
    try {
      // Get the first available product
      const products = await storage.getProducts();
      if (products.length === 0) {
        return res.status(404).send(`
          <html>
            <head><title>No Products Available</title></head>
            <body>
              <h1>No Products Available</h1>
              <p>Create a product first to generate QR codes.</p>
            </body>
          </html>
        `);
      }

      const product = products[0];
      const farmer = await storage.getUser(product.createdBy);
      const farmerName = farmer ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() : 'Unknown Farmer';
      
      const qrData = qrCodeService.generateQRData(product, farmerName);
      const qrCodeImage = await qrCodeService.generateQRCode(qrData);
      
      res.send(`
        <html>
          <head>
            <title>QR Code Test - ${product.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .qr-container { text-align: center; margin: 20px 0; }
              .product-info { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .instructions { background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 8px; }
            </style>
          </head>
          <body>
            <h1>🏷️ QR Code Generated Successfully!</h1>
            
            <div class="product-info">
              <h3>Product Information</h3>
              <p><strong>Name:</strong> ${product.name}</p>
              <p><strong>Batch Number:</strong> ${product.batchNumber}</p>
              <p><strong>Farmer:</strong> ${farmerName}</p>
              <p><strong>Status:</strong> ${product.status}</p>
            </div>
            
            <div class="qr-container">
              <h3>QR Code</h3>
              <img src="${qrCodeImage}" alt="QR Code for ${product.name}" style="border: 1px solid #ddd; padding: 10px;" />
            </div>
            
            <div class="instructions">
              <h3>📱 How to Use</h3>
              <ul>
                <li>Scan this QR code with any QR reader app</li>
                <li>Or visit: <a href="/api/lookup/${product.batchNumber}">/api/lookup/${product.batchNumber}</a></li>
                <li>Or visit: <a href="/track/${product.batchNumber}">/track/${product.batchNumber}</a></li>
              </ul>
            </div>
            
            <div class="instructions">
              <h3>🔗 API Endpoints</h3>
              <ul>
                <li><a href="/api/products/${product.id}/qr">Get QR Code (JSON)</a></li>
                <li><a href="/api/products/${product.id}/qr?format=svg">Get QR Code (SVG)</a></li>
                <li><a href="/api/products/${product.id}/qr/tracking">Get Tracking QR</a></li>
                <li><a href="/api/products/${product.id}/label">Get Product Label</a></li>
              </ul>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error generating visual QR code:", error);
      res.status(500).send(`
        <html>
          <head><title>QR Generation Error</title></head>
          <body>
            <h1>❌ QR Generation Error</h1>
            <p>Error: ${error.message}</p>
          </body>
        </html>
      `);
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const isDevelopment = process.env.NODE_ENV === "development";
      const userId = isDevelopment ? req.user?.id : req.user?.claims?.sub;
      const user = userId ? await storage.getUser(userId) : null;
      
      // Only allow inspectors and admins to see all users
      if (!user || !['inspector', 'admin'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/users/role/:role', isAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.params;
      const users = await storage.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      res.status(500).json({ message: "Failed to fetch users by role" });
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
      const [supplyChain, verifications, transactions, farmer] = await Promise.all([
        storage.getSupplyChainStages(product.id),
        storage.getVerifications(product.id),
        storage.getProductTransactions(product.id),
        storage.getUser(product.createdBy)
      ]);

      // Generate QR data for consumer lookup
      const farmerName = farmer ? `${farmer.firstName || ''} ${farmer.lastName || ''}`.trim() : 'Unknown Farmer';
      const qrData = qrCodeService.generateQRData(product, farmerName);

      res.json({
        product,
        farmer: farmer ? {
          name: farmerName,
          location: farmer.location,
          companyName: farmer.companyName
        } : null,
        supplyChain,
        verifications,
        transactions: transactions.filter(tx => tx.status === 'verified' || tx.status === 'completed'),
        qrData
      });
    } catch (error) {
      console.error("Error in product lookup:", error);
      res.status(500).json({ message: "Failed to lookup product" });
    }
  });

  // Public tracking routes for consumers
  app.get('/track/:batchNumber', async (req, res) => {
    try {
      const { batchNumber } = req.params;
      const product = await storage.getProductByBatchNumber(batchNumber);
      
      if (!product) {
        return res.status(404).send(`
          <html>
            <head><title>Product Not Found</title></head>
            <body>
              <h1>Product Not Found</h1>
              <p>No product found with batch number: ${batchNumber}</p>
            </body>
          </html>
        `);
      }

      // Redirect to frontend with product data
      res.redirect(`/?track=${batchNumber}`);
    } catch (error) {
      console.error("Error in tracking route:", error);
      res.status(500).send('Error tracking product');
    }
  });

  app.get('/verify/:batchNumber', async (req, res) => {
    try {
      const { batchNumber } = req.params;
      const product = await storage.getProductByBatchNumber(batchNumber);
      
      if (!product) {
        return res.status(404).send(`
          <html>
            <head><title>Product Not Found</title></head>
            <body>
              <h1>Product Not Found</h1>
              <p>No product found with batch number: ${batchNumber}</p>
            </body>
          </html>
        `);
      }

      // Redirect to frontend verification page
      res.redirect(`/?verify=${batchNumber}`);
    } catch (error) {
      console.error("Error in verification route:", error);
      res.status(500).send('Error verifying product');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
