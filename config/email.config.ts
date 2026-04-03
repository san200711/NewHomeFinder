/**
 * Email Configuration
 * 
 * To use real email OTP:
 * 1. Sign up at https://resend.com (free tier: 3,000 emails/month)
 * 2. Get your API key from the dashboard
 * 3. Replace the values below with your credentials
 * 
 * For testing, leave USE_MOCK_EMAIL as true to use mock OTP (123456)
 */

export const EmailConfig = {
  // Set to false when you have real Resend credentials
  USE_MOCK_EMAIL: true,

  // Your Resend API Key (get from https://resend.com/api-keys)
  RESEND_API_KEY: 'your_resend_api_key_here',

  // Email sender address
  // For testing: 'onboarding@resend.dev'
  // For production: 'noreply@yourdomain.com' (requires domain verification)
  EMAIL_FROM: 'onboarding@resend.dev',

  // Your app name (appears in emails)
  APP_NAME: 'New Home Finder',

  // OTP settings
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
};
