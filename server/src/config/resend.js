import { Resend } from 'resend';

const resendKey = process.env.RESEND_API_KEY;

if (!resendKey) {
  console.warn('WARNING: RESEND_API_KEY is missing in server/.env');
}

export const resend = new Resend(resendKey);
