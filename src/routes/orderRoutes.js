import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/db.js';
import nodemailer from 'nodemailer'; // Standard for automated emails
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 1. EMAIL ENGINE CONFIGURATION
 * This is the 'Post Office' that sends confirmation emails to your customers.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

const generateTrackingID = () => `AP-${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * 2. LOG A NEW ORDER (POST /api/orders)
 */
router.post('/', upload.single('receipt'), async (req, res) => {
  console.log("--- 📥 NEW INCOMING ORDER ATTEMPT ---");
  const { part_id, customer_name, customer_email, total_price } = req.body;
  const tracking_id = generateTrackingID();
  const receipt_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!part_id || !customer_email) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.orders (part_id, customer_name, customer_email, receipt_url, tracking_id, total_price, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING tracking_id`,
      [parseInt(part_id), customer_name, customer_email, receipt_url, tracking_id, total_price || 0, 'Pending Verification']
    );

    console.log(`✅ SUCCESS: Order ${tracking_id} saved.`);
    res.status(201).json({ success: true, tracking_id: result.rows[0].tracking_id });
  } catch (error) {
    console.error('❌ DATABASE ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. THE ULTIMATE CLEARANCE ENDPOINT (PATCH /api/orders/update-status)
 * This is what makes your 'Confirm Pay' button work.
 */
router.patch('/update-status', verifyToken, verifyAdmin, async (req, res) => {
  const { tracking_id, status, email } = req.body;
  
  console.log(`--- 🛡️ CLEARANCE ATTEMPT: ${tracking_id} ---`);

  try {
    // 1. Update Database Status to 'Confirmed Payment'
    const dbResult = await pool.query(
      `UPDATE public.orders 
       SET status = $1 
       WHERE tracking_id = $2 
       RETURNING *`,
      [status, tracking_id]
    );

    if (dbResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Order not found in warehouse records." });
    }

    // 2. Fetch Part Name for the email accuracy
    const orderData = await pool.query(`
      SELECT o.*, p.name as part_name 
      FROM public.orders o 
      LEFT JOIN public.parts p ON o.part_id = p.id 
      WHERE o.tracking_id = $1 LIMIT 1`, [tracking_id]);

    const order = orderData.rows[0];
    const clearanceTime = new Date().toLocaleString();

    // 3. Draft & Send the Elite Confirmation Email
    const mailOptions = {
      from: `"AutoPro Luxury Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ PAYMENT CONFIRMED: ${tracking_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
          <h2 style="color: #2563eb; text-transform: uppercase; letter-spacing: 1px;">Payment Authenticated</h2>
          <p>Oga, we have successfully verified your payment for the following order:</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 5px solid #2563eb;">
            <p style="margin: 5px 0;"><strong>Tracking ID:</strong> ${tracking_id}</p>
            <p style="margin: 5px 0;"><strong>Product:</strong> ${order.part_name || 'Spare Part'}</p>
            <p style="margin: 5px 0;"><strong>Settlement:</strong> ₦${Number(order.total_price).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Confirmed</span></p>
            <p style="margin: 5px 0;"><strong>Time of Clearance:</strong> ${clearanceTime}</p>
          </div>
          <p style="margin-top: 20px;">Our logistics team is preparing your asset for dispatch. You will be notified once it leaves the warehouse.</p>
          <p style="font-size: 11px; color: #64748b; margin-top: 30px;">© 2026 Fundbridge Consultation Ltd | AutoPro Nigeria</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email Dispatched to: ${email}`);

    res.json({ success: true, message: "Order confirmed and email sent successfully." });

  } catch (error) {
    console.error('❌ CLEARANCE FAILED:', error.message);
    res.status(500).json({ success: false, message: "Internal clearance error." });
  }
});

/**
 * 4. VIEW ALL ORDERS (GET /api/orders)
 */
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, p.name as part_name, p.category
      FROM public.orders o
      LEFT JOIN public.parts p ON o.part_id = p.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve records.' });
  }
});

export default router;