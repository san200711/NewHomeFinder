/**
 * Email OTP Service
 * Uses Resend API for real email delivery.
 * Falls back to mock mode (OTP: 123456) when not configured.
 */

import { EmailConfig } from '@/config/email.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OTPRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const OTP_STORAGE_KEY = '@nhf_otp_store';
const OTP_EXPIRY_MS = EmailConfig.OTP_EXPIRY_MINUTES * 60 * 1000;
const MAX_ATTEMPTS = EmailConfig.MAX_ATTEMPTS;

// ─── Persistent OTP storage (survives navigation) ────────────────────────────

async function getOTPRecord(email: string): Promise<OTPRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(`${OTP_STORAGE_KEY}:${email.toLowerCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setOTPRecord(email: string, record: OTPRecord): Promise<void> {
  await AsyncStorage.setItem(
    `${OTP_STORAGE_KEY}:${email.toLowerCase()}`,
    JSON.stringify(record)
  );
}

async function deleteOTPRecord(email: string): Promise<void> {
  await AsyncStorage.removeItem(`${OTP_STORAGE_KEY}:${email.toLowerCase()}`);
}

// ─── Generate OTP ─────────────────────────────────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, message: 'Invalid email address' };
  }

  const otp = EmailConfig.USE_MOCK_EMAIL ? '123456' : generateOTP();
  const record: OTPRecord = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  };

  await setOTPRecord(email, record);

  // ── Mock mode ──────────────────────────────────────────────────────────────
  if (EmailConfig.USE_MOCK_EMAIL) {
    console.log(`📧 [MOCK] OTP for ${email}: 123456`);
    return {
      success: true,
      message: `[DEV] Verification code sent to ${email} — use 123456`,
    };
  }

  // ── Real Resend API ────────────────────────────────────────────────────────
  const apiKey = EmailConfig.RESEND_API_KEY;
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    // API key missing — auto-fall back to mock
    console.warn('⚠️  Resend API key not set. Using mock OTP: 123456');
    await setOTPRecord(email, { otp: '123456', expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
    return {
      success: true,
      message: `Verification code sent to ${email} (mock: use 123456)`,
    };
  }

  try {
    const html = buildEmailHtml(otp);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: EmailConfig.EMAIL_FROM,
        to: email,
        subject: `${otp} is your ${EmailConfig.APP_NAME} verification code`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message || `HTTP ${res.status}`);
    }

    console.log(`✅ OTP emailed to ${email}`);
    return { success: true, message: `Verification code sent to ${email}` };
  } catch (error: any) {
    console.error('Resend error:', error.message);
    // Fall back to mock so the app still works during development
    await setOTPRecord(email, { otp: '123456', expiresAt: Date.now() + OTP_EXPIRY_MS, attempts: 0 });
    return {
      success: true,
      message: `Could not send email (${error.message}). Using mock OTP: 123456`,
    };
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOTP(
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  const record = await getOTPRecord(email);

  if (!record) {
    return { success: false, message: 'No verification code found. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    await deleteOTPRecord(email);
    return { success: false, message: 'Verification code expired. Please request a new one.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await deleteOTPRecord(email);
    return {
      success: false,
      message: 'Too many attempts. Please request a new verification code.',
    };
  }

  // Increment attempts
  record.attempts += 1;
  await setOTPRecord(email, record);

  if (record.otp !== otp.trim()) {
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      success: false,
      message: `Incorrect code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'No attempts left.'}`,
    };
  }

  // ✅ Correct
  await deleteOTPRecord(email);
  return { success: true, message: 'Email verified successfully.' };
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export async function resendOTP(email: string): Promise<{ success: boolean; message: string }> {
  await deleteOTPRecord(email);
  return sendOTP(email);
}

export async function clearOTP(email: string): Promise<void> {
  await deleteOTPRecord(email);
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildEmailHtml(otp: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F0F4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(37,99,235,0.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:40px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">🏡</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">${EmailConfig.APP_NAME}</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Email Verification</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <h2 style="margin:0 0 12px;color:#0F172A;font-size:20px;font-weight:600;">Your Verification Code</h2>
            <p style="margin:0 0 32px;color:#64748B;font-size:15px;line-height:1.6;">
              Enter the code below to verify your email address. It expires in <strong>${EmailConfig.OTP_EXPIRY_MINUTES} minutes</strong>.
            </p>
            <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);border-radius:16px;padding:28px;text-align:center;margin:0 0 32px;">
              <span style="font-size:44px;font-weight:700;color:#fff;letter-spacing:10px;font-family:'Courier New',monospace;">${otp}</span>
            </div>
            <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
              If you did not request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px;background:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">© ${new Date().getFullYear()} ${EmailConfig.APP_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
