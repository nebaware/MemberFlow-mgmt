import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    // Only allow seeding in development or when explicitly enabled via env
    const seedingAllowed = process.env.NODE_ENV === 'development' || process.env.ENABLE_DB_SEED === 'true';
    if (!seedingAllowed) {
      return NextResponse.json({ error: 'Database seeding is disabled. Set NODE_ENV=development or ENABLE_DB_SEED=true to enable.' }, { status: 403 });
    }

    // Ensure required tables exist before attempting to seed to provide a helpful error
    const requiredTables = ['User', 'Product', 'Order', 'OrderItem', 'EscrowTransaction', 'IoTDevice', 'Notification', 'StorageFacility', 'LearningContent'];
    const missing: string[] = [];
    for (const t of requiredTables) {
      try {
        const check = await dbQuery('SELECT to_regclass($1) AS reg', [`public.\"${t}\"`]);
        if (!check || !check[0] || !check[0].reg) missing.push(t);
      } catch (e) {
        missing.push(t);
      }
    }
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required database tables: ${missing.join(', ')}. Run npx prisma db push before seeding.` }, { status: 500 });
    }

    // Default password for all users: password123
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create sample users
    const users = [
      { email: 'admin@azmera.et', name: 'Admin User', role: 'ADMIN', location: 'Addis Ababa', phone: '+251911000000', verified: true, verificationStatus: 'verified' },
      { email: 'abebe@farmer.et', name: 'Abebe Kebede', role: 'FARMER', location: 'Debre Markos, Amhara Region', phone: '+251911001001', verified: true, verificationStatus: 'verified' },
      { email: 'fatima@farmer.et', name: 'Fatima Mohammed', role: 'FARMER', location: 'Yirgacheffe, SNNPR', phone: '+251911001002', verified: false, verificationStatus: 'pending' },
      { email: 'tesfaye@farmer.et', name: 'Tesfaye Lemma', role: 'FARMER', location: 'Sidama Region', phone: '+251911001003', verified: true, verificationStatus: 'verified' },
      { email: 'buyer1@market.et', name: 'Almaz Gebre', role: 'BUYER', location: 'Addis Ababa', phone: '+251911002001', verified: true, verificationStatus: 'verified' },
      { email: 'buyer2@market.et', name: 'Dawit Haile', role: 'BUYER', location: 'Bahir Dar', phone: '+251911002002', verified: false, verificationStatus: 'pending' },
      { email: 'transport1@delivery.et', name: 'Ketema Logistics', role: 'TRANSPORTER', location: 'Addis Ababa', phone: '+251911003001', verified: false, verificationStatus: 'pending', licenseNumber: 'TL-2024-001' },
      { email: 'educator1@azmera.et', name: 'Dr. Mulu Tadesse', role: 'EDUCATOR', location: 'Addis Ababa', phone: '+251911004001', verified: true, verificationStatus: 'verified' },
      { email: 'storage1@facility.et', name: 'Addis Prime Storage', role: 'STORAGE_PROVIDER', location: 'Addis Ababa', phone: '+251911005001', verified: true, verificationStatus: 'verified' },
    ];

    const createdUsers: any[] = [];
    for (const user of users) {
      const existing = await dbQuery('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existing.length === 0) {
        const result = await dbQuery(
          `INSERT INTO users (email, name, role, location, phone, wallet_balance, escrow_balance, verified, verification_status, license_number, password_hash)
           VALUES ($1, $2, $3, $4, $5, 1000, 0, $6, $7, $8, $9)
           RETURNING id, email, name, role, location`,
          [user.email, user.name, user.role, user.location, user.phone, user.verified, user.verificationStatus, user.licenseNumber || null, passwordHash]
        );
        createdUsers.push(result[0]);
      } else {
        // Update existing user with password hash if missing
        await dbQuery('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [passwordHash, user.role, user.email]);
        const existingUser = await dbQuery('SELECT id, email, name, role, location FROM users WHERE email = $1', [user.email]);
        createdUsers.push(existingUser[0]);
      }
    }

    // Create sample products
    const products = [
      { name: 'Teff Grain (White)', description: 'Premium quality white Teff grain from the Gojjam highlands, ideal for Injera.', price: 2500.00, category: 'Grains', location: 'Debre Markos, Amhara Region', farmerId: createdUsers[1].id, farmerName: 'Abebe Kebede', stockQuantity: 500, unit: 'kg' },
      { name: 'Yirgacheffe Coffee Beans', description: 'World-renowned aromatic Yirgacheffe coffee beans, Grade 1, washed process.', price: 350.00, category: 'Coffee', location: 'Yirgacheffe, SNNPR', farmerId: createdUsers[2].id, farmerName: 'Fatima Mohammed', stockQuantity: 200, unit: 'kg' },
      { name: 'Sidamo White Honey', description: 'Pure, organic white honey from the Sidamo region, known for its distinct flavor.', price: 500.00, category: 'Honey', location: 'Sidama Region', farmerId: createdUsers[3].id, farmerName: 'Tesfaye Lemma', stockQuantity: 100, unit: 'kg' },
      { name: 'Fresh Avocados (Hass)', description: 'Creamy Hass avocados from Jimma, export quality.', price: 80.00, category: 'Fruits', location: 'Jimma, Oromia Region', farmerId: createdUsers[1].id, farmerName: 'Abebe Kebede', stockQuantity: 300, unit: 'kg' },
      { name: 'White Cabbage', description: 'Fresh, crisp white cabbage from Holeta farms.', price: 30.00, category: 'Vegetables', location: 'Holeta, Oromia Region', farmerId: createdUsers[2].id, farmerName: 'Fatima Mohammed', stockQuantity: 150, unit: 'kg' },
    ];

    for (const product of products) {
      const existing = await dbQuery('SELECT id FROM products WHERE title = $1 AND seller_id = $2', [product.name, product.farmerId]);
      if (existing.length === 0) {
        await dbQuery(
          `INSERT INTO products (title, description, price, category, image_url, seller_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [product.name, product.description, product.price, product.category, 'https://placehold.co/300x200.png', product.farmerId]
        );
      }
    }

    // Create sample learning modules
    const modules = [
      { title: 'የጤፍ አዘራር ዘመናዊ ዘዴዎች', description: 'የጤፍን ምርት ለማሳደግ የሚያግዙ ተግባራዊ የቪዲዮ ትምህርቶችን ይመልከቱ።', contentType: 'video', category: 'Crop Management', language: 'Amharic', duration: '4 hours', rewardPoints: 180, educatorId: createdUsers[7].id },
      { title: 'Efficient Irrigation Systems', description: 'Discover various irrigation methods suitable for Ethiopian climates.', contentType: 'article', category: 'Water Management', language: 'English', duration: '2 hours', rewardPoints: 100, educatorId: createdUsers[7].id },
      { title: 'የግብርና ቴክኖሎጂዎች መግቢያ', description: 'ዘመናዊ የእርሻ መሳሪያዎችን እና ቴክኖሎጂ ምርታማነትን እንዴት እንደሚያሳድግ ይወቁ።', contentType: 'video', category: 'Technology', language: 'Amharic', duration: '3 hours', rewardPoints: 150, educatorId: createdUsers[7].id },
    ];

    for (const module of modules) {
      const existing = await dbQuery('SELECT id FROM \"LearningContent\" WHERE title = $1', [module.title]);
      if (existing.length === 0) {
        await dbQuery(
          `INSERT INTO \"LearningContent\" (title, description, type, content, educatorId, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [module.title, module.description, module.contentType === 'video' ? 'Video' : 'Article', 'Sample Content', module.educatorId, 'published']
        );
      }
    }

    // Create sample storage facilities
    const facilities = [
      { name: 'Addis Prime Cold Storage', location: 'Addis Ababa, Kality', capacity: '5000 Quintals', storageType: 'Cold Storage', features: ['24/7 Security', 'Climate Controlled', 'Backup Power'], pricePerMonth: 75, providerId: createdUsers[8].id },
      { name: 'Adama Grain Silos', location: 'Adama, Oromia Region', capacity: '20,000 Quintals', storageType: 'Grain Silo', features: ['Pest Control', 'Rodent Proofing'], pricePerMonth: 30, providerId: createdUsers[8].id },
    ];

    for (const facility of facilities) {
      const existing = await dbQuery('SELECT id FROM \"StorageFacility\" WHERE name = $1', [facility.name]);
      if (existing.length === 0) {
        await dbQuery(
          `INSERT INTO \"StorageFacility\" (name, location, capacity, storage_type, features, price_per_unit_per_month, provider_id, rating, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 4.5, 'https://placehold.co/300x200.png')`,
          [facility.name, facility.location, facility.capacity, facility.storageType, facility.features, facility.pricePerMonth, facility.providerId]
        );
      }
    }

    // Create sample weather alerts
    const alerts = [
      { region: 'Amhara Region', alertType: 'Kiremt Rain Forecast', severity: 'Medium', message: 'Moderate Kiremt rains expected in central highlands. Prepare fields for planting.' },
      { region: 'Afar Region', alertType: 'Drought Warning', severity: 'High', message: 'Extended dry spell expected. Activate irrigation and conserve water.' },
      { region: 'Oromia Region', alertType: 'Clear & Sunny', severity: 'None', message: 'Clear skies and sunny conditions, ideal for harvesting and drying.' },
    ];

    for (const alert of alerts) {
      await dbQuery(
        `INSERT INTO weather_alerts (region, alert_type, severity, message, active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT DO NOTHING`,
        [alert.region, alert.alertType, alert.severity, alert.message]
      );
    }

    // Create sample IoT devices
    const devices = [
      { userId: createdUsers[1].id, name: 'Debre Birhan Soil Sensor', deviceType: 'Soil Sensor', location: 'Field A', status: 'Online', lastReading: 'Moisture: 25%, Temp: 18°C' },
      { userId: createdUsers[2].id, name: 'Yirgacheffe Weather Station', deviceType: 'Weather Station', location: 'Coffee Farm', status: 'Online', lastReading: 'Wind: 10km/h, Temp: 32°C' },
      { userId: createdUsers[1].id, name: 'Irrigation Controller', deviceType: 'Smart Irrigator', location: 'Field B', status: 'Optimal', lastReading: 'Last cycle: 5 AM, 25m³' },
    ];

    for (const device of devices) {
      const existing = await dbQuery('SELECT id FROM \"IoTDevice\" WHERE name = $1 AND \"farmerId\" = $2', [device.name, device.userId]);
      if (existing.length === 0) {
        await dbQuery(
          `INSERT INTO \"IoTDevice\" (name, type, status, \"farmerId\", lastSeen)
           VALUES ($1, $2, $3, $4, NOW())`,
          [device.name, device.deviceType, device.status.toLowerCase(), device.userId]
        );
      }
    }

    // Create sample notifications
    const notifications = [
      { userId: createdUsers[1].id, type: 'WeatherUpdate', title: 'Kiremt Rains Approaching', message: 'Kiremt season expected to begin in your zone within 7 days.', iconName: 'CloudRain' },
      { userId: createdUsers[2].id, type: 'PriceAlert', title: 'Coffee Price Increase', message: 'Market price for Yirgacheffe coffee has increased by 20 Birr/kg.', iconName: 'TrendingUp' },
    ];

    for (const notification of notifications) {
      await dbQuery(
        `INSERT INTO notifications (\"userId\", type, title, message, read)
         VALUES ($1, $2, $3, $4, false)`,
        [notification.userId, notification.type, notification.title, notification.message]
      );
    }

    // Helper function to create orders
    const createOrder = async (buyerId: string, sellerId: string, product: any, quantity: number, status: string, paymentStatus: string, paymentMethod: string) => {
      // Get product ID
      const productRows = await dbQuery('SELECT id FROM products WHERE title = $1 AND seller_id = $2', [product.name, sellerId]);
      if (productRows.length === 0) return null;
      const productId = productRows[0].id;

      const totalAmount = quantity * product.price;
      const deliveryFee = 150; // Flat rate for seed

      const orderResult = await dbQuery(
        `INSERT INTO orders (\"buyerId\", \"order_number\", total_amount, status, payment_status, \"sellerId\")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [buyerId, `ORD-${Math.floor(Math.random() * 10000)}`, totalAmount + deliveryFee, status.toLowerCase(), paymentStatus.toLowerCase(), sellerId]
      );

      const orderId = orderResult[0].id;

      await dbQuery(
        `INSERT INTO \"OrderItem\" (order_id, product_id, product_name, unit_price, quantity, total_price, seller_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, productId, product.name, product.price, quantity, totalAmount, sellerId]
      );

      return orderId;
    };

    // Create sample orders and transactions
    // 1. Completed order (Abebe sells Teff to Almaz)
    const order1Id = await createOrder(
      createdUsers[4].id, // Buyer: Almaz
      createdUsers[1].id, // Seller: Abebe
      products[0], // Teff
      10, // Quantity
      'completed',
      'released',
      'wallet'
    );

    // 2. In-Escrow order (Fatima sells Coffee to Dawit)
    const order2Id = await createOrder(
      createdUsers[5].id, // Buyer: Dawit
      createdUsers[2].id, // Seller: Fatima
      products[1], // Coffee
      5, // Quantity
      'processing',
      'in_escrow',
      'telebirr'
    );

    // 3. Shipped order (Tesfaye sells Honey to Almaz)
    const order3Id = await createOrder(
      createdUsers[4].id, // Buyer: Almaz
      createdUsers[3].id, // Seller: Tesfaye
      products[2], // Honey
      20, // Quantity
      'shipped',
      'in_escrow',
      'chapa'
    );

    // Create Escrow Transactions
    if (order2Id) {
      await dbQuery(
        `INSERT INTO \"EscrowTransaction\" (order_id, amount, status)
         VALUES ($1, $2, 'held')`,
        [order2Id, 5 * products[1].price]
      );
    }

    if (order3Id) {
      await dbQuery(
        `INSERT INTO \"EscrowTransaction\" (order_id, amount, status)
         VALUES ($1, $2, 'held')`,
        [order3Id, 20 * products[2].price]
      );
    }

    // Create Delivery Requests
    if (order3Id) {
      await dbQuery(
        `INSERT INTO \"Transportation\" (order_id, requester_id, pickup_location, delivery_location, status)
         VALUES ($1, $2, $3, $4, 'accepted')`,
        [order3Id, createdUsers[3].id, products[2].location, createdUsers[4].location]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with rich data',
      stats: {
        users: createdUsers.length,
        products: products.length,
        modules: modules.length,
        facilities: facilities.length,
        alerts: alerts.length,
        devices: devices.length,
        notifications: notifications.length,
        orders: 3
      }
    });
  } catch (err: any) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
