# Quick Email OTP Setup Guide

## Current Status: Mock Mode (Development)

Your app is currently using **Mock Email Mode** for OTP verification.
- All verification codes are: `123456`
- No emails are actually sent
- Perfect for testing and development

---

## Enable Real Email Sending (3 Minutes)

### Step 1: Get Resend API Key (FREE)

1. Go to **https://resend.com/signup**
2. Sign up with your email (no credit card needed)
3. Verify your email
4. Go to **https://resend.com/api-keys**
5. Click "Create API Key"
6. Copy the key (starts with `re_...`)

### Step 2: Configure Your App

1. Open `config/email.config.ts` in your project
2. Make these changes:

```typescript
export const EmailConfig = {
  // Change this to false
  USE_MOCK_EMAIL: false,

  // Paste your API key here
  RESEND_API_KEY: 're_paste_your_key_here',

  // Keep this for testing (or use your domain)
  EMAIL_FROM: 'onboarding@resend.dev',

  // Rest stays the same
  APP_NAME: 'New Home Finder',
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
};
```

3. Save the file
4. Restart your app

### Step 3: Test It

1. Register with your real email address
2. Check your inbox (arrives in ~5 seconds)
3. Enter the 6-digit code
4. Done! ✅

---

## Resend Free Tier

- ✅ **3,000 emails per month** (100/day)
- ✅ No credit card required
- ✅ No expiration
- ✅ Perfect for development and small apps

---

## Troubleshooting

### "Email not received"

**Check these:**
1. ✅ Spam/junk folder
2. ✅ Correct email address (no typos)
3. ✅ API key is correct in `config/email.config.ts`
4. ✅ `USE_MOCK_EMAIL` is set to `false`
5. ✅ App was restarted after config change

**Check console logs:**
- Look for `✅ OTP sent to...` (success)
- Or `❌ Resend API key not configured` (needs setup)

### "Invalid API key"

1. Make sure you copied the entire key (starts with `re_`)
2. No extra spaces or quotes
3. Key is still active at https://resend.com/api-keys

### "Emails going to spam"

**For testing:**
- Use `onboarding@resend.dev` as sender (already configured)

**For production:**
1. Verify your own domain at https://resend.com/domains
2. Update `EMAIL_FROM` to your domain

---

## Production Setup (Optional)

### Verify Your Domain

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown
5. Wait for verification (~10 minutes)
6. Update config:

```typescript
EMAIL_FROM: 'noreply@yourdomain.com',
```

**Benefits:**
- ✅ Better deliverability
- ✅ Professional sender address
- ✅ No spam folder issues
- ✅ Custom email templates

---

## Alternative Providers

### SendGrid (More established)
- Free: 100 emails/day
- Setup: https://sendgrid.com
- More complex setup

### Mailgun (High volume)
- Free: 5,000/month (first 3 months)
- Requires credit card
- Setup: https://mailgun.com

### AWS SES (Cheapest at scale)
- $0.10 per 1,000 emails
- Requires AWS account
- More complex setup

**To switch providers:**
Check the commented examples in `services/email.ts`

---

## Support

**Email service not working?**
1. Check console for error messages
2. Verify config in `config/email.config.ts`
3. Test with mock mode first (set `USE_MOCK_EMAIL: true`)

**Resend Support:**
- Docs: https://resend.com/docs
- Email: support@resend.com

---

## Development vs Production

### Development (Current)
```typescript
USE_MOCK_EMAIL: true  // No real emails, OTP always 123456
```

### Production
```typescript
USE_MOCK_EMAIL: false  // Real emails via Resend
RESEND_API_KEY: 're_your_real_key'
EMAIL_FROM: 'noreply@yourdomain.com'
```

---

## Quick Test Checklist

- [ ] Sign up at Resend.com
- [ ] Get API key
- [ ] Edit `config/email.config.ts`
- [ ] Set `USE_MOCK_EMAIL: false`
- [ ] Paste your API key
- [ ] Save file
- [ ] Restart app
- [ ] Test registration with real email
- [ ] Check inbox
- [ ] Verify OTP works

**Setup time: ~3 minutes**
**Free tier: 3,000 emails/month**

---

That's it! Your real-time email OTP is ready! 🎉
