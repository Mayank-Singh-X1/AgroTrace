import hre from "hardhat";

async function main() {
  console.log("Deploying AgroChainProduct contract...");

  // Deploy the contract
const AgroChainProductFactory = await hre.ethers.getContractFactory("AgroChainProduct");
  const agroChainProduct = await AgroChainProductFactory.deploy();

  await agroChainProduct.waitForDeployment();

  const address = await agroChainProduct.getAddress();
  console.log(`AgroChainProduct deployed to: ${address}`);

  // For verification later
  console.log("Contract deployment completed. Verify with:");
  console.log(`npx hardhat verify --network <network> ${address}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });