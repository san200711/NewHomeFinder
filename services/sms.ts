/**
 * SMS Service for OTP Verification
 * Using Twilio SMS API
 * 
 * Setup Instructions:
 * 1. Sign up at https://www.twilio.com
 * 2. Get your Account SID and Auth Token from the Twilio Console
 * 3. Get a Twilio phone number (or use trial number)
 * 4. Add credentials to your .env file:
 *    TWILIO_ACCOUNT_SID=your_account_sid
 *    TWILIO_AUTH_TOKEN=your_auth_token
 *    TWILIO_PHONE_NUMBER=your_twilio_phone_number
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
 * Send OTP via Twilio SMS
 */
export async function sendOTP(mobile: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate mobile number format
    if (!mobile || mobile.length < 10) {
      return { success: false, message: 'Invalid mobile number' };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store OTP
    otpStorage.set(mobile, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Format mobile number for international format if needed
    const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile.replace(/^0+/, '')}`;

    // Twilio API credentials (from environment variables)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      console.warn('⚠️ Twilio credentials not configured. Using mock OTP: 123456');
      
      // Fallback to mock OTP for development
      otpStorage.set(mobile, {
        otp: '123456',
        expiresAt,
        attempts: 0,
      });

      return {
        success: true,
        message: 'OTP sent successfully (Mock Mode - Use: 123456)',
      };
    }

    // Send SMS via Twilio
    const message = `Your New Home Finder verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        },
        body: new URLSearchParams({
          To: formattedMobile,
          From: twilioNumber,
          Body: message,
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Twilio API error:', error);
      throw new Error(error.message || 'Failed to send SMS');
    }

    console.log(`✅ OTP sent to ${formattedMobile}`);

    return {
      success: true,
      message: `OTP sent successfully to ${formattedMobile}`,
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Verify OTP entered by user
 */
export async function verifyOTP(mobile: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const stored = otpStorage.get(mobile);

    if (!stored) {
      return {
        success: false,
        message: 'No OTP found. Please request a new one.',
      };
    }

    // Check if OTP has expired
    if (Date.now() > stored.expiresAt) {
      otpStorage.delete(mobile);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check max attempts
    if (stored.attempts >= MAX_ATTEMPTS) {
      otpStorage.delete(mobile);
      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      };
    }

    // Increment attempts
    stored.attempts += 1;

    // Verify OTP
    if (stored.otp !== otp) {
      return {
        success: false,
        message: `Invalid OTP. ${MAX_ATTEMPTS - stored.attempts} attempts remaining.`,
      };
    }

    // OTP verified successfully - remove from storage
    otpStorage.delete(mobile);

    console.log(`✅ OTP verified successfully for ${mobile}`);

    return {
      success: true,
      message: 'Mobile number verified successfully',
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP',
    };
  }
}

/**
 * Resend OTP to the same mobile number
 */
export async function resendOTP(mobile: string): Promise<{ success: boolean; message: string }> {
  // Clear existing OTP before sending new one
  otpStorage.delete(mobile);
  return sendOTP(mobile);
}

/**
 * Clear OTP from storage (useful for cleanup)
 */
export function clearOTP(mobile: string): void {
  otpStorage.delete(mobile);
}

/**
 * Alternative SMS Providers (commented examples)
 */

/**
 * MSG91 (Popular in India)
 * 
export async function sendOTPViaMSG91(mobile: string): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const otp = generateOTP();
  
  const response = await fetch(
    `https://api.msg91.com/api/v5/otp?authkey=${authKey}&mobile=${mobile}&otp=${otp}&template_id=${templateId}`,
    { method: 'POST' }
  );
  
  return response.ok;
}
*/

/**
 * Firebase Phone Authentication
 * Requires: npm install firebase
 * 
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export async function sendOTPViaFirebase(mobile: string): Promise<void> {
  const auth = getAuth();
  const appVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
  const confirmationResult = await signInWithPhoneNumber(auth, mobile, appVerifier);
  // Store confirmationResult for verification
}
*/

/**
 * AWS SNS
 * Requires: npm install @aws-sdk/client-sns
 * 
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export async function sendOTPViaAWS(mobile: string): Promise<void> {
  const client = new SNSClient({ region: 'us-east-1' });
  const otp = generateOTP();
  
  const command = new PublishCommand({
    Message: `Your OTP is: ${otp}`,
    PhoneNumber: mobile,
  });
  
  await client.send(command);
}
*/
