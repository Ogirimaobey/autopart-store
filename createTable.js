import pool from './src/config/database.js';

// 1. USERS & TRADERS TABLE
// I added 'is_admin' to match the security checks in your login logic
const createUserTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,
    user_type VARCHAR(20) DEFAULT 'buyer', 
    is_admin BOOLEAN DEFAULT false,
    account_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

// 2. CAR PARTS INVENTORY TABLE
// This stores the 'small small parts' like gearboxes, bolts, and brake pads
const createPartsInventoryTable = `
  CREATE TABLE IF NOT EXISTS parts_inventory (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    part_name VARCHAR(150) NOT NULL,
    oem_number VARCHAR(50), 
    price NUMERIC(15, 2) NOT NULL,
    category VARCHAR(50) NOT NULL, 
    stock_quantity INTEGER DEFAULT 1,
    condition VARCHAR(20) DEFAULT 'tokunbo', 
    compatible_vehicles JSONB, 
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

// 3. PHYSICAL ORDERS TABLE
const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts_inventory(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    total_price NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', 
    delivery_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

// 4. PAYMENTS & WITHDRAWALS TABLE
const createTransactionsTable = `
  CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(20, 2) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('payment', 'withdrawal', 'refund')),
    status VARCHAR(20) DEFAULT 'pending',
    reference VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const setupDatabase = async () => {
  let client;
  try {
    console.log('-----------------------------------------');
    console.log('🏗️ [DB] Starting Local Schema Construction...');
    console.log('-----------------------------------------');
    
    client = await pool.connect();

    // Executing the construction blueprints
    await client.query(createUserTable);
    console.log('✅ Users table ready.');
    
    await client.query(createPartsInventoryTable);
    console.log('✅ Parts Inventory table ready.');
    
    await client.query(createOrdersTable);
    console.log('✅ Orders table ready.');
    
    await client.query(createTransactionsTable);
    console.log('✅ Transactions table ready.');

    console.log('-----------------------------------------');
    console.log('🏁 [DB] AutoPart Pro Schema construction complete.');
    console.log('-----------------------------------------');
  } catch (error) {
    console.error('❌ [DB] Construction Error:', error.message);
  } finally {
    if (client) client.release();
  }
};

// Start the construction
setupDatabase();