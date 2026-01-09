
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/auth-helpers'; // Changed from verifyAuth
import { documentVerificationService } from '@/lib/document-verification';
import { securityMiddleware, withAuth } from '@/lib/security/security-middleware';
import { createSecureResponse } from '@/lib/security/security-headers';

export async function POST(request: NextRequest) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['POST']
  }));

  if (securityResult) return securityResult;

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const formData = await request.formData();
    const file = formData.get('document') as File;
    const documentType = formData.get('documentType') as string;
    const documentNumber = formData.get('documentNumber') as string;

    if (!file || !documentType) {
      return createSecureResponse(
        { error: 'Document file and type are required' },
        400
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return createSecureResponse(
        { error: 'Only JPEG, PNG, and PDF files are allowed' },
        400
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return createSecureResponse(
        { error: 'File size must be less than 10MB' },
        400
      );
    }

    // Validate document type
    const validDocumentTypes = [
      'id_card', 'license', 'business_permit', 'tax_certificate',
      'agricultural_permit', 'vehicle_registration', 'insurance_certificate',
      'education_certificate', 'teaching_permit', 'facility_certificate'
    ];

    if (!validDocumentTypes.includes(documentType)) {
      return createSecureResponse(
        { error: 'Invalid document type' },
        400
      );
    }

    // Save file (in production, upload to cloud storage)
    const fileName = `${user.id}_${documentType}_${Date.now()}.${file.name.split('.').pop()} `;
    const documentUrl = `/ uploads / documents / ${fileName} `;

    // For now, simulate file upload
    // In production: upload to AWS S3, Google Cloud Storage, etc.

    // Verify document using AI
    const verificationResult = await documentVerificationService.verifyDocument(
      documentUrl,
      documentType,
      parseInt(user.id)
    );

    // Save verification result to database
    const savedDocument = await documentVerificationService.saveVerificationResult(
      parseInt(user.id),
      documentType,
      documentUrl,
      verificationResult
    );

    // Update user verification level
    const updatedVerification = await documentVerificationService.updateUserVerificationLevel(
      parseInt(user.id)
    );

    // Create notification for user
    const notificationMessage = verificationResult.isValid
      ? `Your ${documentType.replace('_', ' ')} has been verified successfully.`
      : `Your ${documentType.replace('_', ' ')} verification failed.Please check the requirements and upload again.`;

    // In production, send notification
    // await createNotification(user.id, 'document_verification', notificationMessage);

    return createSecureResponse({
      success: true,
      document: {
        id: savedDocument.id,
        type: documentType,
        status: verificationResult.isValid ? 'verified' : 'rejected',
        confidence: verificationResult.confidence,
        extractedData: verificationResult.extractedData,
        recommendations: verificationResult.recommendations
      },
      userVerification: {
        level: updatedVerification.newLevel,
        restrictions: updatedVerification.restrictions
      },
      message: notificationMessage
    });

  } catch (error: any) {
    console.error('Document upload error:', error);
    return createSecureResponse(
      { error: 'Document upload failed', details: error.message },
      500
    );
  }
}

export async function GET(request: NextRequest) {
  // Apply security middleware
  const securityResult = await securityMiddleware(request, withAuth({
    rateLimit: 'api',
    allowedMethods: ['GET']
  }));

  if (securityResult) return securityResult;

  try {
    // Verify authentication
    const user = await getAuthUser(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Get user's document compliance status
    const compliance = await documentVerificationService.checkUserDocumentCompliance(
      parseInt(user.id)
    );

    return createSecureResponse({
      success: true,
      compliance
    });

  } catch (error: any) {
    console.error('Document status check error:', error);
    return createSecureResponse(
      { error: 'Failed to check document status', details: error.message },
      500
    );
  }
}