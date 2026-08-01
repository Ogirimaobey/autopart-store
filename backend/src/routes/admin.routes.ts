import express from 'express';
import { getAllUsers, toggleUserBan, approveVendor, getPlatformStats } from '../controllers/admin.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require ADMIN access
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleUserBan);
router.put('/users/:id/approve-vendor', approveVendor);
router.get('/stats', getPlatformStats);

export default router;
