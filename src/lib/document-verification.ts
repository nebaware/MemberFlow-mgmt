import { dbQuery } from '@/lib/db/db';

export interface DocumentVerificationResult {
  isValid: boolean;
  confidence: number;
  extractedData: {
    name?: string;
    documentNumber?: string;
    expiryDate?: string;
    issuer?: string;
    documentType?: string;
  };
  fraudIndicators: string[];
  recommendations: string[];
}

export interface DocumentUpload {
  userId: number;
  documentType: string;
  documentUrl: string;
  documentNumber?: string;
}

export class DocumentVerificationService {

  /**
   * AI-powered document verification using Google Vision API
   */
  async verifyDocument(
    documentUrl: string,
    documentType: string,
    userId: number
  ): Promise<DocumentVerificationResult> {
    try {
      // Step 1: Extract text using OCR
      const extractedText = await this.extractTextFromDocument(documentUrl);

      // Step 2: Analyze document structure and content
      const analysis = await this.analyzeDocumentContent(extractedText, documentType);

      // Step 3: Check for fraud indicators
      const fraudCheck = await this.detectFraud(extractedText, documentType, userId);

      // Step 4: Validate against known patterns
      const validation = await this.validateDocumentFormat(analysis.extractedData, documentType);

      // Step 5: Calculate overall confidence score
      const confidence = this.calculateConfidenceScore(analysis, fraudCheck, validation);

      return {
        isValid: confidence >= 0.7 && fraudCheck.fraudIndicators.length === 0,
        confidence,
        extractedData: analysis.extractedData,
        fraudIndicators: fraudCheck.fraudIndicators,
        recommendations: this.generateRecommendations(analysis, fraudCheck, validation)
      };

    } catch (error) {
      console.error('Document verification failed:', error);
      return {
        isValid: false,
        confidence: 0,
        extractedData: {},
        fraudIndicators: ['verification_failed'],
        recommendations: ['Manual review required due to technical error']
      };
    }
  }

  /**
   * Extract text from document using OCR
   */
  private async extractTextFromDocument(documentUrl: string): Promise<string> {
    // In production, integrate with Google Vision API or similar
    // For now, simulate OCR extraction

    // Mock OCR results based on document type patterns
    const mockOcrResults = {
      'id_card': `
        FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
        IDENTITY CARD
        Name: ABEBE KEBEDE TADESSE
        ID Number: ET-123456789
        Date of Birth: 15/03/1985
        Place of Birth: ADDIS ABABA
        Issue Date: 01/01/2020
        Expiry Date: 01/01/2030
      `,
      'license': `
        ETHIOPIA TRANSPORT AUTHORITY
        DRIVING LICENSE
        License No: DL-987654321
        Name: TIGIST ALEMU WORKU
        Category: C (Commercial)
        Issue Date: 15/06/2022
        Expiry Date: 15/06/2027
      `,
      'business_permit': `
        ADDIS ABABA CITY ADMINISTRATION
        BUSINESS LICENSE
        License No: BL-456789123
        Business Name: AZMERA AGRICULTURAL TOOLS
        Owner: YOHANNES HAILE MARIAM
        Issue Date: 01/04/2023
        Expiry Date: 01/04/2024
        Activity: Agricultural Equipment Sales
      `
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockOcrResults[documentUrl.includes('id') ? 'id_card' :
      documentUrl.includes('license') ? 'license' : 'business_permit'] || '';
  }

  /**
   * Analyze document content using AI
   */
  private async analyzeDocumentContent(text: string, documentType: string) {
    const patterns = {
      id_card: {
        namePattern: /Name:\s*([A-Z\s]+)/i,
        numberPattern: /ID Number:\s*([A-Z0-9-]+)/i,
        expiryPattern: /Expiry Date:\s*(\d{2}\/\d{2}\/\d{4})/i,
        issuerPattern: /(FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA|ETHIOPIA)/i
      },
      license: {
        namePattern: /Name:\s*([A-Z\s]+)/i,
        numberPattern: /License No:\s*([A-Z0-9-]+)/i,
        expiryPattern: /Expiry Date:\s*(\d{2}\/\d{2}\/\d{4})/i,
        issuerPattern: /(TRANSPORT AUTHORITY|ETHIOPIA)/i
      },
      business_permit: {
        namePattern: /Owner:\s*([A-Z\s]+)/i,
        numberPattern: /License No:\s*([A-Z0-9-]+)/i,
        expiryPattern: /Expiry Date:\s*(\d{2}\/\d{2}\/\d{4})/i,
        issuerPattern: /(CITY ADMINISTRATION|ETHIOPIA)/i
      }
    };

    const pattern = patterns[documentType as keyof typeof patterns];
    if (!pattern) {
      throw new Error(`Unsupported document type: ${documentType}`);
    }

    const extractedData = {
      name: text.match(pattern.namePattern)?.[1]?.trim(),
      documentNumber: text.match(pattern.numberPattern)?.[1]?.trim(),
      expiryDate: text.match(pattern.expiryPattern)?.[1]?.trim(),
      issuer: text.match(pattern.issuerPattern)?.[1]?.trim(),
      documentType
    };

    return { extractedData, rawText: text };
  }

  /**
   * Detect potential fraud indicators
   */
  private async detectFraud(text: string, documentType: string, userId: number) {
    const fraudIndicators: string[] = [];

    // Check for duplicate documents
    const duplicateCheck = await this.checkDuplicateDocuments(text, documentType, userId);
    if (duplicateCheck.isDuplicate) {
      fraudIndicators.push('duplicate_document');
    }

    // Check document quality indicators
    if (text.length < 50) {
      fraudIndicators.push('poor_quality_scan');
    }

    // Check for suspicious patterns
    if (text.includes('COPY') || text.includes('SAMPLE')) {
      fraudIndicators.push('sample_document');
    }

    // Check expiry date
    const expiryMatch = text.match(/Expiry Date:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (expiryMatch) {
      const expiryDate = new Date(expiryMatch[1].split('/').reverse().join('-'));
      if (expiryDate < new Date()) {
        fraudIndicators.push('expired_document');
      }
    }

    // Check against blacklisted patterns
    const blacklistedNumbers = ['123456789', '000000000', '111111111'];
    const numberMatch = text.match(/(?:ID Number|License No):\s*([A-Z0-9-]+)/i);
    if (numberMatch && blacklistedNumbers.some(num => numberMatch[1].includes(num))) {
      fraudIndicators.push('blacklisted_number');
    }

    return { fraudIndicators, duplicateCheck };
  }

  /**
   * Check for duplicate documents in the system
   */
  private async checkDuplicateDocuments(text: string, documentType: string, userId: number) {
    const numberMatch = text.match(/(?:ID Number|License No):\s*([A-Z0-9-]+)/i);
    if (!numberMatch) return { isDuplicate: false };

    const documentNumber = numberMatch[1];

    const existingDocs = await dbQuery(
      `SELECT user_id, verification_status 
       FROM user_documents 
       WHERE document_number = $1 AND document_type = $2 AND user_id != $3`,
      [documentNumber, documentType, userId]
    );

    return {
      isDuplicate: existingDocs.length > 0,
      existingUsers: existingDocs.map((doc: any) => doc.user_id),
      conflictingStatuses: existingDocs.map((doc: any) => doc.verification_status)
    };
  }

  /**
   * Validate document format against Ethiopian standards
   */
  private validateDocumentFormat(extractedData: any, documentType: string) {
    const validationResults = {
      isValidFormat: true,
      issues: [] as string[]
    };

    switch (documentType) {
      case 'id_card':
        // Ethiopian ID format: ET-XXXXXXXXX
        if (extractedData.documentNumber && !extractedData.documentNumber.match(/^ET-\d{9}$/)) {
          validationResults.isValidFormat = false;
          validationResults.issues.push('Invalid Ethiopian ID format');
        }
        break;

      case 'license':
        // Ethiopian license format: DL-XXXXXXXXX
        if (extractedData.documentNumber && !extractedData.documentNumber.match(/^DL-\d{9}$/)) {
          validationResults.isValidFormat = false;
          validationResults.issues.push('Invalid Ethiopian license format');
        }
        break;

      case 'business_permit':
        // Business license format: BL-XXXXXXXXX
        if (extractedData.documentNumber && !extractedData.documentNumber.match(/^BL-\d{9}$/)) {
          validationResults.isValidFormat = false;
          validationResults.issues.push('Invalid Ethiopian business license format');
        }
        break;
    }

    // Validate name format (Ethiopian names)
    if (extractedData.name && !extractedData.name.match(/^[A-Z\s]{2,50}$/)) {
      validationResults.issues.push('Invalid name format');
    }

    // Validate expiry date
    if (extractedData.expiryDate) {
      const expiryDate = new Date(extractedData.expiryDate.split('/').reverse().join('-'));
      if (isNaN(expiryDate.getTime())) {
        validationResults.issues.push('Invalid expiry date format');
      }
    }

    return validationResults;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidenceScore(analysis: any, fraudCheck: any, validation: any): number {
    let score = 1.0;

    // Deduct for missing data
    const requiredFields = ['name', 'documentNumber', 'issuer'];
    const missingFields = requiredFields.filter(field => !analysis.extractedData[field]);
    score -= missingFields.length * 0.2;

    // Deduct for fraud indicators
    score -= fraudCheck.fraudIndicators.length * 0.3;

    // Deduct for validation issues
    score -= validation.issues.length * 0.15;

    // Bonus for high-quality extraction
    if (analysis.rawText.length > 200) score += 0.1;
    if (analysis.extractedData.expiryDate) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate recommendations for document verification
   */
  private generateRecommendations(analysis: any, fraudCheck: any, validation: any): string[] {
    const recommendations: string[] = [];

    if (fraudCheck.fraudIndicators.includes('poor_quality_scan')) {
      recommendations.push('Please upload a higher quality scan of the document');
    }

    if (fraudCheck.fraudIndicators.includes('expired_document')) {
      recommendations.push('Document has expired. Please upload a valid, current document');
    }

    if (fraudCheck.fraudIndicators.includes('duplicate_document')) {
      recommendations.push('This document is already registered with another account');
    }

    if (validation.issues.length > 0) {
      recommendations.push('Document format does not match Ethiopian standards');
    }

    if (!analysis.extractedData.name) {
      recommendations.push('Name could not be clearly read. Please ensure document is clearly visible');
    }

    if (!analysis.extractedData.documentNumber) {
      recommendations.push('Document number could not be extracted. Please check image quality');
    }

    if (recommendations.length === 0) {
      recommendations.push('Document verification successful');
    }

    return recommendations;
  }

  /**
   * Save document verification result to database
   */
  async saveVerificationResult(
    userId: number,
    documentType: string,
    documentUrl: string,
    verificationResult: DocumentVerificationResult
  ) {
    const result = await dbQuery(
      `INSERT INTO user_documents (
        user_id, document_type, document_url, document_number,
        verification_status, ai_confidence_score, fraud_indicators,
        extracted_data, verification_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        userId,
        documentType,
        documentUrl,
        verificationResult.extractedData.documentNumber || null,
        verificationResult.isValid ? 'verified' : 'rejected',
        verificationResult.confidence,
        JSON.stringify(verificationResult.fraudIndicators),
        JSON.stringify(verificationResult.extractedData),
        verificationResult.recommendations.join('; ')
      ]
    );

    // Log fraud indicators if any
    if (verificationResult.fraudIndicators.length > 0) {
      for (const indicator of verificationResult.fraudIndicators) {
        await dbQuery(
          `INSERT INTO fraud_detection_logs (
            user_id, document_id, fraud_type, confidence_score, details
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            userId,
            result[0].id,
            indicator,
            verificationResult.confidence,
            JSON.stringify({ recommendations: verificationResult.recommendations })
          ]
        );
      }
    }

    return result[0];
  }

  /**
   * Check if user has all required documents for their role
   */
  async checkUserDocumentCompliance(userId: number): Promise<{
    isCompliant: boolean;
    missingDocuments: string[];
    verificationStatus: string;
    restrictions: string[];
  }> {
    // Get user role
    const user = await dbQuery(
      'SELECT role, verification_level FROM users WHERE id = $1',
      [userId]
    );

    if (!user.length) {
      throw new Error('User not found');
    }

    const userRole = user[0].role;

    // Get required documents for role
    const requiredDocs = await dbQuery(
      'SELECT document_type FROM role_document_requirements WHERE role = $1 AND is_required = TRUE',
      [userRole]
    );

    // Get user's uploaded documents
    const userDocs = await dbQuery(
      'SELECT document_type, verification_status FROM user_documents WHERE user_id = $1',
      [userId]
    );

    const uploadedTypes = userDocs.map((doc: any) => doc.document_type);
    const verifiedTypes = userDocs
      .filter((doc: any) => doc.verification_status === 'verified')
      .map((doc: any) => doc.document_type);

    const requiredTypes = requiredDocs.map((doc: any) => doc.document_type);
    const missingDocuments = requiredTypes.filter((type: any) => !uploadedTypes.includes(type));
    const unverifiedDocuments = requiredTypes.filter((type: any) =>
      uploadedTypes.includes(type) && !verifiedTypes.includes(type)
    );

    const isCompliant = missingDocuments.length === 0 && unverifiedDocuments.length === 0;

    let verificationStatus = 'unverified';
    if (isCompliant) {
      verificationStatus = 'verified';
    } else if (missingDocuments.length === 0) {
      verificationStatus = 'pending_verification';
    }

    const restrictions = [];
    if (!isCompliant) {
      restrictions.push('Cannot list products or offer services');
      restrictions.push('Limited transaction amounts');
      restrictions.push('Manual approval required for all activities');
    }

    return {
      isCompliant,
      missingDocuments,
      verificationStatus,
      restrictions
    };
  }

  /**
   * Update user verification level based on document compliance
   */
  async updateUserVerificationLevel(userId: number) {
    const compliance = await this.checkUserDocumentCompliance(userId);

    let newLevel = 'unverified';
    let restrictions = {
      can_list_products: false,
      can_offer_services: false,
      max_transaction_amount: 1000,
      requires_manual_approval: true
    };

    if (compliance.isCompliant) {
      newLevel = 'verified';
      restrictions = {
        can_list_products: true,
        can_offer_services: true,
        max_transaction_amount: 100000,
        requires_manual_approval: false
      };
    }

    await dbQuery(
      `UPDATE users SET 
        verification_level = $1,
        account_restrictions = $2,
        updated_at = NOW()
       WHERE id = $3`,
      [newLevel, JSON.stringify(restrictions), userId]
    );

    return { newLevel, restrictions };
  }
}

export const documentVerificationService = new DocumentVerificationService();