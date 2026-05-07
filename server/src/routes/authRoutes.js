import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/otp/send', authController.sendOtp);
router.post('/otp/verify', authController.verifyOtp);

export default router;
