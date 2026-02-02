import os
import io
import base64
import json
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file, redirect, url_for, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_
import qrcode
from qrcode.image.svg import SvgImage

# Initialize Flask with specific static/template configuration for SPA
app = Flask(__name__, 
            static_folder='static',
            static_url_path='',  # Serve static files from root for /assets to work
            template_folder='templates')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///agrotrace.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'dev-secret-key'

# Enable CORS
CORS(app)

db = SQLAlchemy(app)

# ==========================================
# MODELS
# ==========================================

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String, primary_key=True, default=lambda: os.urandom(8).hex().lower())
    email = db.Column(db.String, unique=True)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    profile_image_url = db.Column(db.String)
    role = db.Column(db.String, default='consumer')
    company_name = db.Column(db.String)
    location = db.Column(db.String)
    verification_status = db.Column(db.String, default='pending')
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    updated_at = db.Column(db.Integer, default=lambda: int(time.time()))

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'profileImageUrl': self.profile_image_url,
            'role': self.role,
            'companyName': self.company_name,
            'location': self.location,
            'verificationStatus': self.verification_status,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String, primary_key=True, default=lambda: os.urandom(8).hex().lower())
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    product_type = db.Column(db.String, nullable=False)
    batch_number = db.Column(db.String, nullable=False, unique=True)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String, nullable=False)
    origin_farm_id = db.Column(db.String, nullable=False)
    harvest_date = db.Column(db.Integer)
    expiry_date = db.Column(db.Integer)
    status = db.Column(db.String, nullable=False, default='created')
    qr_code = db.Column(db.String, unique=True)
    created_by = db.Column(db.String, nullable=False)
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    updated_at = db.Column(db.Integer, default=lambda: int(time.time()))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'productType': self.product_type,
            'batchNumber': self.batch_number,
            'quantity': self.quantity,
            'unit': self.unit,
            'originFarmId': self.origin_farm_id,
            'harvestDate': datetime.fromtimestamp(self.harvest_date).isoformat() if self.harvest_date else None,
            'expiryDate': datetime.fromtimestamp(self.expiry_date).isoformat() if self.expiry_date else None,
            'status': self.status,
            'qrCode': self.qr_code,
            'createdBy': self.created_by,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }

class SupplyChainStage(db.Model):
    __tablename__ = 'supply_chain_stages'
    id = db.Column(db.String, primary_key=True, default=lambda: os.urandom(8).hex().lower())
    product_id = db.Column(db.String, nullable=False)
    stage_name = db.Column(db.String, nullable=False)
    stage_type = db.Column(db.String, nullable=False)
    handler_id = db.Column(db.String, nullable=False)
    location = db.Column(db.String)
    timestamp = db.Column(db.Integer, default=lambda: int(time.time()))
    notes = db.Column(db.String)
    verification_data = db.Column(db.String)
    status = db.Column(db.String, default='completed')

    def to_dict(self):
        return {
            'id': self.id,
            'productId': self.product_id,
            'stageName': self.stage_name,
            'stageType': self.stage_type,
            'handlerId': self.handler_id,
            'location': self.location,
            'timestamp': self.timestamp,
            'notes': self.notes,
            'verificationData': self.verification_data,
            'status': self.status
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.String, primary_key=True, default=lambda: os.urandom(8).hex().lower())
    product_id = db.Column(db.String, nullable=False)
    from_user_id = db.Column(db.String, nullable=False)
    to_user_id = db.Column(db.String, nullable=False)
    transaction_type = db.Column(db.String, nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float)
    currency = db.Column(db.String, default='USD')
    status = db.Column(db.String, nullable=False, default='pending')
    blockchain_hash = db.Column(db.String)
    verification_signature = db.Column(db.String)
    tx_metadata = db.Column(db.String)
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))
    updated_at = db.Column(db.Integer, default=lambda: int(time.time()))

    def to_dict(self):
        return {
            'id': self.id,
            'productId': self.product_id,
            'fromUserId': self.from_user_id,
            'toUserId': self.to_user_id,
            'transactionType': self.transaction_type,
            'quantity': self.quantity,
            'price': self.price,
            'currency': self.currency,
            'status': self.status,
            'blockchainHash': self.blockchain_hash,
            'verificationSignature': self.verification_signature,
            'metadata': self.tx_metadata,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }

