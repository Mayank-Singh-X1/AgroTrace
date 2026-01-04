# Software Requirements Specification (SRS) for AgroTrace

**Version**: 1.0  
**Date**: January 4, 2026

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the requirements for **AgroTrace**, a blockchain-based agricultural supply chain management system. This system is designed to provide transparency, traceability, and trust in the food supply chain by allowing stakeholders (farmers, distributors, retailers, consumers) to track products from harvest to consumption.

### 1.2 Scope
AgroTrace is a web-based application that:
*   Allows farmers to register crops and generate unique batches.
*   Uses a proprietary **Python Blockchain** to create an immutable ledger of all product movements.
*   Enables distributors and retailers to update product status as it moves through the supply chain.
*   Provides a public verification portal for consumers to valid product authenticity via QR codes or batch numbers.
*   Facilitates regulatory oversight by inspectors.

### 1.3 Definitions and Acronyms
*   **SRS**: Software Requirements Specification
*   **Blockchain**: A distributed, immutable ledger technology.
*   **Hash**: A cryptographic function (SHA-256) used to secure data blocks.
*   **QR Code**: Quick Response Code, a 2D barcode used for easy mobile scanning.
*   **SPA**: Single Page Application.
*   **CRUD**: Create, Read, Update, Delete.

### 1.4 References
*   IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications.
*   AgroTrace Project Documentation (README.md).

---

## 2. Overall Description

### 2.1 Product Perspective
AgroTrace is a standalone web application. It consists of a monolithic **Flask (Python)** backend that handles all business logic, database interactions (**SQLite**), and blockchain mining operations. The frontend is delivered via server-side rendered templates with dynamic JavaScript interactions, ensuring compatibility across modern web browsers.

### 2.2 Product Functions
*   **User Authentication**: Secure login for different roles (Farmer, Distributor, Retailer, Inspector, Admin).
*   **Product Registration**: Farmers can create new product batches with harvest data.
*   **Supply Chain Tracking**: Distributors and Retailers can log custody transfers and location updates.
*   **Blockchain Mining**: System automatically mines a new block for every valid transaction/update to ensure data integrity.
*   **Verification**: Public interface to query the blockchain ledger using a Batch ID.
*   **Visualizer**: Real-time view of the blockchain blocks, hashes, and proof-of-work.

### 2.3 User Characteristics
*   **Farmer**: Basic computer literacy; focuses on data entry for harvests.
*   **Distributor/Retailer**: Operational staff; focuses on rapid scanning and status updates.
*   **Inspector**: Compliance officer; requires detailed view of product history for auditing.
*   **Consumer**: General public; uses simple interface to verify product trust.
*   **Admin**: Technical user; manages accounts and system health.

### 2.4 Assumptions and Dependencies
*   **Dependencies**: Python 3.8+, Flask, SQLAlchemy.
*   **Assumptions**: Users have access to a device with a web browser and internet connection. GPS location data is provided by the client device or manually entered.

---

## 3. Specific Requirements

### 3.1 Functional Requirements
*   **REQ-1**: The system shall allow users to log in using email and role-based access control.
*   **REQ-2**: The system shall generate a unique cryptographic hash for every product transaction.
*   **REQ-3**: The system shall link each new transaction block to the previous block (Blockchain structure).
*   **REQ-4**: The system must provide a QR code for every registered product batch.
*   **REQ-5**:The system shall allow 'Inspector' users to flag products as "Rejected" or "Verified".

### 3.2 External Interface Requirements

#### 3.2.1 User Interfaces
*   **Dashboard**: A responsive card-based layout showing active metrics (Yield, Revenue, Shipments).
*   **Verification Page**: A clean, public-facing search page for entering Batch IDs.
*   **Blockchain Visualizer**: A graphical representation of connected blocks (Genesis Block -> Block 1 -> Block 2).

#### 3.2.2 Software Interfaces
*   **Database**: SQLite via SQLAlchemy ORM for relational data storage.
*   **Web Server**: Flask built-in development server (or WSGI container in production).
*   **API**: RESTful JSON API endpoints (e.g., `/api/products`, `/api/blockchain`) for frontend communication.

#### 3.2.3 Communication Interfaces
*   The system uses **HTTP/HTTPS** for client-server communication.
*   Data exchange format is **JSON**.

### 3.3 Non-Functional Requirements

#### 3.3.1 Performance
*   Blockchain mining (Proof-of-Work) should complete within reasonable time (< 2 seconds per block) for UX, adjustable via difficulty parameter.
*   Pages should load in under 1 second on standard broadband.

#### 3.3.2 Security
*   **Immutability**: Once written to the blockchain, transaction history cannot be altered.
*   **Authentication**: Session-based auth prevents unauthorized access to write operations.
*   **Input Validation**: All form inputs must be sanitized to prevent SQL injection.

#### 3.3.3 Reliability and Availability
*   The system utilizes a local SQLite database file, ensuring data persistence across restarts.
*   Designed for 99.9% uptime in a production environment.

#### 3.3.4 Usability
*   The interface utilizes **Tailwind CSS** for a modern, clean, and mobile-responsive design.
*   Color-coded badges (Green for Verified, Blue for In-Transit) provide immediate visual feedback.

---

## 4. Other Requirements
*   **Data Retention**: System must retain transaction logs indefinitely for historical auditing.
*   **Scalability**: The modular Flask architecture allows for future migration to PostgreSQL if transaction volume increases.
*   **Environment**: The application is designed to be OS-agnostic (Windows, Linux, macOS).
