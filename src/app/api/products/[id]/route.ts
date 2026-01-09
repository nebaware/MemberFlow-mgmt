import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { getAuthUser, canEditProduct, isAdmin } from '@/lib/auth/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch single product by ID
    const rows = await dbQuery(
      `SELECT p.id, p.title, p.description, p.price, p.category, p.origin as location, 
              COALESCE(p.image_url, 'https://placehold.co/300x200.png') AS "image_url", 
              p.seller_id AS "sellerId", u.name AS "farmerName",
              p.stock_quantity AS "stockQuantity", p.unit, p.quality, p.certification,
              p.created_at AS "createdAt"
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1 AND p.status = 'active'`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const row = rows[0];

    // Transform to match frontend Product type
    const product = {
      id: row.id.toString(),
      title: row.title,
      name: row.title, // alias
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      location: row.location || 'Ethiopia',
      image_url: row.image_url,
      imageUrl: row.image_url, // alias
      farmerName: row.farmerName || 'Unknown Seller',
      sellerId: row.sellerId?.toString(),
      stockQuantity: row.stockQuantity ? parseFloat(row.stockQuantity) : 0,
      unit: row.unit || 'kg',
      quality: row.quality,
      certification: row.certification,
      createdAt: row.createdAt
    };

    return NextResponse.json(product);
  } catch (err: any) {
    console.error('Product GET by ID error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, name, description, price, category, location, stock, stockQuantity, unit, quality, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get authenticated user
    const authUser = await getAuthUser(request);

    // Check if product exists and get seller_id
    const productRows = await dbQuery(
      'SELECT seller_id FROM products WHERE id = $1',
      [id]
    );

    if (productRows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productSellerId = productRows[0].seller_id;

    // Authorization check: Only product owner or admin can edit
    if (!canEditProduct(authUser, productSellerId)) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only edit your own products' },
        { status: 403 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined || name !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title || name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (location !== undefined) {
      updates.push(`origin = $${paramCount++}`);
      values.push(location);
    }
    if (stockQuantity !== undefined || stock !== undefined) {
      updates.push(`stock_quantity = $${paramCount++}`);
      values.push(stockQuantity || stock);
    }
    if (unit !== undefined) {
      updates.push(`unit = $${paramCount++}`);
      values.push(unit);
    }
    if (quality !== undefined) {
      updates.push(`quality = $${paramCount++}`);
      values.push(quality);
    }
    // Only admin can change status
    if (status !== undefined && isAdmin(authUser)) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);

    // Add product ID as last parameter
    values.push(id);

    const query = `
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, price, category, origin as location, stock_quantity, unit, quality, status, updated_at, seller_id
    `;

    const rows = await dbQuery(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = rows[0];

    return NextResponse.json({
      id: product.id.toString(),
      title: product.title,
      name: product.title,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      location: product.location,
      stockQuantity: parseFloat(product.stock_quantity),
      unit: product.unit,
      quality: product.quality,
      status: product.status,
      updatedAt: product.updated_at,
      sellerId: product.seller_id
    });
  } catch (err: any) {
    console.error('Product PUT error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get authenticated user
    const authUser = await getAuthUser(request);

    // Check if product exists and get seller_id
    const productRows = await dbQuery(
      'SELECT seller_id, title FROM products WHERE id = $1',
      [id]
    );

    if (productRows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { seller_id: productSellerId, title: productName } = productRows[0];

    // Authorization check: Only product owner or admin can delete
    if (!canEditProduct(authUser, productSellerId)) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own products' },
        { status: 403 }
      );
    }

    // Soft delete by setting status to 'deleted'
    const rows = await dbQuery(
      `UPDATE products 
       SET status = 'deleted', updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, status`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
      id: rows[0].id.toString(),
      title: rows[0].title
    });
  } catch (err: any) {
    console.error('Product DELETE error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
