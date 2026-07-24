import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// We are pulling the secret address from your .env file
// Senior Note: This now points to Port 5433 which we verified in your terminal.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Senior Dev Check: This tells us immediately if the "Engine" is working
pool.on('connect', () => {
  console.log('--- DATABASE STATUS ---');
  console.log('Success: Connected to autoparts_db warehouse.');
});

// Error handling for when the "Engine" stalls
pool.on('error', (err) => {
  console.log('--- DATABASE ERROR ---');
  console.log('Omo, the database has an issue:', err.message);
});

// This exports the 'Master Key' so all your services can use it
export default pool;