# Admin Quick Reference Card

## 🔑 Reset Forgotten Password

### Windows:
```bash
reset-admin.bat
```

### Linux/Mac:
```bash
node reset-admin-password.js
```

Then copy the SQL and run in your database.

---

## 🎛️ Admin Panel Access

**URL**: `/admin/database`

**Default Login**:
- Email: `admin@azmera.com`
- Password: `Admin@2024`

---

## 📋 Available Features

| Feature | Path | What You Can Do |
|---------|------|-----------------|
| **Database Management** | `/admin/database` | Full CRUD for all entities |
| **Password Reset** | `/admin/reset-password` | Reset any user's password |
| **User Verification** | `/admin/verify-users` | Verify user licenses |
| **Dispute Resolution** | `/admin/disputes` | Resolve order disputes |

---

## 🗂️ Database Tabs

1. **Users** - Create, edit, delete users
2. **Products** - View and delete products
3. **Orders** - View all orders and statuses
4. **Wallets** - View user balances
5. **Disputes** - View and manage disputes
6. **Notifications** - View and delete notifications

---

## 🔒 Security Notes

- All actions are logged in `AuditLog` table
- Only ADMIN role can access these features
- Cannot delete your own admin account
- Passwords are hashed with bcrypt

---

## 🆘 Troubleshooting

**Can't login?**
→ Run `reset-admin.bat` and execute the SQL

**"Unauthorized" error?**
→ Check your user has `role = 'ADMIN'` in database

**Changes not saving?**
→ Check browser console and server logs

---

## 📞 Quick Commands

### Check Admin User
```sql
SELECT id, email, name, role FROM "User" WHERE email = 'admin@azmera.com';
```

### View Recent Admin Actions
```sql
SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 10;
```

### Count Records
```sql
SELECT 
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Product") as products,
  (SELECT COUNT(*) FROM "Order") as orders,
  (SELECT COUNT(*) FROM "Dispute") as disputes;
```

---

**Last Updated**: December 2024
