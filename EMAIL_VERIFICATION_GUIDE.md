# Email Verification Configuration Guide

## Current Status

**Problem**: New user sign-ups require email verification, but SMTP is not configured in Supabase.

**Impact**: 
- New users cannot sign in after registration
- Must use existing test accounts for demo
- Not production-ready

**Current Workaround**: Use pre-verified test accounts

---

## Solution Options

### Option 1: Configure SMTP in Supabase (RECOMMENDED for Production)

#### Steps to Configure Email Verification:

1. **Access Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select project: `ivqljpbifavxzvebujiy`
   - Go to: Authentication → Email Templates

2. **Configure SMTP Settings**
   - Go to: Project Settings → Authentication
   - Scroll to "SMTP Settings"
   - Configure your SMTP provider:

**Option A: Use Gmail SMTP**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: [App Password - not regular password]
Sender Email: your-email@gmail.com
Sender Name: CuraLink
```

**Option B: Use SendGrid**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@yourdomain.com
Sender Name: CuraLink
```

**Option C: Use Mailgun**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@yourdomain.mailgun.org
SMTP Password: [Your Mailgun SMTP Password]
Sender Email: noreply@yourdomain.com
Sender Name: CuraLink
```

3. **Customize Email Templates**
   - Go to: Authentication → Email Templates
   - Edit "Confirm signup" template
   - Customize subject and body to match CuraLink branding

4. **Test Email Flow**
   - Create a new test account
   - Check inbox for confirmation email
   - Click confirmation link
   - Verify user can now sign in

---

### Option 2: Disable Email Confirmation (FOR DEMO ONLY - NOT RECOMMENDED)

**WARNING**: Only use this for demo/testing. Never in production.

#### Steps to Disable:

1. **Access Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select project: `ivqljpbifavxzvebujiy`

2. **Disable Email Confirmation**
   - Go to: Authentication → Settings
   - Find "Email Confirmation" setting
   - **Uncheck** "Enable email confirmations"
   - Click "Save"

3. **Test New Sign-ups**
   - Create a new account
   - Should be able to sign in immediately
   - No email confirmation required

**Security Risk**: Users can sign up with any email address (even ones they don't own)

---

### Option 3: Use Database Trigger (TEMPORARY - Already Attempted)

**Status**: Attempted but caused database errors (HTTP 500)

We previously tried creating a trigger to auto-confirm emails:

```sql
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW(), confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Result**: Trigger caused "Database error saving new user" (HTTP 500)

**Removed**: This approach was abandoned due to instability

---

## Recommended Approach for Hackathon Demo

### Immediate (For Demo):

**Use existing verified test accounts:**
- Patient: pkbqfyhc@minimax.com / qUe8UBwHAa
- Researcher: ynrajxfa@minimax.com / 5lvkPndPq0

### Short-term (For Extended Demo):

**Option 2**: Temporarily disable email confirmation in Supabase dashboard
- Quick fix (5 minutes)
- Allows live sign-ups during demo
- Re-enable after demo

### Long-term (For Production):

**Option 1**: Configure proper SMTP
- Use SendGrid, Mailgun, or AWS SES
- Customize email templates with CuraLink branding
- Implement password reset flow
- Add email change verification

---

## Email Template Customization

Once SMTP is configured, customize the confirmation email:

### Suggested Template:

**Subject**: Welcome to CuraLink - Confirm Your Email

**Body**:
```html
<h2>Welcome to CuraLink!</h2>

<p>Thank you for joining CuraLink, the platform connecting patients and researchers for better health outcomes.</p>

<p>Please confirm your email address by clicking the button below:</p>

<a href="{{ .ConfirmationURL }}" style="background-color: #58CC02; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
  Confirm Email
</a>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't create a CuraLink account, you can safely ignore this email.</p>

<p>Best regards,<br>The CuraLink Team</p>
```

---

## Password Reset Flow (Future Enhancement)

Once email is configured, implement password reset:

1. **Add "Forgot Password" link** on sign-in page
2. **Create password reset page** at `/auth/reset-password`
3. **Configure reset email template** in Supabase
4. **Implement reset token validation**

---

## Testing Checklist

After configuring email:

- [ ] New user can sign up
- [ ] Confirmation email arrives within 1 minute
- [ ] Confirmation link works correctly
- [ ] User can sign in after confirmation
- [ ] Unconfirmed users cannot sign in
- [ ] Email template matches CuraLink branding
- [ ] Password reset flow works (if implemented)

---

## Troubleshooting

### Issue: Emails not arriving

**Check:**
1. SMTP credentials are correct
2. SMTP port is open (587 or 465)
3. Sender email is verified with SMTP provider
4. Check spam folder
5. Verify daily send limits haven't been exceeded

### Issue: Confirmation link doesn't work

**Check:**
1. Redirect URL is correctly configured in Supabase
2. Email template has correct `{{ .ConfirmationURL }}` variable
3. Link hasn't expired (default: 24 hours)

### Issue: "Invalid credentials" after confirmation

**Check:**
1. User clicked the confirmation link
2. Check `auth.users` table: `email_confirmed_at` should not be NULL
3. Try password reset if needed

---

## Production Deployment Checklist

Before launching to production:

- [ ] SMTP configured with reliable provider
- [ ] Email templates customized with branding
- [ ] Test email delivery from production domain
- [ ] Implement rate limiting on sign-up endpoint
- [ ] Add CAPTCHA to prevent bot sign-ups
- [ ] Configure SPF, DKIM, DMARC records for email domain
- [ ] Monitor email delivery rates
- [ ] Set up alerts for email failures

---

## Quick Commands

### Check if email confirmation is enabled (via SQL):
```sql
SELECT * FROM auth.config 
WHERE parameter = 'mailer_autoconfirm';
```

### Manually confirm a user (EMERGENCY ONLY):
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW(), confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

---

## Summary

**Current State**: Email verification required but not configured

**For Demo**: Use test accounts or temporarily disable verification

**For Production**: Configure SMTP with SendGrid/Mailgun/AWS SES

**Next Steps**: 
1. Choose approach based on timeline
2. Follow configuration steps above
3. Test thoroughly before launch

---

**Last Updated**: 2025-11-04  
**Platform**: CuraLink MVP  
**Supabase Project**: ivqljpbifavxzvebujiy
