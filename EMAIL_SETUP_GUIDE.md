# Email OTP Setup Guide

This guide will help you set up real-time email verification using OTP (One-Time Password).

## Recommended Provider: Resend

Resend is a modern, developer-friendly email API service with excellent deliverability and a generous free tier.

### Step 1: Create Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up for a free account (no credit card required)
3. Verify your email address

### Step 2: Get Your API Key

1. After logging in, go to the [API Keys](https://resend.com/api-keys) page
2. Click "Create API Key"
3. Give it a name (e.g., "New Home Finder App")
4. Copy the API key (starts with `re_...`)
5. **Important**: Save it securely - you won't be able to see it again!

### Step 3: Domain Setup (Optional for Production)

For production use, verify your own domain:

1. Go to [Domains](https://resend.com/domains) in the Resend dashboard
2. Click "Add Domain"
3. Add your domain (e.g., `yourdomain.com`)
4. Follow the DNS configuration steps
5. Wait for verification (usually takes a few minutes)

**For Testing**: You can use the default `onboarding@resend.dev` sender address without domain verification.

### Step 4: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`):

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here

# Email sender address
# For testing: onboarding@resend.dev
# For production: noreply@yourdomain.com
EMAIL_FROM=onboarding@resend.dev
```

2. Make sure `.env` is in your `.gitignore` file (it already should be)

### Step 5: Test the Integration

1. Run your app
2. Try to register with a real email address
3. Check your email inbox for the verification code
4. The email should arrive within seconds

## Free Tier Limits

Resend free tier includes:
- **3,000 emails per month**
- **100 emails per day**
- Perfect for development and small apps
- No credit card required

## Email Template

The OTP email includes:
- ✅ Professional branded design
- ✅ Large, easy-to-read verification code
- ✅ Expiration time (10 minutes)
- ✅ Security notice
- ✅ Mobile-responsive HTML

## Alternative Providers

### SendGrid

**Pros:**
- Established provider
- Good deliverability
- Detailed analytics

**Free Tier:**
- 100 emails per day
- More complex setup

**Setup:**
```javascript
// In services/email.ts, uncomment SendGrid section
const apiKey = process.env.SENDGRID_API_KEY;
```

**Get credentials:**
1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Get API Key from Settings → API Keys
3. Verify sender email address

### Mailgun

**Pros:**
- Good for high volume
- Competitive pricing
- Email validation API

**Free Tier:**
- 5,000 emails per month (first 3 months)
- Requires credit card

**Setup:**
```javascript
// In services/email.ts, uncomment Mailgun section
const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
```

### AWS SES (Simple Email Service)

**Pros:**
- Part of AWS ecosystem
- Very cheap ($0.10 per 1,000 emails)
- High reliability

**Cons:**
- Requires AWS account
- Starts in sandbox mode (need to request production access)
- More complex setup

**Free Tier:**
- 62,000 emails per month (when sending from EC2)

## Cost Comparison

| Provider | Free Tier | Paid Pricing | Best For |
|----------|-----------|--------------|----------|
| Resend | 3,000/month | $20/month for 50K | Modern apps, developers |
| SendGrid | 100/day | $15/month for 40K | Established businesses |
| Mailgun | 5K/month (3mo) | $35/month for 50K | High volume |
| AWS SES | 62K/month* | $0.10 per 1K | AWS users |

*From EC2 only

## Development Mode

If Resend API key is not configured, the app automatically falls back to mock mode:
- OTP is always: `123456`
- No email is sent
- Perfect for development and testing

Check console for this message:
```
⚠️ Resend API key not configured. Using mock OTP: 123456
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment variables** in production (Vercel, Netlify, etc.)
3. **Implement rate limiting** to prevent abuse
4. **Use HTTPS** for all API calls
5. **Set OTP expiration** (currently 10 minutes)
6. **Limit retry attempts** (currently 3 attempts)
7. **Clear OTP after verification**
8. **Use verified domains** in production
9. **Monitor email bounces** and complaints
10. **Add unsubscribe links** for marketing emails (not needed for transactional OTPs)

## Troubleshooting

### Email not received

1. **Check spam/junk folder** - First-time senders often land in spam
2. **Verify email address** - Make sure there are no typos
3. **Check Resend logs** - Go to Resend dashboard → Emails
4. **Check API key** - Make sure it's correct and active
5. **Rate limits** - Check if you've exceeded daily/monthly limits
6. **Domain verification** - For custom domains, ensure DNS is configured

### Invalid API key error

1. Verify the API key in your `.env` file
2. Make sure there are no extra spaces or quotes
3. Check if the key was deleted or regenerated
4. Create a new API key if needed

### Emails marked as spam

1. **Verify your domain** - Unverified domains have higher spam rates
2. **Add SPF/DKIM records** - Resend provides these automatically
3. **Use a professional sender name** - Not "test@example.com"
4. **Avoid spam trigger words** - Don't overuse "FREE", "URGENT", etc.
5. **Warm up new domains** - Start with small volumes

### Rate limiting

Resend rate limits:
- 100 emails per day (free tier)
- 3,000 emails per month (free tier)
- Upgrade to paid plan for higher limits

## Email Deliverability Tips

1. **Use verified domains** - Much better deliverability
2. **Consistent sender address** - Don't change frequently
3. **Professional content** - Well-formatted HTML
4. **Monitor bounce rates** - Remove invalid addresses
5. **Test with multiple providers** - Gmail, Outlook, Yahoo, etc.

## Monitoring & Analytics

Resend dashboard provides:
- ✅ Email delivery status
- ✅ Open rates (for marketing emails)
- ✅ Bounce tracking
- ✅ Error logs
- ✅ API usage statistics

## Support

- **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)
- **Resend Support**: support@resend.com
- **Email Service Code**: Check `services/email.ts` for implementation details
- **Community**: [Resend Discord](https://resend.com/discord)

## Next Steps

Once email is working:
1. ✅ Add rate limiting to prevent spam
2. ✅ Store OTPs in database instead of memory (for production)
3. ✅ Add resend OTP functionality with cooldown
4. ✅ Implement email verification badge in profile
5. ✅ Add email notification preferences
6. ✅ Set up email templates for other notifications
7. ✅ Add password reset via email
8. ✅ Add welcome emails for new users
9. ✅ Monitor email bounces and update user status

## Production Checklist

Before going live:
- [ ] Verify your domain
- [ ] Set up SPF, DKIM, and DMARC records
- [ ] Test with multiple email providers
- [ ] Set up error monitoring
- [ ] Implement rate limiting
- [ ] Add email queue for high volume
- [ ] Set up bounce handling
- [ ] Create email templates for all scenarios
- [ ] Add unsubscribe functionality (if needed)
- [ ] Monitor deliverability metrics
