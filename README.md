# MemberFlow-Pro: Self-Contained Membership Management

**MemberFlow-Pro** is a zero-configuration, professional-grade platform designed for organizations to manage members, process payments via Telebirr/Manual, and perform AI-driven verification—all from a single, locally-hosted dashboard.

## ✨ Features

- **🛡️ Secure JWT Authentication**: Full user flow with encrypted sessions and password hashing, managed entirely locally.
- **📱 Fayda Identity Support**: Seamless verification of Ethiopian National IDs.
- **⚡ AI OCR Verification**: Automated analysis of payment screenshots using backend-integrated Tesseract.js.
- **📊 Real-time Dashboard**: Comprehensive analytics, member directory, and financial reporting.
- **📄 Automated Invoicing**: Generate professional PDF receipts for all membership transactions.
- **🎨 Midnight Emerald UI**: A premium, futuristic interface with rich animations and glassmorphism.

## 🚀 Quick Start (Zero-Config)

### 1. Installation
```powershell
# Install all dependencies (Frontend & Backend)
npm install
cd server
npm install
cd ..
```

### 2. Launch
```powershell
# Run the complete Full-Stack system locally
npm run dev:fullstack
```
The Frontend will be available at `http://localhost:3000` and the Backend API at `http://localhost:3001`.

### 3. Admin Access
Standard credentials for the initial dashboard:
- **Email**: `nebiyutsegaye213@gmail.com`
- **Password**: `admin123`

## 🛠️ System Architecture

- **Frontend**: React, Tailwind CSS, Framer Motion, Axios, Lucide Icons.
- **Backend**: Node.js/Express, JWT, BCrypt, Multer, Tesseract.js, PDF-Lib.
- **Persistence**: `server/db.json` (Local file-based database).

## 🌍 Self-Hosted Benefits
- **Zero External API Costs**: No Firebase limits or usage fees.
- **Complete Privacy**: All data stays on your local machine.
- **Instant Deployment**: No cloud setup, environment variables, or complex configuration required.

---
*Powered by MemberFlow High-Energy Frameworks.*
