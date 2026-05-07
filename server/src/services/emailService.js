import { resend } from '../config/resend.js';
import nodemailer from 'nodemailer';

/**
 * Sends a productivity alert to a student.
 * @param {string} to - Student email
 * @param {string} studentName - Student's name
 * @param {string} message - Personal message or analytical insight
 */
export const sendProductivityAlert = async (to, studentName, message) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Study-Stack <notifications@resend.dev>', // Use verified domain in prod
      to: [to],
      subject: `🔔 Study-Stack Alert for ${studentName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">Hello ${studentName}!</h2>
          <p style="font-size: 16px; color: #374151;">Your teacher has sent you a productivity insight:</p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #6366f1; font-style: italic; margin: 20px 0;">
            "${message}"
          </div>
          <p style="font-size: 14px; color: #6b7280;">Keep up the great work and stay on top of your goals!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Sent via Study-Stack Virtual Classroom</p>
        </div>
      `,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Resend Email Error:', error);
    throw error;
  }
};

/**
 * Sends a welcome email to a teacher.
 */
export const sendTeacherWelcome = async (to, name) => {
    try {
      await resend.emails.send({
        from: 'Study-Stack <welcome@resend.dev>',
        to: [to],
        subject: 'Welcome to Study-Stack Virtual Classroom!',
        html: `<h1>Welcome, Prof. ${name}!</h1><p>Your virtual classroom is ready.</p>`,
      });
    } catch (error) {
      console.error('Welcome Email Error:', error);
    }
};

/**
 * Sends a 6-digit OTP to a teacher's email via Nodemailer + Gmail.
 */
export const sendTeacherOtp = async (to, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in Render environment variables.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
  });

  const info = await transporter.sendMail({
    from: `"Study-Stack" <${emailUser}>`,
    to,
    subject: '🔑 Your Study-Stack Teacher Verification OTP',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background:#0f172a; color:#f1f5f9">
        <div style="text-align:center; margin-bottom:24px">
          <span style="font-size:32px; font-weight:900; font-style:italic; color:#6366f1">SS</span>
          <h2 style="margin:8px 0; color:#f1f5f9">Teacher Registration OTP</h2>
        </div>
        <p style="color:#94a3b8; font-size:14px">Use the following one-time password to complete your teacher registration. This OTP expires in <strong style="color:#f1f5f9">10 minutes</strong>.</p>
        <div style="text-align:center; margin:32px 0">
          <span style="font-size:48px; font-weight:900; letter-spacing:12px; color:#6366f1">${otp}</span>
        </div>
        <p style="color:#64748b; font-size:12px; text-align:center">Do not share this code with anyone.</p>
        <hr style="border:none; border-top:1px solid #1e293b; margin:24px 0">
        <p style="color:#475569; font-size:11px; text-align:center">Study-Stack Virtual Classroom</p>
      </div>
    `,
  });
  return info;
};
