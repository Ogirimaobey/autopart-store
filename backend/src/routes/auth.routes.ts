import express from 'express';
import { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
