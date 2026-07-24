import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * World-Class Database Connection (Local Version)
 * Optimized for local development on your laptop.
 */
const pool = new Pool({
  // This pulls your local credentials from the .env file
  connectionString: process.env.DATABASE_URL,
  
  /* TOUCHED: Removed the 'ssl' object. 
     We don't need secure certificates while working locally.
     We will add this back only when we are ready to host on Render or AWS.
  */
});

// Listener to confirm the 'pipes' are connected
pool.on('connect', () => {
  console.log('-----------------------------------------');
  console.log('✅ [Database] Connected to local PostgreSQL');
  console.log('-----------------------------------------');
});

// Error handling to prevent the app from crashing silently
pool.on('error', (err) => {
  console.error('❌ [Database] Connection Error:', err.message);
  process.exit(-1);
});

export default pool;