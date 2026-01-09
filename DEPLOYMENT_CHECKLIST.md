# 🚀 Deployment Checklist - Azmera Platform

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `DATABASE_URL` with production database
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Get Chapa production keys from https://dashboard.chapa.co
- [ ] Add `CHAPA_SECRET_KEY` to environment
- [ ] (Optional) Get Telebirr credentials
- [ ] Generate secure `JWT_SECRET`
- [ ] Configure SMTP for emails
- [ ] Configure SMS API for notifications

### 2. Database Setup
- [ ] Run `setup-postgresql.sql` on production database
- [ ] Run `insert-sample-data.sql` (or skip for clean start)
- [ ] Add payment columns to orders table:
```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2) DEFAULT 0;
```
- [ ] Verify all tables created successfully
- [ ] Set up database backups
- [ ] Configure connection pooling

### 3. Payment Provider Setup

#### Chapa:
- [ ] Create account at https://dashboard.chapa.co
- [ ] Complete KYC verification
- [ ] Get production API keys
- [ ] Configure webhook URL: `https://yourdomain.com/api/payments/callback`
- [ ] Test with small transaction
- [ ] Verify callback receives notifications

#### Telebirr (Optional):
- [ ] Contact Ethio Telecom Business Team (+251 11 515 5000)
- [ ] Complete merchant registration
- [ ] Receive App ID and App Key
- [ ] Configure webhook URL
- [ ] Test integration

### 4. Security Configuration
- [ ] Replace demo auth with JWT tokens
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags
- [ ] Configure Content Security Policy
- [ ] Add input validation/sanitization
- [ ] Enable SQL injection protection
- [ ] Set up audit logging

### 5. Code Review
- [ ] Remove all `console.log` statements
- [ ] Remove demo user switcher (or hide in production)
- [ ] Update mock user IDs to real auth
- [ ] Verify all API endpoints have auth checks
- [ ] Check for hardcoded credentials
- [ ] Review error messages (don't expose internals)
- [ ] Verify all environment variables used
- [ ] Check for TODO/FIXME comments

### 6. Testing
- [ ] Test user registration
- [ ] Test user login/logout
- [ ] Test product listing
- [ ] Test product editing (own products only)
- [ ] Test product deletion
- [ ] Test wallet payment
- [ ] Test Chapa payment
- [ ] Test Telebirr payment (if enabled)
- [ ] Test payment verification
- [ ] Test payment callback
- [ ] Test escrow system
- [ ] Test order flow (create → pay → ship → deliver)
- [ ] Test admin functions
- [ ] Test on mobile devices
- [ ] Test with slow network
- [ ] Load test with multiple users

### 7. Performance Optimization
- [ ] Enable Next.js production build
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Configure database indexes
- [ ] Enable query caching
- [ ] Set up Redis for session storage
- [ ] Monitor bundle size
- [ ] Enable lazy loading

### 8. Monitoring & Logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure application logging
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up database monitoring
- [ ] Create alerts for critical errors
- [ ] Set up payment failure alerts
- [ ] Monitor API response times
- [ ] Track user analytics

### 9. Documentation
- [ ] Update README with production setup
- [ ] Document API endpoints
- [ ] Create admin user guide
- [ ] Create seller user guide
- [ ] Create buyer user guide
- [ ] Document payment flow
- [ ] Create troubleshooting guide
- [ ] Document backup/restore procedures

### 10. Legal & Compliance
- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Cookie Policy
- [ ] Add Refund Policy
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Add payment processing disclaimers
- [ ] Configure data retention policies
- [ ] Set up user data export
- [ ] Enable account deletion

## 🔧 Deployment Steps

### Step 1: Build Application
```bash
npm run build
```

### Step 2: Test Production Build Locally
```bash
npm start
```

### Step 3: Deploy to Hosting
Choose your platform:

#### Vercel:
```bash
vercel --prod
```

#### Railway:
```bash
railway up
```

#### AWS/DigitalOcean:
```bash
# Build Docker image
docker build -t azmera-platform .
docker push your-registry/azmera-platform

# Deploy to server
ssh your-server
docker pull your-registry/azmera-platform
docker-compose up -d
```

### Step 4: Configure Domain
- [ ] Point domain to hosting
- [ ] Configure SSL certificate
- [ ] Set up www redirect
- [ ] Configure DNS records

### Step 5: Post-Deployment Verification
- [ ] Visit production URL
- [ ] Test user registration
- [ ] Test login
- [ ] Create test order
- [ ] Process test payment
- [ ] Verify email notifications
- [ ] Check database connections
- [ ] Verify payment callbacks work
- [ ] Test admin functions
- [ ] Check mobile responsiveness

## 📊 Production Environment Variables

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/azmera_prod

# Authentication
JWT_SECRET=your_super_secure_random_string_here

# Chapa (Production)
CHAPA_SECRET_KEY=CHASECK-your_production_key
CHAPA_PUBLIC_KEY=CHAPUBK-your_production_key

# Telebirr (Production)
TELEBIRR_APP_ID=your_production_app_id
TELEBIRR_APP_KEY=your_production_app_key
TELEBIRR_BASE_URL=https://app.ethiotelecom.et:9443/ammapi

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_app_password

# SMS
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=AZMERA

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 🔒 Security Hardening

### Headers Configuration (next.config.ts):
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
}
```

### Rate Limiting:
```typescript
// Add to API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## 📈 Monitoring Dashboards

