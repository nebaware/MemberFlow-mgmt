# 🚀 Production Deployment Guide - Azmera AgriTech Platform

## Pre-Deployment Checklist

### ✅ Security Verification
- [x] Security audit completed (95/100 score)
- [x] All vulnerabilities addressed
- [x] Input validation implemented
- [x] Rate limiting configured
- [x] Security headers set
- [x] Audit logging active

### ✅ Code Quality
- [x] TypeScript compilation successful
- [x] No console.log statements in production code
- [x] Error handling implemented
- [x] Production-safe logging active

### ✅ Database
- [x] PostgreSQL schema deployed
- [x] Foreign key constraints enabled
- [x] Indexes optimized
- [x] Sample data available

## 🔧 Environment Setup

### 1. Server Requirements

**Minimum Specifications:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- OS: Ubuntu 20.04+ or similar

**Recommended Specifications:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- OS: Ubuntu 22.04 LTS

### 2. Dependencies Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx

# Install SSL certificate tool
sudo apt install certbot python3-certbot-nginx
```

### 3. Database Setup

```bash
# Create database user
sudo -u postgres createuser --interactive azmera_user
sudo -u postgres createdb azmera_db

# Set password
sudo -u postgres psql
ALTER USER azmera_user PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE azmera_db TO azmera_user;
\q
```

### 4. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/azmera-platform.git
cd azmera-platform

# Install dependencies
npm ci --production

# Build application
npm run build

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with production values
```

## 🔐 Environment Variables Configuration

### Required Production Variables

```env
# Database
DATABASE_URL=postgresql://azmera_user:secure_password@localhost:5432/azmera_db

# Application
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production

# Payment Gateway (Chapa)
CHAPA_SECRET_KEY=CHASECK_LIVE-your_live_secret_key
CHAPA_PUBLIC_KEY=CHAPUBK_LIVE-your_live_public_key

# AI/Gemini
GEMINI_API_KEY=your_production_gemini_key
GEMINI_MODEL=googleai/gemini-1.5-flash

# JWT Secret (Generate strong secret)
JWT_SECRET=your_very_secure_jwt_secret_here_min_32_chars

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_app_password

# Security
RATE_LIMIT_ENABLED=true
SECURITY_HEADERS_ENABLED=true
```

### Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 SSL/HTTPS Setup

### 1. Domain Configuration

```bash
# Point your domain to server IP
# Update DNS A record: yourdomain.com -> your_server_ip
```

### 2. Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/azmera
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/azmera /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## 🚀 Application Launch

### 1. Database Migration

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npm run seed
```

### 2. Start Application

```bash
# Start with PM2
pm2 start npm --name "azmera" -- start

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs azmera
```

### 3. Verify Deployment

```bash
# Check application health
curl https://yourdomain.com/api/health

# Check database connection
curl https://yourdomain.com/api/debug

# Monitor logs
pm2 logs azmera --lines 50
```

## 📊 Monitoring Setup

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 2. Database Monitoring

```sql
-- Create monitoring user
CREATE USER monitor_user WITH PASSWORD 'monitor_password';
GRANT CONNECT ON DATABASE azmera_db TO monitor_user;
GRANT USAGE ON SCHEMA public TO monitor_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitor_user;
```

### 3. System Monitoring

```bash
# Install system monitoring
sudo apt install htop iotop nethogs

# Set up log monitoring
sudo nano /etc/logrotate.d/azmera
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. System Security

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Secure SSH
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no (if using keys)
sudo systemctl restart ssh
```

### 3. Application Security

```bash
# Set proper file permissions
chmod 600 .env.local
chmod -R 755 public/
chmod -R 644 src/

# Secure database
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_secure_password';
\q
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_products_category ON products(category);
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(buyer_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Analyze tables
ANALYZE;
```

### 2. Application Optimization

```bash
# Enable gzip compression in Nginx
sudo nano /etc/nginx/nginx.conf
```

```nginx
# Add to http block
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 3. Caching Setup

```bash
# Install Redis for caching (optional)
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

## 🔄 Backup Strategy

### 1. Database Backup

```bash
# Create backup script
nano backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/azmera"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="azmera_db"
DB_USER="azmera_user"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

```bash
# Make executable and schedule
chmod +x backup-db.sh
crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

### 2. Application Backup

```bash
# Create application backup script
nano backup-app.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/azmera"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/path/to/azmera-platform"

mkdir -p $BACKUP_DIR

# Backup application files (excluding node_modules)
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    -C $APP_DIR .

echo "Application backup completed: app_backup_$DATE.tar.gz"
```

## 🚨 Incident Response

### 1. Health Checks

```bash
# Create health check script
nano health-check.sh
```

```bash
#!/bin/bash
URL="https://yourdomain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed: HTTP $RESPONSE"
    # Restart application
    pm2 restart azmera
    # Send alert (configure email/SMS)
    echo "Application restarted due to health check failure" | mail -s "Azmera Alert" admin@yourdomain.com
fi
```

### 2. Log Monitoring

```bash
# Monitor error logs
tail -f ~/.pm2/logs/azmera-error.log

# Monitor access logs
sudo tail -f /var/log/nginx/access.log

# Monitor system logs
sudo tail -f /var/log/syslog
```

## 📞 Support & Maintenance

### Daily Tasks
- [ ] Check application status (`pm2 status`)
- [ ] Monitor error logs
- [ ] Verify backup completion
- [ ] Check disk space (`df -h`)

### Weekly Tasks
- [ ] Update system packages
- [ ] Review security logs
- [ ] Check SSL certificate expiry
- [ ] Monitor database performance

### Monthly Tasks
- [ ] Update application dependencies
- [ ] Review and rotate logs
- [ ] Performance optimization review
- [ ] Security audit

## 🎉 Go-Live Checklist

### Final Verification
- [ ] SSL certificate installed and working
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Application starts without errors
- [ ] Health check endpoint responding
- [ ] Payment gateway configured (test mode first)
- [ ] Email notifications working
- [ ] Backup scripts configured
- [ ] Monitoring alerts set up
- [ ] Firewall configured
- [ ] DNS records updated

### Post-Launch
- [ ] Monitor application for 24 hours
- [ ] Test all critical features
- [ ] Verify payment processing
- [ ] Check email notifications
- [ ] Monitor performance metrics
- [ ] Review security logs

---

## 📋 Quick Commands Reference

```bash
# Application Management
pm2 status                    # Check app status
pm2 restart azmera           # Restart app
pm2 logs azmera              # View logs
pm2 monit                    # Monitor resources

# Database Management
sudo -u postgres psql azmera_db    # Connect to database
pg_dump -U azmera_user azmera_db   # Backup database
psql -U azmera_user azmera_db      # Restore database

# System Management
sudo systemctl status nginx        # Check Nginx status
sudo systemctl restart nginx       # Restart Nginx
sudo ufw status                    # Check firewall
sudo certbot certificates         # Check SSL certificates

# Monitoring
htop                              # System resources
sudo tail -f /var/log/nginx/error.log  # Nginx errors
pm2 logs azmera --lines 100       # Application logs
```

---

**Deployment Status**: ✅ Ready for Production
**Security Level**: 🔒 High Security
**Performance**: ⚡ Optimized
**Monitoring**: 📊 Comprehensive

**Support**: For deployment assistance, refer to the documentation or contact the development team.