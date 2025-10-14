#!/usr/bin/env node

/**
 * Setup sample data for Agri-Trace development
 * This script adds sample users and products directly via the storage layer
 */

import { storage } from '../server/storage.ts';

const sampleUsers = [
  {
    id: 'farmer-001',
    email: 'john.farmer@example.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'farmer',
    companyName: 'Green Valley Farm',
    location: 'Iowa, USA',
    verificationStatus: 'verified'
  },
  {
    id: 'farmer-002',
    email: 'mary.green@example.com',
    firstName: 'Mary',
    lastName: 'Green',
    role: 'farmer',
    companyName: 'Organic Harvest Co.',
    location: 'California, USA',
    verificationStatus: 'verified'
  },
  {
    id: 'farmer-003',
    email: 'david.field@example.com',
    firstName: 'David',
    lastName: 'Field',
    role: 'farmer',
    companyName: 'Field Fresh Farms',
    location: 'Texas, USA',
    verificationStatus: 'verified'
  },
  {
    id: 'inspector-001',
    email: 'alice.inspector@certify.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'inspector',
    companyName: 'AgriCert Inspections',
    location: 'National Office',
    verificationStatus: 'verified'
  },
  {
    id: 'distributor-001',
    email: 'bob.distributor@logistics.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'distributor',
    companyName: 'Fresh Logistics Inc.',
    location: 'Illinois, USA',
    verificationStatus: 'verified'
  },
  {
    id: 'retailer-001',
    email: 'carol.retailer@market.com',
    firstName: 'Carol',
    lastName: 'Davis',
    role: 'retailer',
    companyName: 'Fresh Market Chain',
    location: 'New York, USA',
    verificationStatus: 'verified'
  }
];

const sampleProducts = [
  {
    name: 'Premium Organic Wheat',
    description: 'High-quality organic wheat grown without pesticides',
    productType: 'Grain',
    batchNumber: 'WHEAT-2024-001',
    quantity: 1500.00,
    unit: 'kg',
    originFarmId: 'farmer-001',
    harvestDate: new Date('2024-03-15'),
    expiryDate: new Date('2025-03-15'),
    status: 'in_production',
    createdBy: 'farmer-001'
  },
  {
    name: 'Red Delicious Apples',
    description: 'Crispy and sweet red delicious apples',
    productType: 'Fruit',
    batchNumber: 'APPLE-2024-002',
    quantity: 800.50,
    unit: 'kg',
    originFarmId: 'farmer-002',
    harvestDate: new Date('2024-03-20'),
    expiryDate: new Date('2024-04-20'),
    status: 'quality_check',
    createdBy: 'farmer-002'
  },
  {
    name: 'Vine-Ripened Tomatoes',
    description: 'Fresh organic tomatoes ripened on the vine',
    productType: 'Vegetable',
    batchNumber: 'TOMATO-2024-003',
    quantity: 600.75,
    unit: 'kg',
    originFarmId: 'farmer-003',
    harvestDate: new Date('2024-03-18'),
    expiryDate: new Date('2024-04-08'),
    status: 'in_transit',
    createdBy: 'farmer-003'
  },
  {
    name: 'Sweet Corn',
    description: 'Non-GMO sweet corn perfect for fresh consumption',
    productType: 'Vegetable',
    batchNumber: 'CORN-2024-004',
    quantity: 1200.00,
    unit: 'kg',
    originFarmId: 'farmer-001',
    harvestDate: new Date('2024-03-10'),
    expiryDate: new Date('2024-04-10'),
    status: 'delivered',
    createdBy: 'farmer-001'
  },
  {
    name: 'Organic Soybeans',
    description: 'Premium organic soybeans for processing',
    productType: 'Legume',
    batchNumber: 'SOY-2024-005',
    quantity: 2000.25,
    unit: 'kg',
    originFarmId: 'farmer-002',
    harvestDate: new Date('2024-03-05'),
    expiryDate: new Date('2025-03-05'),
    status: 'created',
    createdBy: 'farmer-002'
  }
];

