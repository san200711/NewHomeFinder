# SMS OTP Setup Guide

This guide will help you set up real mobile number verification using SMS OTP.

## Recommended Provider: Twilio

Twilio is the most popular and reliable SMS API provider with excellent documentation and support.

### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

### Step 2: Get Your Credentials

1. After logging in, go to the [Twilio Console](https://console.twilio.com/)
2. You'll find these on the dashboard:
   - **Account SID**: A long string starting with "AC..."
   - **Auth Token**: Click "Show" to reveal it

### Step 3: Get a Phone Number

1. In the Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a number with SMS capabilities
3. For trial accounts:
   - You get $15 free credit
   - Can only send to verified numbers
   - Messages include "Sent from your Twilio trial account"

### Step 4: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`):

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

2. Make sure `.env` is in your `.gitignore` file (it already should be)

### Step 5: Test the Integration

1. Run your app
2. Try to register with a real mobile number
3. You should receive an SMS with the OTP code

## Trial Account Limitations

Twilio trial accounts have some limitations:
- Can only send SMS to verified phone numbers
- $15 free credit (~500 SMS messages)
- Messages include trial account notice
- Limited to certain countries

To verify phone numbers during trial:
1. Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Add and verify the numbers you want to test with

## Production Setup

For production use:
1. Upgrade your Twilio account (no credit card needed initially)
2. Add credits or set up auto-recharge
3. Remove verified number restrictions
4. Set up sender ID/alphanumeric sender (country-dependent)

## Alternative Providers

### MSG91 (Popular in India)

**Pros:**
- Cheaper rates for India
- Good for Indian market
- Support for local languages

**Setup:**
```javascript
// In services/sms.ts, uncomment MSG91 section
const authKey = process.env.MSG91_AUTH_KEY;
const templateId = process.env.MSG91_TEMPLATE_ID;
```

**Get credentials:**
1. Sign up at [https://msg91.com/](https://msg91.com/)
2. Get Auth Key from Settings
3. Create SMS template and get Template ID

### Firebase Phone Authentication

**Pros:**
- Free tier available
- Integrates with Firebase Auth
- Automatic spam protection

**Cons:**
- Requires additional Firebase setup
- More complex integration

### AWS SNS

**Pros:**
- Part of AWS ecosystem
- Pay-as-you-go pricing
- High reliability

**Cons:**
- Requires AWS account setup
- More complex configuration

## Cost Comparison

| Provider | India SMS | US SMS | Free Tier |
|----------|-----------|---------|-----------|
| Twilio | $0.0074 | $0.0079 | $15 credit |
| MSG91 | ₹0.15 | - | 100 SMS free |
| Firebase | Free | Free | Limited |
| AWS SNS | $0.00645 | $0.00645 | Limited |

## Development Mode

If Twilio credentials are not configured, the app automatically falls back to mock mode:
- OTP is always: `123456`
- No SMS is sent
- Perfect for development and testing

Check console for this message:
```
⚠️ Twilio credentials not configured. Using mock OTP: 123456
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment variables** in production (Vercel, Netlify, etc.)
3. **Implement rate limiting** to prevent abuse
4. **Use HTTPS** for all API calls
5. **Set OTP expiration** (currently 10 minutes)
6. **Limit retry attempts** (currently 3 attempts)
7. **Clear OTP after verification**

## Troubleshooting

### SMS not received

1. Check Twilio logs in the console
2. Verify phone number format (must include country code)
3. Check if number is verified (for trial accounts)
4. Check your Twilio balance

### Invalid credentials error

1. Verify Account SID and Auth Token
2. Make sure there are no extra spaces
3. Check if Auth Token was regenerated

### Rate limiting issues

Twilio has default rate limits:
- 100 SMS per account per day (trial)
- Upgrade account to increase limits

## Support

- **Twilio Documentation**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Twilio Support**: Available in console
- **SMS Service Code**: Check `services/sms.ts` for implementation details

## Next Steps

Once SMS is working:
1. Add rate limiting to prevent spam
2. Store OTPs in database instead of memory (for production)
3. Add resend OTP functionality with cooldown
4. Implement phone number verification badge in profile
5. Add SMS notification preferences
