import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h1 style="color: #0e6b4d;">MemberFlow API</h1>
      <p>The MemberFlow-Pro backend is live and operational.</p>
      <a href="/api/health" style="color: #0e6b4d; text-decoration: none; font-weight: bold;">Check System Health →</a>
    </div>
  `);
});


// Multer for file uploads (OCR screenshots)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// In-memory OTP store (use Redis in production)
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// ─────────────────────────────────────────
// 1. FAYDA ID VERIFICATION
// ─────────────────────────────────────────
app.post('/api/fayda/verify', async (req: Request, res: Response) => {
  const { faydaId } = req.body;

  if (!faydaId || typeof faydaId !== 'string') {
    return res.status(400).json({ success: false, error: 'Fayda ID is required' });
  }

  // In production: call Ethiopian NIDP API
  // https://nidp.gov.et/verify endpoint with Bearer token
  await simulateDelay(1200);

  if (!/^\d{10}$/.test(faydaId)) {
    return res.json({ success: false, error: 'Invalid Fayda ID format. Must be exactly 10 digits.' });
  }

  // Simulate NIDP response
  // Reserved test IDs: 0000000000 = always fail
  if (faydaId === '0000000000') {
    return res.json({ success: false, error: 'Fayda ID not found in national registry' });
  }

  // Generate deterministic "name" from ID for demo purposes
  const names = ['Abebe Bekele', 'Tigist Haile', 'Dawit Mekonnen', 'Hiwot Tadesse', 'Bereket Alemu'];
  const nameIndex = parseInt(faydaId[0]) % names.length;

  return res.json({
    success: true,
    data: {
      id: faydaId,
      fullName: names[nameIndex],
      verified: true,
      verifiedAt: new Date().toISOString(),
      source: 'NIDP-SIM'
    }
  });
});

// ─────────────────────────────────────────
// 2. OTP SERVICE (Africa's Talking / USSD)
// ─────────────────────────────────────────
app.post('/api/otp/send', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore[phoneNumber] = { otp, expiresAt };

  // In production: call Africa's Talking or Ethio Telecom SMS API
  // const AT = require('africastalking')({ apiKey, username });
  // await AT.SMS.send({ to: [phoneNumber], message: `Your MemberFlow OTP: ${otp}`, from: 'MEMBERFLOW' });

  await simulateDelay(800);

  console.log(`[OTP] Sent OTP ${otp} to ${phoneNumber}`);
  // In production, don't return OTP in response!
  return res.json({
    success: true,
    message: `OTP sent to ${phoneNumber}`,
    // Remove this in production:
    _dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined
  });
});

app.post('/api/otp/verify', async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, error: 'Phone number and OTP are required' });
  }

  const record = otpStore[phoneNumber];

  if (!record) {
    return res.json({ success: false, error: 'No OTP found for this phone number. Please request a new one.' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[phoneNumber];
    return res.json({ success: false, error: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp) {
    return res.json({ success: false, error: 'Invalid OTP. Please check and try again.' });
  }

  delete otpStore[phoneNumber];
  return res.json({ success: true, verified: true });
});

// ─────────────────────────────────────────
// 3. TELEBIRR PAYMENT INTEGRATION
// ─────────────────────────────────────────
app.post('/api/payment/telebirr/initiate', async (req: Request, res: Response) => {
  const { amount, memberId, returnUrl } = req.body;

  if (!amount || !memberId) {
    return res.status(400).json({ success: false, error: 'Amount and memberId are required' });
  }

  await simulateDelay(600);

  // In production: Sign request with Telebirr merchant key
  // and call https://developerapi.ethiotelecom.et/api/checkout
  const transactionId = `TB-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Simulate H5 payment URL (Telebirr H5 Pay)
  const paymentUrl = `https://sandbox.ethiotelecom.et/pay?tid=${transactionId}&amount=${amount}&merchant=MEMBERFLOW`;
  const qrData = JSON.stringify({ tid: transactionId, amount, merchant: 'MEMBERFLOW', ts: timestamp });

  return res.json({
    success: true,
    transactionId,
    paymentUrl,
    qrCode: qrData,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    amount,
    currency: 'ETB'
  });
});

