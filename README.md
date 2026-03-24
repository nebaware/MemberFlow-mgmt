# MemberFlow-Pro: Enterprise Membership Management

A high-end, full-stack membership management system tailored for the Ethiopian market, featuring Fayda ID integration, Telebirr payments, and AI-powered OCR verification.

## 🚀 Core Features

### 🛡️ Secure Identity
- **Fayda ID Verification**: Built-in support for Ethiopian National ID validation.
- **OTP Authentication**: Multi-factor security for user registration.

### 💳 Modern Payments
- **Telebirr Integration**: Direct H5 payment flow and QR code generation.
- **AI OCR Screenshot Verification**: Upload a screenshot of your payment receipt; our system automatically extracts the ID and amount.
- **Automated Invoicing**: Instant PDF receipts for every transaction.

### 📊 Administrative Hub
- **Real-time Analytics**: Monitor revenue, active members, and growth trends.
- **Member Oversight**: Easy approval/suspension workflow.
- **Custom Attributes**: Define unique data fields (e.g., "Department", "ID Expiry") for your specific organization.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Motion (Framer Motion)
- **Backend**: Node.js, Express, TypeScript
- **Database**: Firebase Firestore
- **Tools**: Tesseract.js (OCR), pdf-lib (Invoicing), Lucide React (Icons)

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nebaware/MemberFlow-mgmt.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file based on `.env.example`:
   ```env
   GEMINI_API_KEY=your_key_here
   VITE_FIREBASE_CONFIG=...
   ```

4. **Run the application**:
   ```bash
   # Start frontend and backend concurrently
   npm run dev:fullstack
   ```

## 📸 System Previews

| Login & Security | Administrative Hub | Payment & OCR |
|------------------|-------------------|---------------|
| ![Login](https://via.placeholder.com/400x300?text=Login+Portal) | ![Dashboard](https://via.placeholder.com/400x300?text=Admin+Stats) | ![OCR](https://via.placeholder.com/400x300?text=OCR+Verification) |

---
Developed by **Nebaware** | Empowering Ethiopian Organizations.
