# AZMERA - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ database
- Google Gemini API key (for AI features)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd azmera
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE azmera_dev;

# Exit psql
\q
```

#### Initialize Schema

```bash
# Run the init script
psql -U postgres -d azmera_dev -f db/init.sql
```

### 3. Environment Configuration

Create `.env.local` file in the project root:

```env
# Google Gemini API Key (required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/azmera_dev

# Optional: Override default AI model
# GEMINI_MODEL=googleai/gemini-2.0-flash
```

**Get Gemini API Key:**
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste into `.env.local`

### 4. Seed Database (Optional but Recommended)

```bash
# Start the dev server first
npm run dev

# In another terminal, seed the database
curl -X POST http://localhost:9002/api/admin/seed
```

This creates:
- 8 sample users (farmers, buyers, transporters, etc.)
- 5 products
- 3 learning modules
- 2 storage facilities
- Weather alerts
- IoT devices
- Notifications

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:9002

### 6. Test AI Features (Optional)

Start Genkit dev UI to test AI flows:

```bash
npm run genkit:dev
```

Visit http://localhost:4000

---

## 📊 Database Schema Overview

### Core Tables

**users** - User accounts and profiles
- Roles: farmer, buyer, transporter, educator, tool_seller, storage_provider
- Wallet and escrow balance tracking

**products** - Marketplace listings
- Linked to farmer users
- Stock quantity tracking
- Category and location filtering

**orders** - Purchase transactions
- Status tracking (PaymentPending → PaymentInEscrow → Shipped → Completed)
- Buyer, seller, and transporter relationships
- Escrow payment integration

**transactions** - Financial records
- Types: Earning, Withdrawal, EscrowHold, EscrowRelease, Payment, Refund
- Linked to orders and users

**learning_modules** - Educational content
- Created by educators
- Reward points system
- Progress tracking per user

**storage_facilities** - Storage listings
- Provider management
- Capacity and feature tracking

**transportation_requests** - Delivery requests
- Status workflow
- Transporter assignment

**notifications** - Real-time alerts
- User-specific
- Read/unread tracking

**iot_devices** - IoT sensor management
- Device types: Soil Sensor, Weather Station, Smart Irrigator, Drone
- Status and reading tracking

**weather_alerts** - Regional weather warnings
- Severity levels
- Active/expired tracking

**ai_diagnoses** - AI crop diagnosis history
**pricing_suggestions** - AI pricing recommendation history

---

## 🔌 API Endpoints

### Products
- `GET /api/products` - List all products (filter by farmerId, category)
- `POST /api/products` - Create new product
- Query params: `?farmerId=1&category=Grains`

### Orders
- `GET /api/orders` - List orders (filter by userId, role)
- `POST /api/orders` - Create new order (auto-creates escrow transaction)
- `PATCH /api/orders` - Update order status (handles escrow release)
- Query params: `?userId=1&role=buyer` or `?userId=2&role=seller`

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications` - Mark as read
- Query params: `?userId=1&unreadOnly=true`

### Users
- `GET /api/users` - Get user by id or email
- `POST /api/users` - Create new user
- `PATCH /api/users` - Update user profile
- Query params: `?id=1` or `?email=user@example.com`

### Learning
- `GET /api/learning` - List learning modules
- `POST /api/learning` - Create module

### Storage
- `GET /api/storage` - List storage facilities
- `POST /api/storage` - Create facility

### Transportation
- `GET /api/transportation` - List transport requests
- `POST /api/transportation` - Create request

### Weather
- `GET /api/weather` - List active weather alerts
- `POST /api/weather` - Create alert
- Query params: `?region=Amhara Region`

### IoT Devices
- `GET /api/iot-devices` - List devices
- `POST /api/iot-devices` - Register device
- `PATCH /api/iot-devices` - Update device status/reading
- Query params: `?userId=1`

### AI Features
- `POST /api/cooperative-planner` - Get AI planting recommendations
  ```json
  {
    "region": "Amhara Region",
    "farmSize": 2.5,
    "currentCrops": ["Teff", "Maize"],
    "availableResources": "Drip irrigation, tractor",
    "userId": 1
  }
  ```

### Admin
- `POST /api/admin/seed` - Seed database with sample data

---

## 🎯 Unique Features

