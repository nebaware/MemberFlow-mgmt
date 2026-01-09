# Admin Login Instructions

## Admin Credentials

**Email:** `admin@azmera.com`  
**Password:** `admin123`

## How to Create Admin User

If the admin user doesn't exist in your database, run:

```bash
node create-admin.js
```

This will generate the SQL with the proper bcrypt hash. Then run the SQL file:

```bash
psql -U postgres -d azmera_db -f create-admin-user.sql
```

Or manually execute the SQL in your database client.

## Login Steps

1. Go to http://localhost:9002
2. Click "Login" or navigate to `/auth/login`
3. Enter:
   - Email: `admin@azmera.com`
   - Password: `admin123`
4. You'll have full admin access to:
   - All products (can edit any)
   - Admin dashboard
   - User management
   - Platform analytics

## Admin Capabilities

As an admin, you can:
- ✅ Edit ALL products regardless of seller
- ✅ Change product status (active/inactive/deleted)
- ✅ Access admin panel at `/admin`
- ✅ View platform revenue and commission stats
- ✅ Manage all users and orders
- ✅ Full control over the platform

## Troubleshooting

**Can't login?**
- Verify the user exists: `SELECT * FROM "User" WHERE email = 'admin@azmera.com';`
- Check the role is 'ADMIN': `SELECT role FROM "User" WHERE email = 'admin@azmera.com';`
- Re-run the create-admin-user.sql script

**Wrong password?**
- The password hash must match exactly
- Re-generate using `node create-admin.js`
- Update the database with the new hash
