import pool from '../config/db.js';

/**
 * 1. CREATE: Upload a new part to the database
 * Now includes the discount_price field.
 */
export const createPart = async (partData) => {
  const { 
    name, 
    price, 
    discount_price,
    oem, 
    category, 
    condition, 
    image_url,
    selar_link 
  } = partData;

  // Senior Fix: Added $3 for discount_price and shifted other placeholders
  const query = `
    INSERT INTO public.parts 
    (name, price, discount_price, oem, category, condition, image_url, selar_link)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    name, 
    price, 
    discount_price || 0, // Default to 0 if no discount is provided
    oem, 
    category, 
    condition || 'Tokunbo (Direct Entry)', 
    image_url,
    selar_link
  ];

  const result = await pool.query(query, values);
  return { message: "Part successfully added to your store", part: result.rows[0] };
};

/**
 * 2. READ: Get all parts for the Warehouse grid
 */
export const fetchStorefrontParts = async (category = null) => {
  let query = 'SELECT * FROM public.parts';
  const values = [];

  if (category) {
    query += ' WHERE category = $1';
    values.push(category);
  }

  query += ' ORDER BY created_at DESC';
  
  const result = await pool.query(query, values);
  return result.rows; 
};

/**
 * 3. READ: Get details for one specific part
 */
export const fetchSinglePart = async (id) => {
  const result = await pool.query('SELECT * FROM public.parts WHERE id = $1', [id]);
  
  if (result.rows.length === 0) {
    throw new Error('Part not found in the warehouse');
  }
  
  return result.rows[0];
};

/**
 * 4. UPDATE: Edit an existing part's details
 * Now allows the Oga to set a slash/discount price.
 */
export const updatePartData = async (id, partData) => {
  const { 
    name, 
    price, 
    discount_price, 
    oem, 
    category, 
    condition, 
    image_url, 
    selar_link 
  } = partData;
  
  // Senior Fix: Added discount_price = $3 and updated COALESCE for images/links
  const query = `
    UPDATE public.parts 
    SET name = $1, 
        price = $2, 
        discount_price = $3,
        oem = $4, 
        category = $5, 
        condition = $6, 
        image_url = COALESCE($7, image_url),
        selar_link = COALESCE($8, selar_link)
    WHERE id = $9
    RETURNING *;
  `;

  const values = [
    name, 
    price, 
    discount_price ?? 0, 
    oem, 
    category, 
    condition, 
    image_url, 
    selar_link, 
    id
  ];

  const result = await pool.query(query, values);
  
  if (result.rows.length === 0) {
    throw new Error('Update failed: Part not found');
  }

  return { message: "Warehouse record updated with new pricing", part: result.rows[0] };
};

/**
 * 5. DELETE: Remove a part completely
 */
export const removePartFromStore = async (id) => {
  const result = await pool.query('DELETE FROM public.parts WHERE id = $1 RETURNING id', [id]);
  
  if (result.rows.length === 0) {
    throw new Error('Could not delete: Part does not exist');
  }

  return { message: "Part removed from store", id: result.rows[0].id };
};