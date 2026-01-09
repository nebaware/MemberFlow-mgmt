# Admin Complete Guide

## 🔐 Password Reset

### Option 1: Reset Your Own Admin Password (If Forgotten)

Run this command to generate a new password hash:

```bash
node reset-admin-password.js
```

This will output SQL that you can run directly in your PostgreSQL database. The default new password will be `Admin@2024`.

**To customize the password**, edit `reset-admin-password.js` and change this line:
```javascript
const newPassword = 'Admin@2024'; // Change to your desired password
```

### Option 2: Reset Any User's Password via Admin Panel

1. Log in as admin
2. Navigate to: `/admin/reset-password`
3. Enter the user's email and new password
4. Click "Reset Password"

This creates an audit log entry for security tracking.

---

## 🎛️ Admin Database Management Panel

### Access
Navigate to: `/admin/database`

### Features

#### 1. **User Management** (Fully Implemented ✅)
- **View All Users**: See complete list with email, name, role, phone, and verification status
- **Create User**: Add new users with email, password, role, and profile info
- **Edit User**: Update user information (name, role, phone, location)
- **Delete User**: Remove users from the system (with confirmation)
- **Role Management**: Assign roles (FARMER, BUYER, TRANSPORTER, STORAGE_PROVIDER, EDUCATOR, ADMIN)

**API Endpoints:**
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

#### 2. **Product Management** (Partially Implemented ⚠️)
- **View All Products**: See products with title, price, category, seller
- **Delete Product**: Remove products from marketplace

**API Endpoints:**
- `GET /api/admin/products` - List all products
- `DELETE /api/admin/products/[id]` - Delete product

#### 3. **Order Management** (Coming Soon 🚧)
- View all orders
- Update order status
- Manage escrow transactions
- Handle refunds

#### 4. **Wallet Management** (Coming Soon 🚧)
- View all wallets
- Adjust balances
- View transaction history
- Manage withdrawal limits

#### 5. **Dispute Management** (Coming Soon 🚧)
- View all disputes
- Resolve disputes
- Release or refund escrow
- Add resolution notes

#### 6. **Notification Management** (Coming Soon 🚧)
- View all notifications
- Create system-wide announcements
- Delete old notifications
- Mark as read/unread

---

## 🔒 Security Features

### 1. **Role-Based Access Control**
All admin endpoints check for:
```typescript
if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### 2. **Audit Logging**
Every admin action is logged in the `AuditLog` table:
- User who performed the action
- Action type (user_created, user_updated, password_reset, etc.)
- Entity affected
- Changes made
- Timestamp

### 3. **Self-Protection**
Admins cannot delete their own account to prevent lockout.

---

## 📊 Database Schema

### Current Tables with Admin Access:
- ✅ **User** - Full CRUD
- ✅ **Product** - Read & Delete
- ⚠️ **Order** - Read only (via existing APIs)
- ⚠️ **Wallet** - Read only (via existing APIs)
- ⚠️ **Dispute** - Read only (via existing APIs)
- ⚠️ **Notification** - Read only (via existing APIs)
- ✅ **AuditLog** - Write only (automatic)

---

## 🚀 Quick Start

### 1. Reset Your Admin Password
```bash
# Generate new password hash
node reset-admin-password.js

# Copy the SQL output and run it in your database
psql -U postgres -d azmera_db
# Paste the UPDATE statement
```

### 2. Login as Admin
- Email: `admin@azmera.com`
- Password: `Admin@2024` (or whatever you set)

### 3. Access Admin Features
- Password Reset: `/admin/reset-password`
- Database Management: `/admin/database`
- User Verification: `/admin/verify-users`
- Dispute Resolution: `/admin/disputes`

---

## 🛠️ Extending Admin Features

### To Add Full CRUD for Orders:

1. Create component: `src/components/admin/order-management.tsx`
2. Create API: `src/app/api/admin/orders/route.ts`
3. Implement:
   - List orders with filters
   - Update order status
   - Cancel orders
   - Manage escrow

### To Add Full CRUD for Wallets:

1. Create component: `src/components/admin/wallet-management.tsx`
2. Create API: `src/app/api/admin/wallets/route.ts`
3. Implement:
   - List all wallets
   - Adjust balances (with reason)
   - View transaction history
   - Manage limits

### To Add Full CRUD for Disputes:

1. Update component: `src/components/admin/dispute-management.tsx`
2. Create API: `src/app/api/admin/disputes/route.ts`
3. Implement:
   - List disputes with filters
   - Resolve disputes
   - Release/refund escrow
   - Add admin notes

---

## 📝 Example: Creating a New User via Admin Panel

1. Go to `/admin/database`
2. Click "Users" tab
3. Click "Add User" button
4. Fill in the form:
   - Email: `farmer@example.com`
   - Name: `John Farmer`
   - Role: `FARMER`
   - Phone: `+251912345678`
   - Location: `Addis Ababa`
   - Password: `SecurePass123`
5. Click "Create"

The system will:
- Hash the password with bcrypt
- Create the user in the database
- Log the action in AuditLog
- Show success message

---

## 🔍 Audit Trail

View all admin actions in the database:

```sql
SELECT 
    al.*,
    u.email as admin_email
FROM "AuditLog" al
LEFT JOIN "User" u ON al."userId" = u.id
ORDER BY al."createdAt" DESC
LIMIT 50;
```

---

## ⚠️ Important Notes

1. **Backup Before Bulk Operations**: Always backup your database before performing bulk deletions
2. **Test in Development**: Test admin operations in development environment first
3. **Monitor Audit Logs**: Regularly review audit logs for suspicious activity
4. **Secure Admin Accounts**: Use strong passwords and enable 2FA when available
5. **Limit Admin Access**: Only grant admin role to trusted users

---

## 🎯 What's Implemented

### ✅ Completed
- Admin password reset (via script and UI)
- User CRUD operations
- Product viewing and deletion
- Audit logging for all admin actions
- Role-based access control
- Security protections

### 🚧 In Progress
- Order management
- Wallet management
- Dispute resolution
- Notification management

### 📋 Planned
- Bulk operations
- Data export (CSV/Excel)
- Advanced filtering and search
- Analytics dashboard
- System settings management

---

## 🆘 Troubleshooting

### Can't Login as Admin?
1. Run `node reset-admin-password.js`
2. Execute the SQL in your database
3. Try logging in with the new password

### "Unauthorized" Error?
- Check that your user has `role = 'ADMIN'` in the database
- Verify your session is valid (try logging out and back in)

### Changes Not Saving?
- Check browser console for errors
- Verify API endpoints are accessible
- Check database connection

---

## 📞 Support

For issues or questions:
1. Check the audit logs for error details
2. Review browser console for client-side errors
3. Check server logs for API errors
4. Verify database connectivity

---

**Last Updated**: December 2024
**Version**: 1.0.0
