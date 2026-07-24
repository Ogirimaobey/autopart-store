import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp'; // Standard for image processing
import fs from 'fs';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import { 
  createPart, 
  fetchStorefrontParts, 
  fetchSinglePart, 
  updatePartData, 
  removePartFromStore 
} from '../service/partService.js';

const router = express.Router();

/**
 * 1. MULTER CONFIGURATION
 * We use MemoryStorage to allow Sharp to inspect the file before saving.
 */
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

/**
 * 2. UPLOAD NEW PART (POST /api/parts)
 * Now includes a Format Guard for older macOS environments.
 */
router.post('/', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  console.log("--- 🏁 STARTING UPLOAD PROCESS ---");
  try {
    const { name, price, discount_price, oem, category, condition, selar_link } = req.body;
    
    if (!req.file) {
      console.log("❌ ERROR: No file reached the backend buffer.");
      return res.status(400).json({ 
        success: false, 
        message: "Oga, please select a photo for the spare part first." 
      });
    }

    console.log(`📦 File Received: ${req.file.originalname} (${req.file.mimetype})`);

    // Ensure 'uploads' folder exists physically on your Mac
    if (!fs.existsSync('uploads')) {
      console.log("📁 Creating missing 'uploads' folder...");
      fs.mkdirSync('uploads');
    }

    const filename = `part-${Date.now()}.jpg`;
    const outputPath = path.join('uploads', filename);

    /**
     * SENIOR FORMAT GUARD
     * If the file is HEIC/HEIF and the system (macOS 11) can't decode it,
     * we catch the error here to prevent a server crash.
     */
    console.log("⚙️  Attempting Sharp conversion & rotation...");
    try {
      await sharp(req.file.buffer)
        .rotate() // Autocorrects orientation
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      console.log(`✅ Sharp Success: File saved to ${outputPath}`);
    } catch (sharpErr) {
      console.error("❌ SHARP ERROR:", sharpErr.message);
      
      // Check if the error is specifically about missing format support
      if (sharpErr.message.includes('unsupported') || sharpErr.message.includes('heif')) {
        return res.status(400).json({ 
          success: false, 
          message: "Oga, your MacBook doesn't support iPhone photos (HEIC) directly yet. Please take a screenshot of the photo (Cmd+Shift+4) and upload that instead!" 
        });
      }
      throw sharpErr;
    }

    const image_url = `/uploads/${filename}`;

    const result = await createPart({ 
      name, 
      price, 
      discount_price: discount_price || 0,
      oem, 
      category, 
      condition, 
      image_url, 
      selar_link 
    });
    
    console.log(`🚀 PART SUCCESSFULLY PUBLISHED: ${name}`);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error("🏁 PROCESS FAILED:", err.message);
    res.status(500).json({ success: false, message: "Oga, something went wrong on our end: " + err.message });
  }
});

/**
 * 3. VIEW ALL PARTS (GET /api/parts)
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query; 
    const result = await fetchStorefrontParts(category);
    res.status(200).json(result); 
  } catch (err) {
    console.error("Warehouse Load Error:", err.message);
    res.status(500).json({ success: false, message: "Oga, we could not load the warehouse right now." });
  }
});

/**
 * 4. VIEW SINGLE PART (GET /api/parts/:id)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await fetchSinglePart(id);
    
    if (!result) {
      return res.status(404).json({ success: false, message: "This part doesn't exist." });
    }
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error retrieving details." });
  }
});

/**
 * 5. EDIT PART DATA (PUT /api/parts/:id)
 */
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await updatePartData(id, updateData);
    console.log(`🔄 Part ID ${id} database updated.`);
    res.status(200).json({ success: true, message: "Changes saved!", ...result });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * 6. DELETE PART (DELETE /api/parts/:id)
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await removePartFromStore(id);
    
    console.log(`🗑️ Part ID ${id} removed.`);
    res.status(200).json({ success: true, message: "Part removed from store." });
  } catch (err) {
    console.error("Deletion Error:", err.message);
    res.status(404).json({ success: false, message: "Delete failed: " + err.message });
  }
});

export default router;