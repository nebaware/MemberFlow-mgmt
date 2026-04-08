import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import { config } from './config/config.js';
import { errorHandler } from './middleware/error.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import memberRoutes from './routes/member.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscRoutes from './routes/misc.routes.js';
import orgRoutes from './routes/organization.routes.js';
import adminRoutes from './routes/admin.routes.js';
import eventRoutes from './routes/event.routes.js';
import blogRoutes from './routes/blog.routes.js';
import superAdminRoutes from './routes/superAdmin.routes.js';
import orgAdminDashboardRoutes from './routes/orgAdminDashboard.routes.js';
import publicRoutes from './routes/public.routes.js';
import accountRoutes from './routes/account.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.PORT;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier dev/simulations
}));
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Static Frontend (Production Only)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // SPA Routing: Serve index.html for non-API routes
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/org-admin/dashboard', orgAdminDashboardRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/account', accountRoutes);
app.use('/api', miscRoutes);

// Root Landing
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:50px;">
      <h1>MemberFlow Professional API v2</h1>
      <p>Status: Online | Mode: Modular</p>
    </div>
  `);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 MemberFlow API Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.ENV}`);
});
