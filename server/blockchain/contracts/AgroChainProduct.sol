// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AgroChainProduct
 * @dev Contract for tracking agricultural products through the supply chain
 */
contract AgroChainProduct is Ownable {
    using Strings for uint256;
    
    struct Product {
        string id;          // Unique product ID
        string batchNumber; // Batch number
        string name;        // Product name
        string category;    // Product category
        address producer;   // Address of producer
        uint256 timestamp;  // Creation timestamp
        bool isVerified;    // Verification status
    }
    
    struct Transaction {
        string id;          // Transaction ID
        string productId;   // Product ID
        address from;       // Sender address
        address to;         // Receiver address
        string txType;      // Transaction type (transfer, sale, inspection)
        uint256 quantity;   // Quantity
        uint256 price;      // Price (if applicable)
        uint256 timestamp;  // Transaction timestamp
    }
    
    struct SupplyChainStage {
        string id;          // Stage ID
        string productId;   // Product ID
        string stageType;   // Stage type (production, inspection, transport, retail)
        address handler;    // Handler address
        string location;    // Location
        uint256 timestamp;  // Stage timestamp
        string notes;       // Additional notes
        string status;      // Status
    }
    
    struct Verification {
        string id;          // Verification ID
        string productId;   // Product ID
        address verifier;   // Verifier address
        string verificationType; // Verification type
        string result;      // Result
        uint256 timestamp;  // Verification timestamp
        uint256 validUntil; // Valid until timestamp
    }
    
    // Mappings
    mapping(string => Product) private products;
    mapping(string => Transaction[]) private productTransactions;
    mapping(string => SupplyChainStage[]) private productStages;
    mapping(string => Verification[]) private productVerifications;
    
    // Events
    event ProductCreated(string id, string batchNumber, string name, address producer);
    event TransactionRecorded(string id, string productId, address from, address to, string txType);
    event StageRecorded(string id, string productId, string stageType, address handler);
    event VerificationRecorded(string id, string productId, address verifier, string result);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new product
     */
    function createProduct(
        string memory id,
        string memory batchNumber,
        string memory name,
        string memory category
    ) public {
        require(bytes(products[id].id).length == 0, "Product already exists");
        
        products[id] = Product({
            id: id,
            batchNumber: batchNumber,
            name: name,
            category: category,
            producer: msg.sender,
            timestamp: block.timestamp,
            isVerified: false
        });
        
        emit ProductCreated(id, batchNumber, name, msg.sender);
    }
    
    /**
     * @dev Record a transaction
     */
    function recordTransaction(
        string memory id,
        string memory productId,
        address to,
        string memory txType,
        uint256 quantity,
        uint256 price
    ) public {
        require(bytes(products[productId].id).length > 0, "Product does not exist");
        
        Transaction memory transaction = Transaction({
            id: id,
            productId: productId,
            from: msg.sender,
            to: to,
            txType: txType,
            quantity: quantity,
            price: price,
            timestamp: block.timestamp
        });
        
        productTransactions[productId].push(transaction);
        
        emit TransactionRecorded(id, productId, msg.sender, to, txType);
    }
    
    /**
     * @dev Record a supply chain stage
     */
    function recordStage(
        string memory id,
        string memory productId,
        string memory stageType,
        string memory location,
        string memory notes,
        string memory status
    ) public {
        require(bytes(products[productId].id).length > 0, "Product does not exist");
        
        SupplyChainStage memory stage = SupplyChainStage({
            id: id,
            productId: productId,
            stageType: stageType,
            handler: msg.sender,
            location: location,
            timestamp: block.timestamp,
            notes: notes,
            status: status
        });
        
        productStages[productId].push(stage);
        
        emit StageRecorded(id, productId, stageType, msg.sender);
    }
    
    /**
     * @dev Record a verification
     */
    function recordVerification(
        string memory id,
        string memory productId,
        string memory verificationType,
        string memory result,
        uint256 validUntil
    ) public {
        require(bytes(products[productId].id).length > 0, "Product does not exist");
        
        Verification memory verification = Verification({
            id: id,
            productId: productId,
            verifier: msg.sender,
            verificationType: verificationType,
            result: result,
            timestamp: block.timestamp,
            validUntil: validUntil
        });
        
        productVerifications[productId].push(verification);
        
        // Update product verification status
        if (keccak256(abi.encodePacked(result)) == keccak256(abi.encodePacked("passed"))) {
            products[productId].isVerified = true;
        }
        
        emit VerificationRecorded(id, productId, msg.sender, result);
    }
    
    /**
     * @dev Get product details
     */
    function getProduct(string memory id) public view returns (Product memory) {
        require(bytes(products[id].id).length > 0, "Product does not exist");
        return products[id];
    }
    
    /**
     * @dev Get product transactions
     */
    function getProductTransactions(string memory productId) public view returns (Transaction[] memory) {
        require(bytes(products[productId].id).length > 0, "Product does not exist");
        return productTransactions[productId];
    }
    
    /**
     * @dev Get product stages
     */
    function getProductStages(string memory productId) public view returns (SupplyChainStage[] memory) {
        require(bytes(products[productId].id).length > 0, "Product does not exist");
        return productStages[productId];
    }
    
    /**
     * @dev Get product verifications
     */
    function getProductVerifications(string memory productId) public view returns (Verification[] memory) {
        require(bytes(products[productId].id).length > 0, "Product does not exist");
        return productVerifications[productId];
    }
}