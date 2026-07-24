import pool from './src/config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * World-Class Admin Seeding
 * This ensures your local database always has an authorized 'AutoPro' manager.
 */
export const permanentAdmin = async () => {
  try {
    const adminEmail = 'ogirima@fundbridgeafrica.online';
    const adminPhone = '09025643150';
    const adminPassword = 'password123'; // Change this for your final version
    const fullName = 'Ogirima Obey';

    // 1. Check if the admin already exists in your local database
    const checkAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone_number = $2', 
      [adminEmail, adminPhone]
    );

    if (checkAdmin.rows.length === 0) {
      console.log('🔑 [Seed] Creating Master Admin account...');

      // 2. Securely scramble the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // 3. Insert the admin into the 'users' table with full privileges
      await pool.query(
        `INSERT INTO users (full_name, phone_number, email, password_hash, is_admin, user_type) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [fullName, adminPhone, adminEmail, hashedPassword, true, 'admin']
      );

      console.log('✅ [Seed] Master Admin created successfully.');
      console.log(`📧 Email: ${adminEmail}`);
      console.log('-----------------------------------------');
    } else {
      console.log('ℹ️ [Seed] Admin account already exists. Skipping...');
    }
  } catch (error) {
    console.error('❌ [Seed] Error creating admin:', error.message);
  }
};