const sampleSupplyChainStages = [
  // Wheat supply chain stages
  {
    productId: 'wheat-product-id', // Will be updated with actual product ID
    stageName: 'Farm Production',
    stageType: 'production',
    handlerId: 'farmer-001',
    location: 'Green Valley Farm, Iowa',
    notes: 'Seeds planted and harvested',
    verificationData: JSON.stringify({ method: 'Organic Certification', verifier: 'USDA Organic' }),
    status: 'completed'
  },
  {
    productId: 'wheat-product-id',
    stageName: 'Quality Inspection',
    stageType: 'inspection',
    handlerId: 'inspector-001',
    location: 'Farm Quality Lab',
    notes: 'Passed organic standards test',
    verificationData: JSON.stringify({ test_results: 'Grade A', moisture_content: '12%' }),
    status: 'completed'
  }
];

async function setupSampleData() {
  console.log('🌱 Setting up sample data for Agri-Trace...\n');

  try {
    // Initialize database
    await storage.initializeTables();
    console.log('✅ Database initialized successfully\n');

    // Add sample users
    console.log('👥 Adding sample users...');
    const addedUsers = [];
    for (const user of sampleUsers) {
      try {
        const addedUser = await storage.upsertUser(user);
        addedUsers.push(addedUser);
        console.log(`   ✅ Added ${user.role}: ${user.firstName} ${user.lastName}`);
      } catch (error) {
        console.log(`   ⚠️  User ${user.email} already exists or error: ${error.message}`);
      }
    }

    console.log(`\n📦 Adding sample products...`);
    const addedProducts = [];
    for (const product of sampleProducts) {
      try {
        const addedProduct = await storage.createProduct(product);
        addedProducts.push(addedProduct);
        console.log(`   ✅ Added ${product.productType}: ${product.name} (${product.batchNumber})`);
      } catch (error) {
        console.log(`   ⚠️  Product ${product.batchNumber} already exists or error: ${error.message}`);
      }
    }

    // Add supply chain stages for the first product (wheat) if it was created
    if (addedProducts.length > 0) {
      console.log(`\n🔗 Adding supply chain stages...`);
      try {
        const wheatProduct = addedProducts.find(p => p.batchNumber === 'WHEAT-2024-001');
        if (wheatProduct) {
          for (const stage of sampleSupplyChainStages) {
            stage.productId = wheatProduct.id;
            try {
              await storage.addSupplyChainStage(stage);
              console.log(`   ✅ Added stage: ${stage.stageName} for ${wheatProduct.name}`);
            } catch (error) {
              console.log(`   ⚠️  Failed to add stage ${stage.stageName}: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Error adding supply chain stages: ${error.message}`);
      }

      // Add sample verification
      console.log(`\n🔍 Adding sample verification...`);
      try {
        const wheatProduct = addedProducts.find(p => p.batchNumber === 'WHEAT-2024-001');
        if (wheatProduct) {
          await storage.createVerification({
            productId: wheatProduct.id,
            verifierId: 'inspector-001',
            verificationType: 'organic',
            result: 'passed',
            certificateUrl: 'https://certs.usda.gov/wheat-001',
            notes: 'Meets all organic farming standards',
            validUntil: new Date('2025-03-15')
          });
          console.log(`   ✅ Added organic verification for ${wheatProduct.name}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error adding verification: ${error.message}`);
      }
    }

    // Display summary
    console.log('\n📊 Sample Data Summary:');
    try {
      const users = await storage.getAllUsers();
      const products = await storage.getProducts();
      
      console.log(`   👥 Users: ${users.length}`);
      console.log(`   📦 Products: ${products.length}`);
      
      // Show users by role
      const roles = ['farmer', 'inspector', 'distributor', 'retailer'];
      for (const role of roles) {
        const roleUsers = users.filter(u => u.role === role);
        if (roleUsers.length > 0) {
          console.log(`      - ${role}s: ${roleUsers.length}`);
        }
      }
      
      // Show products by status
      const statuses = ['created', 'in_production', 'quality_check', 'in_transit', 'delivered'];
      for (const status of statuses) {
        const statusProducts = products.filter(p => p.status === status);
        if (statusProducts.length > 0) {
          console.log(`      - ${status}: ${statusProducts.length}`);
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not get summary data');
    }

    console.log('\n🎉 Sample data setup complete!');
    console.log('   You can now start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up sample data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSampleData().catch(console.error);
}

export { setupSampleData };