// Telebirr callback webhook (called by Telebirr after payment)
app.post('/api/payment/telebirr/callback', async (req: Request, res: Response) => {
  const { transactionId, status, amount, timestamp, signature } = req.body;
  console.log('[Telebirr Callback]', { transactionId, status, amount });
  // In production: verify HMAC signature before updating payment status
  return res.json({ success: true, received: true });
});

// ─────────────────────────────────────────
// 4. OCR PAYMENT SCREENSHOT VERIFICATION
// ─────────────────────────────────────────
app.post('/api/payment/ocr-verify', upload.single('screenshot'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No screenshot file provided' });
  }

  try {
    // Dynamic import of tesseract.js to avoid startup cost
    const Tesseract = await import('tesseract.js');

    const result = await Tesseract.recognize(
      req.file.buffer,
      'eng+amh', // English + Amharic
      { logger: () => {} }
    );

    const text = result.data.text;
    console.log('[OCR] Extracted text:', text.substring(0, 200));

    // Parse extracted text for payment details
    const parsed = parsePaymentText(text);

    return res.json({
      success: true,
      rawText: text,
      parsed,
      confidence: result.data.confidence
    });
  } catch (err: any) {
    console.error('[OCR Error]', err.message);
    return res.status(500).json({ success: false, error: 'OCR processing failed: ' + err.message });
  }
});

