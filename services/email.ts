/**
 * Email Service for OTP Verification
 * Using Resend Email API
 * 
 * Setup Instructions:
 * 1. Sign up at https://resend.com
 * 2. Get your API key from the dashboard
 * 3. Verify your domain (or use onboarding@resend.dev for testing)
 * 4. Add credentials to your .env file:
 *    RESEND_API_KEY=re_your_api_key_here
 *    EMAIL_FROM=onboarding@resend.dev
 */

interface OTPStorage {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// In-memory storage for OTPs (for production, use Redis or database)
const otpStorage = new Map<string, OTPStorage>();

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Email using Resend
 */
export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, message: 'Invalid email address' };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store OTP
    otpStorage.set(email.toLowerCase(), {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Resend API credentials (from environment variables)
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    if (!apiKey) {
      console.warn('⚠️ Resend API key not configured. Using mock OTP: 123456');
      
      // Fallback to mock OTP for development
      otpStorage.set(email.toLowerCase(), {
        otp: '123456',
        expiresAt,
        attempts: 0,
      });

      return {
        success: true,
        message: 'OTP sent successfully (Mock Mode - Use: 123456)',
      };
    }

    // Send Email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="padding: 48px 40px; text-align: center; background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); border-radius: 16px 16px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🏡 New Home Finder</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 24px; font-weight: 600;">Your Verification Code</h2>
                      <p style="margin: 0 0 32px; color: #64748b; font-size: 16px; line-height: 1.6;">
                        Enter this code to verify your email address and complete your registration:
                      </p>
                      <div style="background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                        <div style="font-size: 48px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${otp}
                        </div>
                      </div>
                      <p style="margin: 32px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        This code will expire in <strong style="color: #2563EB;">${OTP_EXPIRY_MINUTES} minutes</strong>.
                      </p>
                      <p style="margin: 16px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                        If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        © ${new Date().getFullYear()} New Home Finder. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: `Your New Home Finder verification code: ${otp}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      throw new Error(error.message || 'Failed to send email');
    }

    const result = await response.json();
    console.log(`✅ OTP sent to ${email} (ID: ${result.id})`);

    return {
      success: true,
      message: `Verification code sent to ${email}`,
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send verification email',
    };
  }
}

/**
 * Verify OTP entered by user
 */
export async function verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const stored = otpStorage.get(email.toLowerCase());

    if (!stored) {
      return {
        success: false,
        message: 'No verification code found. Please request a new one.',
      };
    }

    // Check if OTP has expired
    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(email.toLowerCase());
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      };
    }

    // Check max attempts
    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStorage.delete(email.toLowerCase());
      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.',
      };
    }

    // Increment attempts
    stored.attempts += 1;

    // Verify OTP
    if (stored.otp !== otp) {
      return {
        success: false,
        message: `Invalid verification code. ${MAX_ATTEMPTS - stored.attempts} attempts remaining.`,
      };
    }

    // OTP verified successfully - remove from storage
    otpStorage.delete(email.toLowerCase());

    console.log(`✅ OTP verified successfully for ${email}`);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify code',
    };
  }
}

/**
 * Resend OTP to the same email
 */
export async function resendOTP(email: string): Promise<{ success: boolean; message: string }> {
  // Clear existing OTP before sending new one
  otpStorage.delete(email.toLowerCase());
  return sendOTP(email);
}

/**
 * Clear OTP from storage (useful for cleanup)
 */
export function clearOTP(email: string): void {
  otpStorage.delete(email.toLowerCase());
}

/**
 * Alternative Email Providers (commented examples)
 */

/**
 * SendGrid
 * 
export async function sendOTPViaSendGrid(email: string): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const otp = generateOTP();
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: 'noreply@yourdomain.com' },
      subject: 'Your verification code',
      content: [{ type: 'text/html', value: `Your OTP is: ${otp}` }],
    }),
  });
  
  return response.ok;
}
*/

/**
 * AWS SES
 * Requires: npm install @aws-sdk/client-ses
 * 
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export async function sendOTPViaAWS(email: string): Promise<void> {
  const client = new SESClient({ region: 'us-east-1' });
  const otp = generateOTP();
  
  const command = new SendEmailCommand({
    Source: 'noreply@yourdomain.com',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Your verification code' },
      Body: { Html: { Data: `Your OTP is: ${otp}` } },
    },
  });
  
  await client.send(command);
}
*/

/**
 * Mailgun
 * 
export async function sendOTPViaMailgun(email: string): Promise<boolean> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const otp = generateOTP();
  
  const formData = new URLSearchParams({
    from: `New Home Finder <noreply@${domain}>`,
    to: email,
    subject: 'Your verification code',
    html: `Your OTP is: ${otp}`,
  });
  
  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`api:${apiKey}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  
  return response.ok;
}
*/