class Verification(db.Model):
    __tablename__ = 'verifications'
    id = db.Column(db.String, primary_key=True, default=lambda: os.urandom(8).hex().lower())
    product_id = db.Column(db.String, nullable=False)
    verifier_id = db.Column(db.String, nullable=False)
    verification_type = db.Column(db.String, nullable=False)
    result = db.Column(db.String, nullable=False)
    certificate_url = db.Column(db.String)
    notes = db.Column(db.String)
    valid_until = db.Column(db.Integer)
    created_at = db.Column(db.Integer, default=lambda: int(time.time()))

    def to_dict(self):
        return {
            'id': self.id,
            'productId': self.product_id,
            'verifierId': self.verifier_id,
            'verificationType': self.verification_type,
            'result': self.result,
            'certificateUrl': self.certificate_url,
            'notes': self.notes,
            'validUntil': datetime.fromtimestamp(self.valid_until).isoformat() if self.valid_until else None,
            'createdAt': self.created_at
        }

# ==========================================
# HELPERS
# ==========================================

from flask import session

def get_current_user_id():
    # Return user_id from session or None
    return session.get('user_id')

def seed_db():
    users = [
        User(id="00000000000000000000000000000001", email="farmer@example.com", first_name="John", last_name="Doe", role="farmer", company_name="Green Valley Farms", location="California, USA", verification_status="verified"),
        User(id="00000000000000000000000000000002", email="inspector@agency.gov", first_name="Jane", last_name="Smith", role="inspector", company_name="AgriCheck", location="Washington DC, USA", verification_status="verified"),
        User(id="00000000000000000000000000000003", email="admin@agrotrace.com", first_name="Admin", last_name="User", role="admin", company_name="AgroTrace Inc", location="Global", verification_status="verified"),
        User(id="00000000000000000000000000000004", email="distributor@logistics.com", first_name="Mike", last_name="Trucks", role="distributor", company_name="FastMove Logistics", location="Nevada, USA", verification_status="verified"),
        User(id="00000000000000000000000000000005", email="retailer@store.com", first_name="Sarah", last_name="Market", role="retailer", company_name="Organic Whole Foods", location="New York, USA", verification_status="verified"),
        User(id="00000000000000000000000000000006", email="consumer@gmail.com", first_name="Emily", last_name="Eats", role="consumer", company_name="N/A", location="Boston, USA", verification_status="verified")
    ]
    
    for user in users:
        if not User.query.filter_by(email=user.email).first():
            db.session.add(user)
            print(f"Seeding user: {user.role}")
            
    db.session.commit()

