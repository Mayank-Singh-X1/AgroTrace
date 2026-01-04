# AgroTrace: Blockchain-Enabled Supply Chain Transparency

AgroTrace is a comprehensive agricultural supply chain management system that leverages blockchain technology to ensure transparency, traceability, and trust from farm to table.

## 🚀 How It Works

AgroTrace tracks agricultural products through every stage of the supply chain—from harvest to the final consumer. Each critical event (e.g., harvesting, shipping, inspection) is recorded as a transaction.

### The Blockchain Core
Unlike traditional databases where history can be altered, AgroTrace uses a **Python-based Blockchain** to secure data:
1.  **Immutable Ledger**: When a product is created or moved, a transaction is generated.
2.  **Mining**: These transactions are "mined" into blocks using a Proof-of-Work algorithm (SHA-256).
3.  **Chain of Trust**: Each block contains the hash of the previous block, creating an unbreakable chain. If anyone tries to tamper with past data, the hashes break, alerting the system.
4.  **Verification**: Consumers can verify product authenticity by scanning a QR code, which checks the blockchain ledger for the product's unique batch hash.

---

## 👥 User Roles & Responsibilities

The platform is designed for various stakeholders in the agricultural ecosystem:

### 1. 🧑‍🌾 Farmer (Producer)
*   **Role**: The initiator of the supply chain.
*   **Actions**:
    *   **Register Products**: Logs new harvests with details like batch number, quantity, and harvest date.
    *   **Generate QR Codes**: Creates unique, trackable QR codes for each product batch.
    *   **Dashboard**: Monitors crop yield, active shipments, and estimated revenue.
*   **Demo Account**: `farmer@example.com`

### 2. 🚚 Distributor (Logistics)
*   **Role**: Handles the transport and storage of goods.
*   **Actions**:
    *   **Update Location**: Scans products to update their current location (e.g., "Arrived at Regional Warehouse").
    *   **Handover**: Records transfer of custody to retailers or other distributors.
*   **Interaction**: ensures the "Supply Chain Journey" timeline is accurate.

### 3. 🏪 Retailer (Seller)
*   **Role**: The final point of sale to the consumer.
*   **Actions**:
    *   **Receive Stock**: Verifies incoming shipments against the blockchain record.
    *   **Customer Display**: Displays the "verified authentic" badge to customers.

### 4. 🕵️ Inspector (Regulatory)
*   **Role**: Ensures quality and compliance.
*   **Actions**:
    *   **Verify Compliance**: Checks farming practices and logs certification (e.g., "Organic Certified").
    *   **Flag Issues**: Can mark batches as "Flagged" or "Rejected" if they fail safety standards.
*   **Demo Account**: `inspector@agency.gov`

### 5. 🛒 Consumer (End User)
*   **Role**: The purchaser of the product.
*   **Actions**:
    *   **Scan & Verify**: Uses the **Verify Page** (`/verify`) to check a product's history.
    *   **View Journey**: Sees the map of where food came from and who handled it.
    *   **Check Authenticity**: Confirms the product is safe and original via the blockchain hash.

### 6. 🛡️ Admin (System)
*   **Role**: Platform manager.
*   **Actions**: User management and system oversight.
*   **Demo Account**: `admin@agrotrace.com`

---

## 🛠️ Technology Stack

*   **Backend**: Python, Flask (Monolithic Architecture)
*   **Database**: SQLite (with SQLAlchemy ORM)
*   **Blockchain**: Custom Python implementation (SHA-256 Proof-of-Work)
*   **Frontend**: HTML, JavaScript (Served via Flask Templates), Tailwind CSS
*   **Security**: Session-based Authentication, Hash-linked Data Structures

---

## 🔍 How to Use

### 1. Installation
```bash
# Install required Python packages
pip install -r flask_server/requirements.txt
```

### 2. Running the App
```bash
# Start the server
python flask_server/app.py
```
The application will be accessible at **http://localhost:5000**.

### 3. Key Pages
*   **Dashboard**: `/` - Overview for logged-in users.
*   **Login**: `/login` - Access for Farmers, Inspectors, etc.
*   **Verify**: `/verify` - Public page to check product authenticity.
*   **Blockchain Visualizer**: `/blockchain` - Live view of the mined blocks and ledger.