function parsePaymentText(text: string): { transactionId?: string; amount?: string; date?: string; recipient?: string; isValid: boolean } {
  // Extract Transaction ID (various patterns)
  const txPatterns = [
    /(?:transaction\s*id|ref(?:erence)?\s*(?:no|num)?|txn?\s*id|receipt\s*no)[:\s#]+([A-Z0-9\-]{6,20})/gi,
    /TB[0-9\-]{8,16}/gi,
    /[A-Z]{2,3}[0-9]{8,12}/g,
  ];
  let transactionId: string | undefined;
  for (const pattern of txPatterns) {
    const match = pattern.exec(text);
    if (match) { transactionId = match[1] || match[0]; break; }
  }

  // Extract amount (ETB patterns)
  const amountPatterns = [
    /(?:amount|birr|etb|payment)[:\s]+([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    /([0-9,]+(?:\.[0-9]{2})?)\s*(?:ETB|birr)/gi,
  ];
  let amount: string | undefined;
  for (const pattern of amountPatterns) {
    const match = pattern.exec(text);
    if (match) { amount = (match[1] || match[0]).replace(/,/g, ''); break; }
  }

  // Extract date
  const datePattern = /(\d{2}[\/\-]\d{2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})/;
  const dateMatch = datePattern.exec(text);
  const date = dateMatch ? dateMatch[1] : undefined;

  // Extract recipient name
  const recipientPattern = /(?:to|sent to|recipient|receiver)[:\s]+([A-Za-z\s]{3,30})/gi;
  const recipientMatch = recipientPattern.exec(text);
  const recipient = recipientMatch ? recipientMatch[1].trim() : undefined;

  const isValid = !!(transactionId || amount);

  return { transactionId, amount, date, recipient, isValid };
}

// ─────────────────────────────────────────
// 5. INVOICE PDF GENERATION
// ─────────────────────────────────────────
app.get('/api/invoice/:paymentId', async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { memberName, amount, date, method, status, orgName } = req.query;

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header background
    page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: rgb(0.055, 0.42, 0.31) });

    // Logo area
    page.drawText('MemberFlow', { x: 40, y: height - 55, size: 28, font: boldFont, color: rgb(1, 1, 1) });
    page.drawText('Pro', { x: 190, y: height - 55, size: 28, font: regularFont, color: rgb(0.7, 1, 0.85) });
    page.drawText('PAYMENT INVOICE', { x: 40, y: height - 85, size: 11, font: regularFont, color: rgb(0.8, 0.95, 0.9) });

    // Invoice number & date (top right)
    page.drawText(`Invoice #MF-${paymentId.slice(-8).toUpperCase()}`, { x: 390, y: height - 50, size: 10, font: boldFont, color: rgb(1, 1, 1) });
    page.drawText(`Issued: ${new Date().toLocaleDateString('en-ET')}`, { x: 390, y: height - 68, size: 9, font: regularFont, color: rgb(0.85, 0.95, 0.9) });

    // Bill To section
    page.drawText('BILL TO', { x: 40, y: height - 160, size: 9, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(String(memberName || 'Member'), { x: 40, y: height - 178, size: 14, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(String(orgName || 'Organization Member'), { x: 40, y: height - 196, size: 10, font: regularFont, color: rgb(0.5, 0.5, 0.5) });

    // Payment details table
    const tableY = height - 270;
    page.drawRectangle({ x: 40, y: tableY - 10, width: width - 80, height: 30, color: rgb(0.95, 0.97, 0.96) });
    page.drawText('DESCRIPTION', { x: 50, y: tableY, size: 9, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('METHOD', { x: 270, y: tableY, size: 9, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('DATE', { x: 380, y: tableY, size: 9, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
    page.drawText('AMOUNT', { x: 490, y: tableY, size: 9, font: boldFont, color: rgb(0.3, 0.3, 0.3) });

    const rowY = tableY - 35;
    page.drawText('Annual Membership Fee', { x: 50, y: rowY, size: 11, font: regularFont, color: rgb(0.15, 0.15, 0.15) });
    page.drawText(String(method || 'Manual'), { x: 270, y: rowY, size: 10, font: regularFont, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(String(date || new Date().toLocaleDateString('en-ET')), { x: 380, y: rowY, size: 10, font: regularFont, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`${amount || '0'} ETB`, { x: 490, y: rowY, size: 11, font: boldFont, color: rgb(0.055, 0.42, 0.31) });

    // Divider
    page.drawLine({ start: { x: 40, y: rowY - 20 }, end: { x: width - 40, y: rowY - 20 }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });

    // Total
    page.drawText('TOTAL', { x: 380, y: rowY - 45, size: 11, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`${amount || '0'} ETB`, { x: 490, y: rowY - 45, size: 14, font: boldFont, color: rgb(0.055, 0.42, 0.31) });

    // Status badge
    const statusColor = String(status) === 'completed' ? rgb(0.055, 0.42, 0.31) : rgb(0.8, 0.5, 0.05);
    page.drawRectangle({ x: 40, y: rowY - 90, width: 100, height: 24, color: statusColor, borderRadius: 4 });
    page.drawText(String(status || 'Pending').toUpperCase(), { x: 50, y: rowY - 82, size: 9, font: boldFont, color: rgb(1, 1, 1) });

    // Footer
    page.drawLine({ start: { x: 40, y: 80 }, end: { x: width - 40, y: 80 }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
    page.drawText('MemberFlow Pro — Ethiopian Membership Management System', { x: 40, y: 60, size: 8, font: regularFont, color: rgb(0.6, 0.6, 0.6) });
    page.drawText('This is a system-generated invoice. Contact admin for queries.', { x: 40, y: 45, size: 8, font: regularFont, color: rgb(0.7, 0.7, 0.7) });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${paymentId}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length);
    return res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error('[Invoice Error]', err.message);
    return res.status(500).json({ success: false, error: 'Invoice generation failed' });
  }
});

// ─────────────────────────────────────────
// 6. ADMIN STATS
// ─────────────────────────────────────────
app.get('/api/admin/stats', async (_req: Request, res: Response) => {
  // In production: query Firestore here; returning mock structure
  return res.json({
    success: true,
    data: {
      totalMembers: 0,
      activeMembers: 0,
      pendingMembers: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingPayments: 0
    }
  });
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ success: false, error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 MemberFlow API Server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

function simulateDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