class QRCodeService:
    def __init__(self, base_url='http://localhost:5000'):
        self.base_url = base_url

    def generate_qr_data(self, product, farmer_name):
        return {
            'productId': product.id,
            'batchNumber': product.batch_number,
            'name': product.name,
            'farmer': farmer_name,
            'harvestDate': datetime.fromtimestamp(product.harvest_date).isoformat() if product.harvest_date else None,
            'status': product.status,
            'verificationUrl': f"{self.base_url}/verify/{product.batch_number}",
            'trackingUrl': f"{self.base_url}/track/{product.batch_number}",
            'timestamp': int(time.time() * 1000)
        }

    def generate_qr_code(self, qr_data_dict):
        qr_content = json.dumps({
            'id': qr_data_dict['productId'],
            'batch': qr_data_dict['batchNumber'],
            'name': qr_data_dict['name'],
            'farmer': qr_data_dict['farmer'],
            'harvest': qr_data_dict['harvestDate'],
            'status': qr_data_dict['status'],
            'verify': qr_data_dict['verificationUrl'],
            'track': qr_data_dict['trackingUrl'],
            'timestamp': qr_data_dict['timestamp']
        })
        qr = qrcode.QRCode(version=1, box_size=10, border=1)
        qr.add_data(qr_content)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"

    def generate_tracking_qr(self, batch_number):
        tracking_url = f"{self.base_url}/lookup/{batch_number}"
        qr = qrcode.QRCode(version=1, box_size=10, border=1)
        qr.add_data(tracking_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#10B981", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"

qr_service = QRCodeService()

# ==========================================
# ROUTES
# ==========================================

# Compatibility Routes for Frontend
@app.route('/logout', methods=['GET', 'POST'])
@app.route('/api/logout', methods=['GET', 'POST'])
def global_logout():
    session.pop('user_id', None)
    return redirect('/login')

@app.route('/api/farmer/stats', methods=['GET'])
def get_farmer_stats():
    user_id = get_current_user_id()
    if not user_id: return jsonify({'message': 'Unauthorized'}), 401
    
    products = Product.query.filter_by(created_by=user_id).count()
    # Mocking other stats as we don't have tables for them yet
    return jsonify({
        'activeCrops': products,
        'totalProducts': products,
        'monthlyRevenue': 15000,
        'growthRate': '12.5%',
        'totalYield': '12.5 tons',
        'alerts': 2
    })

@app.route('/api/farmer/products', methods=['GET'])
def get_farmer_products():
    return get_products()

@app.route('/api/farmer/weather', methods=['GET'])
def get_weather():
    return jsonify({
        'temp': 72,
        'condition': 'Sunny',
        'humidity': 45,
        'windSpeed': 8
    })

@app.route('/api/roles', methods=['GET'])
def get_roles():
    return jsonify(['farmer', 'distributor', 'retailer', 'consumer', 'inspector'])

# SPA Catch-all Route
@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Don't intercept API routes
    if path.startswith('api/'):
        return jsonify({'message': 'API route not found'}), 404
    
    # Check if user is logged in for root
    if path == '' and not session.get('user_id') and not request.args.get('track') and not request.args.get('verify'):
        return redirect('/login')

    return render_template('index.html')

# AUTH
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    
    user = User.query.filter_by(email=email).first()
    if user:
        session['user_id'] = user.id
        return jsonify(user.to_dict())
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

@app.route('/api/auth/user', methods=['GET'])
def get_user():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if user: return jsonify(user.to_dict())
    return jsonify({'message': 'User not found'}), 404

# PRODUCTS
@app.route('/api/products', methods=['GET'])
def get_products():
    user_id = get_current_user_id()
    user = User.query.get(user_id)
    if user and user.role == 'farmer':
        products = Product.query.filter_by(created_by=user_id).all()
    else:
        products = Product.query.all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/recent', methods=['GET'])
def get_recent_products():
    user_id = get_current_user_id()
    user = User.query.get(user_id)
    limit = int(request.args.get('limit', 10))
    
    query = Product.query
    if user and user.role == 'farmer':
        query = query.filter_by(created_by=user_id)
        
    products = query.order_by(Product.created_at.desc()).limit(limit).all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/by-status/<status>', methods=['GET'])
def get_products_by_status(status):
    user_id = get_current_user_id()
    user = User.query.get(user_id)
    query = Product.query.filter_by(status=status)
    if user and user.role == 'farmer':
        query = query.filter_by(created_by=user_id)
    products = query.all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/by-type/<product_type>', methods=['GET'])
def get_products_by_type(product_type):
    user_id = get_current_user_id()
    user = User.query.get(user_id)
    query = Product.query.filter_by(product_type=product_type)
    if user and user.role == 'farmer':
        query = query.filter_by(created_by=user_id)
    products = query.all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/search/products', methods=['GET'])
def search_products():
    q = request.args.get('q', '')
    if not q:
        return jsonify([])
    
    products = Product.query.filter(or_(
        Product.name.ilike(f'%{q}%'),
        Product.batch_number.ilike(f'%{q}%')
    )).limit(50).all()
    return jsonify([p.to_dict() for p in products])

@app.route('/api/products/<id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if not product: return jsonify({'message': 'Product not found'}), 404
    return jsonify(product.to_dict())

@app.route('/api/products/batch/<batch_number>', methods=['GET'])
def get_product_by_batch(batch_number):
    product = Product.query.filter_by(batch_number=batch_number).first()
    if not product: return jsonify({'message': 'Product not found'}), 404
    return jsonify(product.to_dict())

@app.route('/api/products', methods=['POST'])
def create_product():
    user_id = get_current_user_id()
    data = request.json
    harvest_date = int(datetime.fromisoformat(data.get('harvestDate').replace('Z', '+00:00')).timestamp()) if data.get('harvestDate') else None
    expiry_date = int(datetime.fromisoformat(data.get('expiryDate').replace('Z', '+00:00')).timestamp()) if data.get('expiryDate') else None

    product = Product(
        name=data['name'], description=data.get('description'), product_type=data['productType'],
        batch_number=data['batchNumber'], quantity=data['quantity'], unit=data['unit'],
        origin_farm_id=user_id, harvest_date=harvest_date, expiry_date=expiry_date,
        status='created', created_by=user_id
    )
    db.session.add(product)
    db.session.commit()

    stage = SupplyChainStage(
        product_id=product.id, stage_name="Farm Production", stage_type="production",
        handler_id=user_id, location=data.get('location', 'Farm Location'),
        notes="Product created and registered on farm", status="completed"
    )
    db.session.add(stage)
    db.session.commit()
    return jsonify(product.to_dict()), 201

# USERS
@app.route('/api/users', methods=['GET'])
def get_users():
    user_id = get_current_user_id()
    user = User.query.get(user_id)
    # Check if admin or inspector
    if user and user.role in ['admin', 'inspector']:
        users = User.query.all()
        return jsonify([u.to_dict() for u in users])
    return jsonify({'message': 'Unauthorized'}), 403

# QR
@app.route('/api/products/<id>/qr', methods=['GET'])
def get_product_qr(id):
    product = Product.query.get(id)
    if not product: return jsonify({'message': 'Product not found'}), 404
    farmer = User.query.get(product.created_by)
    farmer_name = f"{farmer.first_name} {farmer.last_name}" if farmer else "Unknown"
    qr_data = qr_service.generate_qr_data(product, farmer_name)
    qr_image = qr_service.generate_qr_code(qr_data)
    return jsonify({'qrCode': qr_image, 'qrData': qr_data})

@app.route('/api/products/<id>/qr/tracking', methods=['GET'])
def get_tracking_qr(id):
    product = Product.query.get(id)
    if not product: return jsonify({'message': 'Product not found'}), 404
    tracking_qr = qr_service.generate_tracking_qr(product.batch_number)
    return jsonify({'trackingQR': tracking_qr, 'batchNumber': product.batch_number})

@app.route('/api/products/<id>/label', methods=['GET'])
def get_product_label(id):
    product = Product.query.get(id)
    if not product: return jsonify({'message': 'Product not found'}), 404
    farmer = User.query.get(product.created_by)
    farmer_name = f"{farmer.first_name} {farmer.last_name}" if farmer else "Unknown"
    qr_data = qr_service.generate_qr_data(product, farmer_name)
    qr_image = qr_service.generate_qr_code(qr_data)
    label = {
        'productInfo': {
            'name': product.name,
            'batchNumber': product.batch_number,
            'productType': product.product_type,
            'quantity': f"{product.quantity} {product.unit}",
            'harvestDate': datetime.fromtimestamp(product.harvest_date).strftime('%Y-%m-%d') if product.harvest_date else 'N/A',
            'expiryDate': datetime.fromtimestamp(product.expiry_date).strftime('%Y-%m-%d') if product.expiry_date else 'N/A',
            'status': product.status.replace('_', ' ').upper()
        },
        'qrCode': {'image': qr_image, 'data': qr_data},
        'instructions': {'consumer': 'Scan QR code to verify', 'retailer': 'Use batch number for inventory'},
        'generatedAt': datetime.now().isoformat(),
        'printReady': True
    }
    return jsonify(label)

@app.route('/track/<batch_number>')
def track_redirect(batch_number):
    return redirect(f'/?track={batch_number}')

@app.route('/verify/<batch_number>')
def verify_redirect(batch_number):
    return redirect(f'/verify?id={batch_number}')

# Supply Chain
@app.route('/api/products/<id>/supply-chain', methods=['GET'])
def get_supply_chain(id):
    stages = SupplyChainStage.query.filter_by(product_id=id).all()
    return jsonify([s.to_dict() for s in stages])

@app.route('/api/products/<id>/supply-chain', methods=['POST'])
def add_supply_chain_stage(id):
    data = request.json
    stage = SupplyChainStage(
        product_id=id, stage_name=data['stageName'], stage_type=data['stageType'],
        handler_id=get_current_user_id(), location=data.get('location'),
        notes=data.get('notes'), status=data.get('status', 'completed')
    )
    db.session.add(stage)
    db.session.commit()
    return jsonify(stage.to_dict()), 201

# Transaction
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    user_id = get_current_user_id()
    transactions = Transaction.query.filter(or_(Transaction.from_user_id == user_id, Transaction.to_user_id == user_id)).all()
    return jsonify([t.to_dict() for t in transactions])

@app.route('/api/products/<id>/transactions', methods=['GET'])
def get_product_transactions(id):
    transactions = Transaction.query.filter_by(product_id=id).all()
    return jsonify([t.to_dict() for t in transactions])

from blockchain import Blockchain

blockchain = Blockchain()

# ... existing routes ...

@app.route('/api/lookup/<identifier>', methods=['GET'])
def lookup_product(identifier):
    # Try batch number first
    product = Product.query.filter_by(batch_number=identifier).first()
    if not product:
        product = Product.query.get(identifier)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    # Get related data
    stages = SupplyChainStage.query.filter_by(product_id=product.id).all()
    verifications = Verification.query.filter_by(product_id=product.id).all()
    transactions = Transaction.query.filter_by(product_id=product.id).all()
    farmer = User.query.get(product.created_by)
    farmer_name = f"{farmer.first_name} {farmer.last_name}" if farmer else "Unknown"
    
    qr_data = qr_service.generate_qr_data(product, farmer_name)
    
    return jsonify({
        'product': product.to_dict(),
        'farmer': farmer.to_dict() if farmer else None,
        'supplyChain': [s.to_dict() for s in stages],
        'verifications': [v.to_dict() for v in verifications],
        'transactions': [t.to_dict() for t in transactions],
        'qrData': qr_data
    })

@app.route('/api/blockchain', methods=['GET'])
def get_blockchain():
    return jsonify({
        'chain': blockchain.chain,
        'length': len(blockchain.chain)
    })

@app.route('/blockchain')
def blockchain_viz():
    return render_template('blockchain.html')

@app.route('/verify')
def verify_page_direct():
    return render_template('verify.html')

@app.route('/track')
def track_page_direct():
    return render_template('index.html')

# Update Transaction Creation to Mine Block
@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.json
    t = Transaction(
        product_id=data['productId'], from_user_id=get_current_user_id(), to_user_id=data['toUserId'],
        transaction_type=data['transactionType'], quantity=data['quantity'],
        price=data.get('price'), currency=data.get('currency', 'USD'), status='pending'
    )
    db.session.add(t)
    db.session.commit()
    
    # Mining
    sender = t.from_user_id
    receiver = t.to_user_id
    amount = t.quantity
    blockchain.add_transaction(sender, receiver, amount, t.product_id, t.transaction_type)
    last_block = blockchain.get_last_block()
    previous_hash = blockchain.hash(last_block)
    proof = blockchain.proof_of_work(last_block['proof'])
    block = blockchain.create_block(proof, previous_hash)
    
    t.blockchain_hash = blockchain.hash(block)
    t.status = 'verified' # Auto verify with blockchain
    db.session.commit()
    
    return jsonify(t.to_dict()), 201

# Analytics
@app.route('/api/analytics/stats', methods=['GET'])
def get_stats():
    return jsonify({
        'totalProducts': Product.query.count(),
        'totalTransactions': Transaction.query.count(),
        'activeShipments': SupplyChainStage.query.count(),
        'revenue': 125000,
        'blocksMined': len(blockchain.chain)
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_db()
    app.run(debug=True, port=5000, host="0.0.0.0")
