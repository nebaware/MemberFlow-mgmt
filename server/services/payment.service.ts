import crypto from 'crypto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { config } from '../config/config.js';

export class PaymentService {
  public static async initiateTelebirr(amount: number, memberId: string) {
    const transactionId = `T-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return {
      success: true,
      transactionId,
      qrCode: `telebirr://pay?to=MemberFlow&amt=${amount}&ref=${transactionId}`,
      paymentUrl: `https://telebirr.et/pay/${transactionId}`
    };
  }

  public static async verifyOcr(buffer: Buffer) {
    const Tesseract = await import('tesseract.js');
    const result = await Tesseract.recognize(buffer, config.OCR.LANG);
    const text = result.data.text;
    
    // Professional Regex for Ethiopian receipts (Telebirr, CBE, etc.)
    const amountMatch = text.match(/(?:amount|amt|ብር|birr|ብር መጠን|birr amount|etb|total|account)[:\s]*([\d,]+\.?\d*)/i);
    const txidMatch = text.match(/(?:trans|txid|ref|id|transaction|reference|confirmation)[:\s]*([A-Z0-9-]{8,})/i) 
                  || text.match(/[A-Z0-9]{10,}/); // Fallback for raw TXIDs
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/) 
                  || text.match(/([A-Z][a-z]{2}\s\d{1,2},\s\d{4})/);
    
    const confidence = amountMatch && txidMatch ? 95 : (amountMatch || txidMatch ? 60 : 10);

    return {
      success: true,
      confidence,
      parsed: {
        amount: amountMatch ? amountMatch[1].replace(/,/g, '') : undefined,
        transactionId: txidMatch ? (Array.isArray(txidMatch) ? txidMatch[1] : txidMatch[0]).toUpperCase() : undefined,
        date: dateMatch ? (Array.isArray(dateMatch) ? dateMatch[1] : dateMatch[0]) : undefined,
        isValid: !!(amountMatch && txidMatch),
        raw: text.slice(0, 500)
      }
    };
  }

  public static async generateInvoice(data: any) {
    const { memberName, amount, date, status, transactionId } = data;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Header
    page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: rgb(0.04, 0.25, 0.18) });
    page.drawText('MemberFlow-Pro', { x: 50, y: height - 60, size: 28, font: boldFont, color: rgb(1, 1, 1) });
    page.drawText('Official Membership Invoice', { x: 50, y: height - 85, size: 12, font: regularFont, color: rgb(0.8, 0.8, 0.8) });

    // Body
    let y = height - 150;
    page.drawText('INVOICE TO:', { x: 50, y, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(memberName.toUpperCase(), { x: 50, y: y - 20, size: 16, font: boldFont });
    
    page.drawText('INVOICE DETAILS:', { x: 350, y, size: 10, font: boldFont, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(`Date: ${date}`, { x: 350, y: y - 20, size: 12, font: regularFont });
    page.drawText(`Status: ${status.toUpperCase()}`, { x: 350, y: y - 40, size: 12, font: boldFont, color: status === 'completed' ? rgb(0, 0.6, 0.2) : rgb(0.8, 0.4, 0) });

    // Table
    y -= 100;
    page.drawRectangle({ x: 50, y: y - 10, width: 500, height: 30, color: rgb(0.95, 0.95, 0.95) });
    page.drawText('DESCRIPTION', { x: 60, y, size: 10, font: boldFont });
    page.drawText('TRANSACTION ID', { x: 250, y, size: 10, font: boldFont });
    page.drawText('AMOUNT (ETB)', { x: 450, y, size: 10, font: boldFont });

    y -= 40;
    page.drawText('Membership Annual Fee', { x: 60, y, size: 11, font: regularFont });
    page.drawText(transactionId || 'N/A', { x: 250, y, size: 11, font: regularFont });
    page.drawText(`${amount} ETB`, { x: 450, y, size: 11, font: boldFont });

    // Footer
    page.drawLine({ start: { x: 50, y: 150 }, end: { x: 550, y: 150 }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
    page.drawText('Thank you for being a part of our organization!', { x: width / 2 - 100, y: 120, size: 10, font: regularFont, color: rgb(0.5, 0.5, 0.5) });
    page.drawText('This is a computer-generated document. No signature required.', { x: width / 2 - 120, y: 100, size: 8, font: regularFont, color: rgb(0.7, 0.7, 0.7) });

    return await pdfDoc.save();
  }
}
