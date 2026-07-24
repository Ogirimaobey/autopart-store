import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Create a physical folder on your laptop named 'uploads' if it doesn't exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Define the Local Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in the 'uploads' folder
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // We give the file a unique name using the current time
    // Example: 17000000000-brake-pad.jpg
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// 3. Filter to ensure only car part images are uploaded (no dangerous files)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
  }
};

// 4. Create the upload tool with a 5MB size limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter
});

export default upload;