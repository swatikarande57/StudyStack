import * as authService from '../services/authService.js';
import { sendTeacherOtp } from '../services/emailService.js';

// In-memory OTP store: { email -> { otp, expiresAt } }
const otpStore = new Map();

export async function forgotPassword(req, res) {
  try {
    const result = await authService.forgotPassword(
      req.body.email,
      req.body.redirectTo ?? `${req.protocol}://${req.get('host')}/reset-password`
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const result = await authService.resetPassword(
      req.body.accessToken,
      req.body.refreshToken,
      req.body.password
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Generate a 6-digit OTP and send it to the teacher's email
export async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt });
    await sendTeacherOtp(email, otp);

    res.json({ success: true, message: 'OTP sent to ' + email });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
}

// Verify an OTP entered by the teacher
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const record = otpStore.get(email.toLowerCase());
    if (!record) return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp.toString()) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
    }

    otpStore.delete(email.toLowerCase()); // consume OTP
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
