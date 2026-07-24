import express from 'express';
import pool from '../config/db.js'; 
import jwt from 'jsonwebtoken'; 

const router = express.Router();

/**
 * 1. ADMIN LOGIN (POST /api/admin/login)
 * Updated to fix the 403 error by aligning the token "Badge" with the Middleware.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const cleanEmail = email.toLowerCase().trim();

    // SENIOR FIX: Using public.users to ensure consistency across Port 5433
    const result = await pool.query(
      'SELECT * FROM public.users WHERE TRIM(email) ILIKE $1', 
      [cleanEmail]
    );
    
    const user = result.rows[0];

    if (!user) {
      console.log(`❌ Backend looked for [${cleanEmail}] but the DB returned nothing.`);
      return res.status(401).json({ message: "Invalid Admin Credentials." });
    }

    if (user.password.trim() === password.trim()) {
      /**
       * SENIOR FIX: THE 403 CULPRIT
       * I changed 'isAdmin' to 'is_admin'.
       * This now matches exactly what authMiddleware.js looks for.
       */
      const token = jwt.sign(
        { id: user.id, is_admin: user.is_admin }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log(`✅ Login Successful! Badge issued for Oga with is_admin: ${user.is_admin}`);
      
      res.json({
        success: true,
        token,
        user: { name: user.name, email: user.email }
      });
    } else {
      console.log("❌ Password mismatch detected in terminal.");
      res.status(401).json({ message: "Invalid Admin Credentials." });
    }
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "The database is not responding." });
  }
});

/**
 * 2. COMMAND CENTER STATS: Get the pulse of the business
 */
router.get('/stats', async (req, res) => {
  try {
    // Senior Fix: Added public. prefix to all tables
    const partCount = await pool.query('SELECT COUNT(*) FROM public.parts');
    const orderCount = await pool.query('SELECT COUNT(*) FROM public.orders');
    
    const revenueSum = await pool.query(`
        SELECT SUM(p.price) as total 
        FROM public.orders o
        INNER JOIN public.parts p ON o.part_id = p.id
    `);

    res.json({
      totalParts: partCount.rows[0].count,
      totalOrders: orderCount.rows[0].count,
      totalRevenue: revenueSum.rows[0].total || "0.00",
    });
  } catch (error) {
    console.error('Admin Stats Error:', error.message);
    res.status(500).json({ message: 'Oga, we could not load your business stats right now.' });
  }
});

/**
 * 3. TEAM MANAGEMENT: See who has access to the portal
 */
router.get('/users', async (req, res) => {
  try {
    // Senior Fix: Added public. prefix
    const result = await pool.query('SELECT id, name, email, created_at FROM public.users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Users Error:', error.message);
    res.status(500).json({ message: 'Error fetching the team list.' });
  }
});

export default router;