### Key Metrics to Track:
- [ ] Total users
- [ ] Active users (daily/monthly)
- [ ] Total orders
- [ ] Successful payments
- [ ] Failed payments
- [ ] Platform revenue
- [ ] Average order value
- [ ] Conversion rate
- [ ] Page load times
- [ ] API response times
- [ ] Error rates
- [ ] Database query times

### Alerts to Configure:
- [ ] Payment failure rate > 5%
- [ ] API error rate > 1%
- [ ] Database connection failures
- [ ] Disk space < 20%
- [ ] Memory usage > 80%
- [ ] CPU usage > 80%
- [ ] Slow queries > 2s
- [ ] Webhook failures

## 🔄 Backup Strategy

### Daily Backups:
```bash
# Database backup
pg_dump azmera_prod > backup_$(date +%Y%m%d).sql

# Upload to cloud storage
aws s3 cp backup_$(date +%Y%m%d).sql s3://azmera-backups/
```

### Weekly Full Backups:
- [ ] Database dump
- [ ] User uploaded files
- [ ] Configuration files
- [ ] Environment variables (encrypted)

### Backup Retention:
- Daily: Keep 7 days
- Weekly: Keep 4 weeks
- Monthly: Keep 12 months

## 🚨 Incident Response Plan

### If Payment System Fails:
1. Check payment provider status
2. Verify webhook URL accessible
3. Check database connections
4. Review error logs
5. Contact payment provider support
6. Notify affected users

### If Database Goes Down:
1. Check database server status
2. Verify connection credentials
3. Check disk space
4. Review database logs
5. Restore from backup if needed
6. Notify users of maintenance

### If Site Goes Down:
1. Check hosting provider status
2. Verify DNS configuration
3. Check SSL certificate
4. Review application logs
5. Restart services if needed
6. Notify users via social media

## ✅ Launch Day Checklist

### Morning of Launch:
- [ ] Verify all systems operational
- [ ] Check payment providers active
- [ ] Verify email/SMS working
- [ ] Test critical user flows
- [ ] Prepare support team
- [ ] Monitor error logs
- [ ] Have rollback plan ready

### During Launch:
- [ ] Monitor real-time metrics
- [ ] Watch for error spikes
- [ ] Check payment success rate
- [ ] Monitor server resources
- [ ] Respond to user feedback
- [ ] Document any issues

### After Launch:
- [ ] Review launch metrics
- [ ] Analyze user behavior
- [ ] Identify bottlenecks
- [ ] Plan improvements
- [ ] Thank the team! 🎉

## 📞 Support Contacts

### Payment Providers:
- **Chapa**: support@chapa.co
- **Telebirr**: +251 11 515 5000

### Hosting:
- **Vercel**: support@vercel.com
- **Railway**: support@railway.app

### Emergency Contacts:
- Database Admin: [contact]
- DevOps Lead: [contact]
- Payment Specialist: [contact]

## 🎯 Success Criteria

### Week 1:
- [ ] 100+ registered users
- [ ] 50+ products listed
- [ ] 10+ successful transactions
- [ ] < 1% error rate
- [ ] < 2s average page load

### Month 1:
- [ ] 1000+ registered users
- [ ] 500+ products listed
- [ ] 100+ successful transactions
- [ ] 10,000 Birr+ in platform revenue
- [ ] 95%+ payment success rate

## 🎉 You're Ready to Launch!

Once all items are checked, you're ready to go live! 🚀

**Remember:**
- Start small, scale gradually
- Monitor everything
- Listen to user feedback
- Iterate quickly
- Celebrate wins! 🎊

---

**Good luck with your launch!** 🌾💚🚜
