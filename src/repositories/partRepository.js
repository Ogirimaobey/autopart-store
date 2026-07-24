import pool from '../config/database.js';

// ==========================================
// 1. CAR PART MANAGEMENT QUERIES
// ==========================================

// UPLOAD NEW PART QUERY
export const insertPartQuery = `
  INSERT INTO parts_inventory (
    part_name, 
    oem_number, 
    price, 
    category, 
    stock_quantity, 
    condition, 
    compatible_vehicles, 
    image_url
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;
`;

// GET ALL PARTS (With optional category filtering for the Shop)
export const getAllPartsQuery = `
  SELECT * FROM parts_inventory 
  WHERE ($1::text IS NULL OR category = $1)
  ORDER BY created_at DESC;
`;

// GET SINGLE PART DETAILS
export const getPartByIdQuery = `
  SELECT * FROM parts_inventory WHERE id = $1;
`;

// UPDATE PART DATA (Stock, Price, or Details)
export const updatePartQuery = `
  UPDATE parts_inventory 
  SET 
    part_name = $2, 
    oem_number = $3, 
    price = $4, 
    category = $5, 
    stock_quantity = $6, 
    condition = $7, 
    compatible_vehicles = $8, 
    image_url = $9 
  WHERE id = $1
  RETURNING *;
`;

// DELETE PART FROM CATALOG
export const deletePartQuery = `
  DELETE FROM parts_inventory WHERE id = $1;
`;

// ==========================================
// 2. REPOSITORY FUNCTIONS
// ==========================================

export const getAllParts = async (category = null) => {
  const { rows } = await pool.query(getAllPartsQuery, [category]);
  return rows;
};

export const getPartById = async (id) => {
  const { rows } = await pool.query(getPartByIdQuery, [id]);
  return rows[0];
};

/**
 * TRADER INVENTORY VIEW
 * Pulls all parts owned by a specific seller/trader
 */
export const getTraderInventory = async (sellerId) => {
  const query = `
    SELECT * FROM parts_inventory 
    WHERE seller_id = $1 
    ORDER BY stock_quantity ASC;
  `;
  const { rows } = await pool.query(query, [sellerId]);
  return rows;
};

/**
 * CUSTOMER ORDER HISTORY
 * Replaces the old 'investments' logic with physical 'orders'
 */
export const getCustomerOrderHistory = async (userId) => {
  const query = `
    SELECT 
      ord.id as order_id,
      ord.total_price,
      ord.status as order_status,
      ord.created_at as order_date,
      p.part_name,
      p.image_url
    FROM orders ord
    JOIN parts_inventory p ON ord.part_id = p.id
    WHERE ord.user_id = $1
    ORDER BY ord.created_at DESC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};