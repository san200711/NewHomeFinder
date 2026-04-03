/**
 * Email OTP Service — New Home Finder
 *
 * - Real emails via Resend API (https://resend.com)
 * - API key stored securely on-device via AsyncStorage
 * - Auto-fallback to mock OTP (123456) when key not configured
 * - OTP records persisted in AsyncStorage (survives navigation)
 */

import { EmailConfig } from '@/config/email.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const OTP_PREFIX = '@nhf_otp:';
const RESEND_KEY_STORE = '@nhf_resend_api_key';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OTPRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// ─── API key helpers ──────────────────────────────────────────────────────────

/** Retrieve the Resend API key saved by the user in Settings */
export async function getStoredApiKey(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(RESEND_KEY_STORE);
    return stored || EmailConfig.RESEND_API_KEY || '';
  } catch {
    return EmailConfig.RESEND_API_KEY || '';
  }
}

/** Save the Resend API key the user enters in Settings */
export async function saveApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(RESEND_KEY_STORE, key.trim());
}

/** Clear the stored API key */
export async function clearApiKey(): Promise<void> {
  await AsyncStorage.removeItem(RESEND_KEY_STORE);
}

/** Check whether a real API key has been configured */
export async function isRealEmailConfigured(): Promise<boolean> {
  if (EmailConfig.USE_MOCK_EMAIL) return false;
  const key = await getStoredApiKey();
  return key.length > 0 && key !== 'your_resend_api_key_here';
}

// ─── OTP record helpers ───────────────────────────────────────────────────────

async function getOTPRecord(email: string): Promise<OTPRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(`${OTP_PREFIX}${email.toLowerCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setOTPRecord(email: string, record: OTPRecord): Promise<void> {
  await AsyncStorage.setItem(
    `${OTP_PREFIX}${email.toLowerCase()}`,
    JSON.stringify(record)
  );
}

async function deleteOTPRecord(email: string): Promise<void> {
  await AsyncStorage.removeItem(`${OTP_PREFIX}${email.toLowerCase()}`);
}

// ─── OTP generator ────────────────────────────────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOTP(
  email: string
): Promise<{ success: boolean; message: string }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { success: false, message: 'Invalid email address.' };
  }

  const expiryMs = EmailConfig.OTP_EXPIRY_MINUTES * 60 * 1000;

  // ── Mock mode ──────────────────────────────────────────────────────────────
  if (EmailConfig.USE_MOCK_EMAIL) {
    await setOTPRecord(email, {
      otp: '123456',
      expiresAt: Date.now() + expiryMs,
      attempts: 0,
    });
    console.log(`[MOCK] OTP for ${email}: 123456`);
    return {
      success: true,
      message: `[DEV MODE] Use code: 123456`,
    };
  }

  // ── Real email ─────────────────────────────────────────────────────────────
  const apiKey = await getStoredApiKey();
  const isConfigured = apiKey.length > 0 && apiKey !== 'your_resend_api_key_here';

  if (!isConfigured) {
    // Graceful fallback — app still works without a key
    await setOTPRecord(email, {
      otp: '123456',
      expiresAt: Date.now() + expiryMs,
      attempts: 0,
    });
    console.warn('[Email] No API key configured. Using mock OTP: 123456');
    return {
      success: true,
      message: `No API key set. Use code: 123456 (go to Settings → Developer to add your Resend key)`,
    };
  }

  const otp = generateOTP();
  await setOTPRecord(email, { otp, expiresAt: Date.now() + expiryMs, attempts: 0 });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: EmailConfig.EMAIL_FROM,
        to: email,
        subject: `${otp} — Your ${EmailConfig.APP_NAME} verification code`,
        html: buildEmailHtml(otp),
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const errMsg = (errBody as any)?.message || `HTTP ${res.status}`;
      throw new Error(errMsg);
    }

    console.log(`[Email] OTP sent to ${email}`);
    return {
      success: true,
      message: `Verification code sent to ${email}. Check your inbox (and spam folder).`,
    };
  } catch (error: any) {
    console.error('[Email] Send failed:', error.message);

    // Override stored OTP with mock so the user can still proceed
    await setOTPRecord(email, { otp: '123456', expiresAt: Date.now() + expiryMs, attempts: 0 });

    const isAuthError = error.message?.includes('401') || error.message?.toLowerCase().includes('unauthorized');
    const hint = isAuthError
      ? 'Invalid API key. Go to Settings → Developer and re-enter your Resend key.'
      : `Email delivery failed (${error.message}). Using fallback code: 123456`;

    return { success: true, message: hint };
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOTP(
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  const record = await getOTPRecord(email);

  if (!record) {
    return {
      success: false,
      message: 'No verification code found. Please request a new one.',
    };
  }

  if (Date.now() > record.expiresAt) {
    await deleteOTPRecord(email);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new one.',
    };
  }

  if (record.attempts >= EmailConfig.MAX_ATTEMPTS) {
    await deleteOTPRecord(email);
    return {
      success: false,
      message: 'Too many incorrect attempts. Please request a new code.',
    };
  }

  record.attempts += 1;
  await setOTPRecord(email, record);

  if (record.otp !== otp.trim()) {
    const remaining = EmailConfig.MAX_ATTEMPTS - record.attempts;
    return {
      success: false,
      message:
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'No attempts left. Please request a new code.',
    };
  }

  await deleteOTPRecord(email);
  return { success: true, message: 'Email verified successfully.' };
}

// ─── Helpers re-exported for convenience ─────────────────────────────────────

export async function resendOTP(
  email: string
): Promise<{ success: boolean; message: string }> {
  await deleteOTPRecord(email);
  return sendOTP(email);
}

export async function clearOTP(email: string): Promise<void> {
  await deleteOTPRecord(email);
}

// ─── Email HTML template ──────────────────────────────────────────────────────

function buildEmailHtml(otp: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F0F4FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(37,99,235,0.13);" cellpadding="0" cellspacing="0">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2563EB 0%,#7C3AED 100%);padding:40px 32px;text-align:center;">
            <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:20px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <span style="font-size:36px;">🏡</span>
            </div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
              ${EmailConfig.APP_NAME}
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;">
              Email Verification
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 10px;color:#0F172A;font-size:20px;font-weight:700;">
              Your One-Time Code
            </h2>
            <p style="margin:0 0 28px;color:#64748B;font-size:15px;line-height:1.65;">
              Use the code below to verify your email address.<br>
              It expires in <strong>${EmailConfig.OTP_EXPIRY_MINUTES} minutes</strong>.
            </p>

            <!-- OTP box -->
            <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);border-radius:18px;padding:30px 24px;text-align:center;margin:0 0 28px;">
              <span style="font-size:46px;font-weight:800;color:#fff;letter-spacing:12px;font-family:'Courier New',Courier,monospace;">
                ${otp}
              </span>
            </div>

            <p style="margin:0;color:#94A3B8;font-size:13px;line-height:1.6;">
              If you didn't request this, you can safely ignore this email.<br>
              Never share this code with anyone.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 40px;background:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">
              © ${new Date().getFullYear()} ${EmailConfig.APP_NAME} · All rights reserved
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
