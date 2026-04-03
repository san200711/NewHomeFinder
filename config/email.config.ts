/**
 * Email Configuration — New Home Finder
 *
 * HOW TO ENABLE REAL EMAIL OTP:
 * ─────────────────────────────
 * 1. Sign up at https://resend.com (free: 3,000 emails/month)
 * 2. Go to https://resend.com/api-keys → Create API Key
 * 3. In the app, go to Settings → Developer → enter your API key
 *    (The key is saved securely on-device; no server needed.)
 *
 * SENDER ADDRESS:
 *   • Testing  → use 'onboarding@resend.dev' (works for any recipient)
 *   • Production → 'noreply@yourdomain.com' (requires domain verification at resend.com/domains)
 */

export const EmailConfig = {
  /** false = real Resend emails; true = mock mode (OTP always 123456) */
  USE_MOCK_EMAIL: false,

  /**
   * Fallback API key — leave as empty string.
   * The real key is entered in-app via Settings → Developer and stored securely.
   */
  RESEND_API_KEY: '',

  /**
   * Sender address shown in the email.
   * 'onboarding@resend.dev' works without domain setup (Resend test address).
   */
  EMAIL_FROM: 'onboarding@resend.dev',

  /** App name shown in email subject & body */
  APP_NAME: 'New Home Finder',

  /** OTP configuration */
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
};
