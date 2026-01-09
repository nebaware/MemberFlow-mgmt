'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  userRole: string;
  onUploadComplete?: (result: any) => void;
  onVerificationUpdate?: (verification: any) => void;
}

interface DocumentRequirement {
  type: string;
  name: string;
  description: string;
  required: boolean;
  examples: string[];
}

export function DocumentUpload({ userRole, onUploadComplete, onVerificationUpdate }: DocumentUploadProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [userCompliance, setUserCompliance] = useState<any>(null);

  // Document requirements by role
  const documentRequirements: Record<string, DocumentRequirement[]> = {
    farmer: [
      {
        type: 'id_card',
        name: 'Government ID Card',
        description: 'Valid Ethiopian ID card or passport',
        required: true,
        examples: ['National ID Card', 'Passport', 'Regional ID']
      },
      {
        type: 'agricultural_permit',
        name: 'Agricultural Permit',
        description: 'Land use permit or farming certificate',
        required: true,
        examples: ['Land Use Certificate', 'Farming Permit', 'Agricultural License']
      },
      {
        type: 'tax_certificate',
        name: 'Tax Certificate',
        description: 'Tax identification (optional for small farmers)',
        required: false,
        examples: ['TIN Certificate', 'Tax Registration']
      }
    ],
    buyer: [
      {
        type: 'id_card',
        name: 'Government ID Card',
        description: 'Valid Ethiopian ID card or passport',
        required: true,
        examples: ['National ID Card', 'Passport', 'Regional ID']
      },
      {
        type: 'business_permit',
        name: 'Business License',
        description: 'Required for commercial buyers',
        required: false,
        examples: ['Business License', 'Trade Permit', 'Commercial Registration']
      }
    ],
    tool_seller: [
      {
        type: 'id_card',
        name: 'Government ID Card',
        description: 'Valid Ethiopian ID card or passport',
        required: true,
        examples: ['National ID Card', 'Passport', 'Regional ID']
      },
      {
        type: 'business_permit',
        name: 'Business License',
        description: 'Business license for equipment sales',
        required: true,
        examples: ['Business License', 'Trade Permit', 'Equipment Sales License']
      },
      {
        type: 'tax_certificate',
        name: 'Tax Certificate',
        description: 'Tax registration certificate',
        required: true,
        examples: ['TIN Certificate', 'Tax Registration', 'VAT Certificate']
      }
    ],
    transporter: [
      {
        type: 'id_card',
        name: 'Government ID Card',
        description: 'Valid Ethiopian ID card or passport',
        required: true,
        examples: ['National ID Card', 'Passport', 'Regional ID']
      },
      {
        type: 'license',
        name: 'Driving License',
        description: 'Commercial driving license',
        required: true,
        examples: ['Commercial License', 'Heavy Vehicle License', 'Transport License']
      },
      {
        type: 'vehicle_registration',
        name: 'Vehicle Registration',
        description: 'Vehicle registration documents',
        required: true,
        examples: ['Vehicle Registration', 'Ownership Certificate', 'Blue Book']
      },
      {
        type: 'insurance_certificate',
        name: 'Insurance Certificate',
        description: 'Vehicle insurance certificate',
        required: true,
        examples: ['Vehicle Insurance', 'Third Party Insurance', 'Comprehensive Insurance']
      }
    ],
    educator: [
      {
        type: 'id_card',
        name: 'Government ID Card',
        description: 'Valid Ethiopian ID card or passport',
        required: true,
        examples: ['National ID Card', 'Passport', 'Regional ID']
      },
      {
        type: 'education_certificate',
        name: 'Education Certificate',
        description: 'Educational qualification certificate',
        required: true,
        examples: ['Degree Certificate', 'Diploma', 'Professional Certificate']
      },
      {
        type: 'teaching_permit',
        name: 'Teaching License',
        description: 'Teaching license (if applicable)',
        required: false,
        examples: ['Teaching License', 'Instructor Permit', 'Training Certificate']
      }
    ],
    storage_provider: [
      {
        type: 'id_card',
        name: 'Government ID Card',
        description: 'Valid Ethiopian ID card or passport',
        required: true,
        examples: ['National ID Card', 'Passport', 'Regional ID']
      },
      {
        type: 'business_permit',
        name: 'Business License',
        description: 'Storage facility business license',
        required: true,
        examples: ['Storage License', 'Warehouse Permit', 'Facility License']
      },
      {
        type: 'facility_certificate',
        name: 'Facility Certificate',
        description: 'Storage facility safety certificate',
        required: true,
        examples: ['Safety Certificate', 'Quality Assurance', 'Facility Inspection']
      },
      {
        type: 'tax_certificate',
        name: 'Tax Certificate',
        description: 'Tax registration certificate',
        required: true,
        examples: ['TIN Certificate', 'Tax Registration', 'VAT Certificate']
      }
    ]
  };

  const currentRequirements = documentRequirements[userRole] || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload JPEG, PNG, or PDF files only.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploadedFile(file);
    setVerificationResult(null);
  };

  const handleUpload = async () => {
    if (!uploadedFile || !selectedDocumentType) {
      toast({
        title: 'Missing Information',
        description: 'Please select a document type and file.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', uploadedFile);
      formData.append('documentType', selectedDocumentType);
      if (documentNumber) {
        formData.append('documentNumber', documentNumber);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setVerificationResult(result);
      onUploadComplete?.(result);
      onVerificationUpdate?.(result.userVerification);

      toast({
        title: result.document.status === 'verified' ? 'Document Verified' : 'Verification Failed',
        description: result.message,
        variant: result.document.status === 'verified' ? 'default' : 'destructive'
      });

      // Reset form
      setUploadedFile(null);
      setSelectedDocumentType('');
      setDocumentNumber('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Requirements for {userRole.replace('_', ' ').toUpperCase()}
          </CardTitle>
          <CardDescription>
            Please upload the following documents to verify your account and unlock full platform features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {currentRequirements.map((req) => (
              <div key={req.type} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{req.name}</h4>
                    <Badge variant={req.required ? 'destructive' : 'secondary'}>
                      {req.required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Examples:</strong> {req.examples.join(', ')}
                  </div>
                </div>
                {getStatusIcon('pending')}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
          <CardDescription>
            Select a document type and upload a clear, high-quality image or PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {currentRequirements.map((req) => (
                  <SelectItem key={req.type} value={req.type}>
                    {req.name} {req.required && '*'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Number (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number (Optional)</Label>
            <Input
              id="documentNumber"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Enter document number if available"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="document">Document File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                id="document"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-2">
                <Camera className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  JPEG, PNG, or PDF up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Display */}
          {uploadedFile && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Selected: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
              </AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading and verifying document...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!uploadedFile || !selectedDocumentType || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Verify Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(verificationResult.document.status)}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(verificationResult.document.status)}>
                {verificationResult.document.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Confidence: {(verificationResult.document.confidence * 100).toFixed(1)}%
              </span>
            </div>

            {/* Extracted Data */}
            {verificationResult.document.extractedData && Object.keys(verificationResult.document.extractedData).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Extracted Information:</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  {Object.entries(verificationResult.document.extractedData as Record<string, any>).map(([key, value]) => (
                    value && (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <span>{value as string}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {verificationResult.document.recommendations && verificationResult.document.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {verificationResult.document.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Verification Status */}
            {verificationResult.userVerification && (
              <div>
                <h4 className="font-medium mb-2">Account Status:</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {verificationResult.userVerification.level.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Can list products: {verificationResult.userVerification.restrictions.can_list_products ? '✅' : '❌'}</div>
                    <div>Can offer services: {verificationResult.userVerification.restrictions.can_offer_services ? '✅' : '❌'}</div>
                    <div>Max transaction: {verificationResult.userVerification.restrictions.max_transaction_amount} Birr</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}