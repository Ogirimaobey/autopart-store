import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from "cors";
import path from 'path';
import fs from 'fs'; 
import { fileURLToPath } from 'url';

// --- 1. ROUTE IMPORTS ---
import adminRoutes from './src/routes/adminRoutes.js';
import partRoutes from './src/routes/partRoutes.js'; 
import orderRoutes from './src/routes/orderRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// --- 2. MIDDLEWARE & SAFETY HANDSHAKES ---
app.use(cookieParser());

/**
 * CORS CONFIGURATION (The Handshake)
 * We set this to a "Wide Open" state for your local development to 
 * ensure the receipt uploads never get blocked by browser security.
 */
app.use(cors({ 
    origin: true, 
    credentials: true
}));

// Payload limits for high-resolution engine/receipt photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * DIRECTORY SAFETY SYSTEM
 * This code ensures your 'uploads' folder is physically present 
 * on your computer so the 'multer' tool has a place to drop files.
 */
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    console.log("📁 Creating missing 'uploads' directory...");
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve the folder so images can be viewed at http://localhost:5000/uploads/file.jpg
app.use('/uploads', express.static(uploadDir));

// --- 3. THE BUSINESS CORRIDORS (API ENDPOINTS) ---

// Root check
app.get('/', (req, res) => {
    res.send("AutoPart Pro API is Live and Robust.");
});

// Main Route Gateways
app.use('/api/admin', adminRoutes);  
app.use('/api/parts', partRoutes);   
app.use('/api/orders', orderRoutes); 

// --- 4. ENGINE IGNITION (SERVER STARTUP) ---
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
      -----------------------------------------------
      🚀 AutoPart Pro Backend Engine Ignited
      📍 Port: ${PORT}
      🛠️ Mode: Development
      📸 Assets: http://localhost:${PORT}/uploads
      -----------------------------------------------
      `);
    });
  } catch (error) {
    console.error("❌ The engine failed to ignite:", error.message);
  }
};

startServer();