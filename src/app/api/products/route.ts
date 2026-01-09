import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

export async function GET(request: Request) {
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId') || searchParams.get('farmerId');
    const category = searchParams.get('category');

    let query = `
      SELECT p.id, p.title, p.description, p.price, p.category, p.origin as location, 
             COALESCE(p.image_url, 'https://placehold.co/300x200.png') AS "image_url", 
             p.seller_id AS "sellerId", u.name AS "farmerName",
             p.stock_quantity AS "stockQuantity", p.unit,
             p.created_at AS "createdAt"
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
    `;

    const params: any[] = [];
    if (sellerId) {
      params.push(sellerId);
      query += ` AND p.seller_id = $${params.length}`;
    }
    if (category) {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }

    query += ' ORDER BY p.created_at DESC';

    const rows = await dbQuery(query, params);

    // Transform to match frontend Product type
    const products = rows.map((row: any) => ({
      id: row.id.toString(),
      title: row.title,
      name: row.title, // alias for legacy
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      location: row.location || 'Ethiopia',
      image_url: row.image_url,
      imageUrl: row.image_url, // alias for legacy
      farmerName: row.farmerName || 'Unknown Seller',
      sellerId: row.sellerId?.toString(),
      stockQuantity: row.stockQuantity ? parseFloat(row.stockQuantity) : 0,
      unit: row.unit || 'kg'
    }));

    return NextResponse.json(products);
  } catch (err: any) {
    console.error('Products GET error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    const body = await request.json();
    const { title, name, description, price, category, location, image_url, imageUrl, farmerId, stockQuantity, unit } = body;

    const productTitle = title || name;
    if (!productTitle || !description) {
      return NextResponse.json({ error: 'Missing required fields: title and description are required' }, { status: 400 });
    }

    // Use seller_id for PostgreSQL schema compatibility
    const sellerId = farmerId || 1;

    const rows = await dbQuery(
      `INSERT INTO products (seller_id, title, description, price, category, stock_quantity, unit, image_url, origin, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
       RETURNING id, seller_id, title, description, price, category, stock_quantity, unit, origin, created_at AS "createdAt"`,
      [sellerId, productTitle, description, price || 0, category || null, stockQuantity || 100, unit || 'kg', image_url || imageUrl || null, location || 'Ethiopia', 'active']
    );

    const product = rows[0];

    // Return in expected format
    return NextResponse.json({
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      location: product.origin,
      stockQuantity: product.stock_quantity,
      unit: product.unit,
      createdAt: product.createdAt
    }, { status: 201 });
  } catch (err: any) {
    console.error('Products POST error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