### 1. **AI Cooperative Planner** (NEW!)
- Analyzes regional market supply/demand
- Recommends optimal crops and planting windows
- Helps farmers coordinate to avoid oversupply
- Maximizes collective profits
- Location: `/cooperative-planner`

### 2. **Escrow Wallet System**
- Secure payment holding
- Automatic release on delivery confirmation
- Protects both buyers and sellers
- Real-time balance tracking

### 3. **AI Crop Advisor**
- Image-based pest/disease diagnosis
- Powered by Google Gemini Vision
- Actionable treatment recommendations

### 4. **Dynamic Pricing Assistant**
- Market trend analysis
- Seasonal pricing optimization
- Quality-based recommendations

### 5. **IoT Integration**
- Soil sensor monitoring
- Weather station data
- Smart irrigation control
- Drone field monitoring

### 6. **Multi-Role Dashboard**
- Role-specific views (Farmer, Buyer, Transporter, etc.)
- Customized metrics and actions
- Real-time notifications

---

## 🔧 Development Commands

```bash
# Development server (port 9002)
npm run dev

# Genkit AI development UI
npm run genkit:dev

# Genkit with auto-reload
npm run genkit:watch

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 🌐 Production Deployment

### Environment Variables (Production)

```env
GEMINI_API_KEY=your_production_api_key
DATABASE_URL=postgresql://user:pass@host:5432/azmera_prod
NODE_ENV=production
```

### Database Migration

```bash
# On production server
psql -U dbuser -d azmera_prod -f db/init.sql

# Seed initial data
curl -X POST https://your-domain.com/api/admin/seed
```

### Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

### Database Hosting Options
- **Neon** - Serverless PostgreSQL (recommended)
- **Supabase** - PostgreSQL with real-time features
- **Railway** - Simple PostgreSQL hosting
- **AWS RDS** - Enterprise-grade PostgreSQL

---

## 🧪 Testing the Application

### 1. Test Database Connection

```bash
curl http://localhost:9002/api/debug
```

Should return database status.

### 2. Create Test User

```bash
curl -X POST http://localhost:9002/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@farmer.et",
    "name": "Test Farmer",
    "role": "farmer",
    "location": "Addis Ababa"
  }'
```

### 3. Create Test Product

```bash
curl -X POST http://localhost:9002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Teff",
    "description": "High quality teff",
    "price": 2000,
    "category": "Grains",
    "location": "Addis Ababa",
    "farmerId": 1,
    "farmerName": "Test Farmer",
    "stockQuantity": 100,
    "unit": "kg"
  }'
```

### 4. Test AI Features

Visit these pages in the browser:
- `/ai-advisor` - Upload crop image
- `/pricing-assistant` - Get price suggestion
- `/cooperative-planner` - Get planting recommendations

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d azmera_dev -c "SELECT 1;"
```

### AI Features Not Working

1. Verify `GEMINI_API_KEY` is set in `.env.local`
2. Check API key has access to Gemini models
3. Try fallback model: `GEMINI_FALLBACK_MODEL=googleai/gemini-1.5-flash`

### Port Already in Use

```bash
# Change port in package.json
"dev": "next dev --turbopack -p 3000"
```

---

## 📱 Mobile Responsiveness

All pages are fully responsive and tested on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## 🔐 Security Notes

**For Production:**
1. Implement proper authentication (NextAuth.js, Clerk, etc.)
2. Add API route protection middleware
3. Validate all user inputs
4. Use prepared statements (already implemented)
5. Enable HTTPS
6. Set up CORS properly
7. Add rate limiting
8. Implement CSRF protection

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Future Enhancements

- [ ] Real-time chat between farmers and buyers
- [ ] Mobile app (React Native)
- [ ] SMS notifications for low-connectivity areas
- [ ] Blockchain-based supply chain tracking
- [ ] Machine learning price prediction
- [ ] Satellite imagery integration
- [ ] Multi-language support (Amharic, Oromo, Tigrinya)
- [ ] Payment gateway integration (Telebirr, CBE Birr)
- [ ] Cooperative group management
- [ ] Loan and credit system
- [ ] Insurance integration
- [ ] Weather API integration (real-time data)
- [ ] Export documentation assistance

---

**Built with ❤️ for Ethiopian Farmers**
