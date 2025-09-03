const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgroChainProduct", function () {
  let agroChainProduct;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    const AgroChainProduct = await ethers.getContractFactory("AgroChainProduct");
    agroChainProduct = await AgroChainProduct.deploy();
  });

  describe("Product Management", function () {
    it("Should create a product", async function () {
      await agroChainProduct.createProduct(
        "prod-1",
        "BATCH-001",
        "Organic Apples",
        "Fruits"
      );

      const product = await agroChainProduct.getProduct("prod-1");
      expect(product.id).to.equal("prod-1");
      expect(product.batchNumber).to.equal("BATCH-001");
      expect(product.name).to.equal("Organic Apples");
      expect(product.category).to.equal("Fruits");
      expect(product.producer).to.equal(owner.address);
    });

    it("Should not allow creating a product with an existing ID", async function () {
      await agroChainProduct.createProduct(
        "prod-2",
        "BATCH-002",
        "Organic Oranges",
        "Fruits"
      );

      await expect(
        agroChainProduct.createProduct(
          "prod-2",
          "BATCH-003",
          "Duplicate Product",
          "Fruits"
        )
      ).to.be.revertedWith("Product already exists");
    });
  });

  describe("Transaction Management", function () {
    beforeEach(async function () {
      await agroChainProduct.createProduct(
        "prod-3",
        "BATCH-003",
        "Organic Bananas",
        "Fruits"
      );
    });

    it("Should record a transaction", async function () {
      await agroChainProduct.recordTransaction(
        "tx-1",
        "prod-3",
        addr1.address,
        "transfer",
        100,
        50
      );

      const transactions = await agroChainProduct.getProductTransactions("prod-3");
      expect(transactions.length).to.equal(1);
      expect(transactions[0].id).to.equal("tx-1");
      expect(transactions[0].productId).to.equal("prod-3");
      expect(transactions[0].from).to.equal(owner.address);
      expect(transactions[0].to).to.equal(addr1.address);
      expect(transactions[0].txType).to.equal("transfer");
      expect(transactions[0].quantity).to.equal(100);
      expect(transactions[0].price).to.equal(50);
    });

    it("Should not record a transaction for non-existent product", async function () {
      await expect(
        agroChainProduct.recordTransaction(
          "tx-2",
          "non-existent",
          addr1.address,
          "transfer",
          100,
          50
        )
      ).to.be.revertedWith("Product does not exist");
    });
  });

  describe("Supply Chain Stage Management", function () {
    beforeEach(async function () {
      await agroChainProduct.createProduct(
        "prod-4",
        "BATCH-004",
        "Organic Grapes",
        "Fruits"
      );
    });

    it("Should record a supply chain stage", async function () {
      await agroChainProduct.recordSupplyChainStage(
        "stage-1",
        "prod-4",
        "harvesting",
        "Farm Location",
        "Harvested on time",
        "completed"
      );

      const stages = await agroChainProduct.getProductStages("prod-4");
      expect(stages.length).to.equal(1);
      expect(stages[0].id).to.equal("stage-1");
      expect(stages[0].productId).to.equal("prod-4");
      expect(stages[0].stageType).to.equal("harvesting");
      expect(stages[0].location).to.equal("Farm Location");
      expect(stages[0].notes).to.equal("Harvested on time");
      expect(stages[0].status).to.equal("completed");
    });
  });

  describe("Verification Management", function () {
    beforeEach(async function () {
      await agroChainProduct.createProduct(
        "prod-5",
        "BATCH-005",
        "Organic Strawberries",
        "Fruits"
      );
    });

    it("Should record a verification", async function () {
      const validUntil = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
      
      await agroChainProduct.recordVerification(
        "ver-1",
        "prod-5",
        "quality",
        "passed",
        validUntil
      );

      const verifications = await agroChainProduct.getProductVerifications("prod-5");
      expect(verifications.length).to.equal(1);
      expect(verifications[0].id).to.equal("ver-1");
      expect(verifications[0].productId).to.equal("prod-5");
      expect(verifications[0].verificationType).to.equal("quality");
      expect(verifications[0].result).to.equal("passed");
      expect(verifications[0].validUntil).to.equal(validUntil);

      // Check that the product is marked as verified
      const product = await agroChainProduct.getProduct("prod-5");
      expect(product.isVerified).to.be.true;
    });

    it("Should not mark product as verified if verification result is not 'passed'", async function () {
      const validUntil = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      
      await agroChainProduct.recordVerification(
        "ver-2",
        "prod-5",
        "quality",
        "failed",
        validUntil
      );

      const product = await agroChainProduct.getProduct("prod-5");
      expect(product.isVerified).to.be.false;
    });
  });
});