# Product Management System

## Overview
Complete system for sellers and admins to manage product listings, update inventory, and remove sold-out items.

## Features Implemented

### 1. API Endpoints (`/api/products/[id]/route.ts`)

#### GET `/api/products/:id`
- Fetch single product details
- Returns 404 if product not found or deleted

#### PUT `/api/products/:id`
- Update product information
- Supports partial updates (only send fields to change)
- **Updatable fields:**
  - `name` - Product name
  - `description` - Product description
  - `price` - Price per unit
  - `category` - Product category
  - `location` - Origin/location
  - `stock` - Stock quantity
  - `unit` - Unit of measurement (kg, unit, etc.)
  - `quality` - Quality grade
  - `status` - Product status (active, inactive, deleted)

**Example Request:**
```json
PUT /api/products/123
{
  "stock": 45,
  "price": 90.00
}
```

#### DELETE `/api/products/:id`
- Soft delete (sets status to 'deleted')
- Product remains in database but hidden from marketplace
- Returns deleted product info

### 2. Seller Product Management (`/my-products`)

**Features:**
- ✅ View all seller's products
- ✅ Edit product details (name, description, price, stock, etc.)
- ✅ Mark products as sold (reduces stock)
- ✅ Auto-prompt to remove when last item sold
- ✅ Delete/remove products from marketplace
- ✅ Real-time stock updates
- ✅ Color-coded stock badges (green > 10, yellow 1-10, red = 0)

**User Flow - Marking Items as Sold:**
1. Click "📦 Sold" button
2. Enter quantity sold
3. System updates stock automatically
4. If stock reaches 0, prompts: "Remove from marketplace?"
   - Yes → Product deleted
   - No → Product stays with 0 stock

**Edit Product Dialog:**
- Full form to update all product details
- Real-time validation
- Save changes with one click

### 3. Admin Product Management (`/admin/products`)

**Features:**
- ✅ View ALL products from all sellers
- ✅ Search by name, seller, or category
- ✅ Filter by status (active, inactive, deleted)
- ✅ Update any product's stock
- ✅ Activate/deactivate products
- ✅ Delete products permanently
- ✅ See seller information for each product

**Admin Actions:**
- **📦 Update Stock** - Quick stock adjustment
- **🟢/🔴 Toggle Status** - Activate/deactivate products
- **🗑️ Delete** - Remove from marketplace

## Usage Examples

### Seller Workflow

#### Scenario 1: Product Sold Out
```
1. Seller lists "Teff Grain" - 100 kg stock
2. Customer buys 50 kg → Seller clicks "Sold" → Enters 50
3. Stock updates to 50 kg
4. Customer buys remaining 50 kg → Seller clicks "Sold" → Enters 50
5. System prompts: "This was the last kg of Teff Grain. Remove from marketplace?"
6. Seller clicks "Yes" → Product removed
```

#### Scenario 2: Update Product Info
```
1. Seller clicks Edit icon
2. Updates price from 85 to 90 Birr/kg
3. Updates description
4. Clicks "Save Changes"
5. Product updated immediately
```

#### Scenario 3: Remove Product
```
1. Seller decides to stop selling a product
2. Clicks trash icon
3. Confirms deletion
4. Product removed from marketplace
```

### Admin Workflow

#### Scenario 1: Moderate Products
```
1. Admin sees inappropriate product listing
2. Clicks 🔴 to deactivate
3. Product hidden from marketplace
4. Admin can reactivate later with 🟢
```

#### Scenario 2: Bulk Stock Management
```
1. Admin filters by "Low Stock" products
2. Updates stock for multiple products
3. Notifies sellers to restock
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  stock DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'kg',
  quality VARCHAR(50),
  origin VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  images TEXT[],
  certification VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Status Values
- `active` - Visible in marketplace
- `inactive` - Hidden but can be reactivated
- `deleted` - Soft deleted (hidden permanently)

## API Response Examples

### Successful Update
```json
{
  "id": "123",
  "name": "Teff Grain",
  "stock": 45,
  "price": 90.00,
  "updatedAt": "2025-11-24T10:30:00Z"
}
```

### Successful Delete
```json
{
  "message": "Product deleted successfully",
  "id": "123",
  "name": "Teff Grain"
}
```

### Error Response
```json
{
  "error": "Product not found"
}
```

## Security Considerations

### Current Implementation
- ⚠️ Uses mock seller ID (1) for demo
- ⚠️ No authentication checks

### Production Requirements
```typescript
// Add authentication middleware
const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Verify seller owns product
const product = await getProduct(id);
if (product.seller_id !== session.user.id && !session.user.isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Navigation

### Add to Main Navigation
```typescript
// For Sellers
{
  name: 'My Products',
  href: '/my-products',
  icon: Package,
  roles: ['farmer', 'tool_seller']
}

// For Admins
{
  name: 'Manage Products',
  href: '/admin/products',
  icon: ShieldCheck,
  roles: ['admin']
}
```

## Testing Checklist

### Seller Tests
- [ ] List products for specific seller
- [ ] Edit product details
- [ ] Update stock when sold
- [ ] Remove product when stock = 0
- [ ] Delete product manually
- [ ] Refresh product list

### Admin Tests
- [ ] View all products
- [ ] Search products
- [ ] Filter by status
- [ ] Update any product's stock
- [ ] Activate/deactivate products
- [ ] Delete products
- [ ] See seller information

### API Tests
```bash
# Get product
curl http://localhost:3000/api/products/1

# Update stock
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"stock": 50}'

# Delete product
curl -X DELETE http://localhost:3000/api/products/1
```

## Future Enhancements

1. **Bulk Operations**
   - Update multiple products at once
   - Bulk delete/activate

2. **Stock Alerts**
   - Email when stock < 10
   - Auto-notify when out of stock

3. **Product History**
   - Track all changes
   - Audit log for admin actions

4. **Advanced Filters**
   - Date range
   - Price range
   - Multiple categories

5. **Export/Import**
   - CSV export of products
   - Bulk import via CSV

6. **Product Analytics**
   - Views count
   - Sales history
   - Revenue tracking

## Troubleshooting

### Product not updating
- Check database connection
- Verify product ID exists
- Check for validation errors in console

### Stock not decreasing
- Ensure numeric value entered
- Check for negative stock prevention
- Verify API endpoint is called

### Delete not working
- Confirm deletion prompt accepted
- Check API response in network tab
- Verify product status changed to 'deleted'

## Summary

✅ **Sellers can:**
- Manage their product inventory
- Update stock when items are sold
- Remove products when sold out
- Edit product details anytime

✅ **Admins can:**
- Oversee all marketplace products
- Moderate inappropriate listings
- Help sellers with stock management
- Remove problematic products

✅ **System automatically:**
- Prompts to remove when last item sold
- Updates stock in real-time
- Soft deletes for data integrity
- Shows color-coded stock levels
