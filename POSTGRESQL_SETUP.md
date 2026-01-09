# PostgreSQL Setup Guide

**Database:** PostgreSQL 18.1  
**Status:** Production Ready

---

## Quick Setup

### 1. Run Database Setup
```bash
setup-postgresql.bat
```
Enter postgres password when prompted.

### 2. Insert Sample Data (Optional)
```bash
psql -U postgres -d azmera_db -f insert-sample-data.sql
```

### 3. Start Application
```bash
npm run dev
```

---

## Database Details

**Connection:**
- Database: `azmera_db`
- User: `azmera_user`
- Password: `azmera_secure_2025`
- Host: `localhost:5432`

**Tables:** 15 tables
- users, products, orders, order_items
- transactions, escrow_transactions, disputes
- storage_facilities, storage_bookings
- transportation, learning_modules, enrollments
- reviews, notifications, platform_revenue

---

## Useful Commands

### Test Connection
```bash
node test-db-connection.js
```

### Clear All Data
```bash
clear-data.bat
```

### Access Database
```bash
psql -U postgres -d azmera_db
```

### View Tables
```sql
\dt
```

### Check Data
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
```

---

## Admin Dashboard

Access real-time database statistics:
```
http://localhost:9002/admin/database
```

Features:
- Live table counts
- Database size monitoring
- Recent activity tracking
- Auto-refresh every 30 seconds

---

## Troubleshooting

### Service Not Running
```bash
Get-Service -Name postgresql-x64-18
Start-Service postgresql-x64-18
```

### Connection Failed
Check `.env.local` has:
```env
DATABASE_URL=postgresql://azmera_user:azmera_secure_2025@localhost:5432/azmera_db
```

### Permission Issues
```sql
GRANT ALL PRIVILEGES ON DATABASE azmera_db TO azmera_user;
GRANT ALL ON SCHEMA public TO azmera_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO azmera_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO azmera_user;
```

---

**Status:** ✅ Ready for Development & Production
