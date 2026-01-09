'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  User,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: number;
  user_id: number;
  document_type: string;
  document_url: string;
  document_number: string;
  verification_status: string;
  ai_confidence_score: number;
  fraud_indicators: string[];
  extracted_data: any;
  verification_notes: string;
  rejection_reason: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  user_role: string;
  verification_level: string;
  verified_by_name: string;
}

interface DocumentStats {
  pending: number;
  verified: number;
  rejected: number;
  processing: number;
}

export function DocumentManagement() {
  const t = useTranslations();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({ pending: 0, verified: 0, rejected: 0, processing: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter, typeFilter, searchQuery, currentPage]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/documents?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch documents');
      }

      setDocuments(result.documents);
      setStats(result.statistics);
    } catch (error: any) {
      console.error('Fetch documents error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAction = async (action: 'approve' | 'reject' | 'request_resubmission') => {
    if (!selectedDocument) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);

      const response = await fetch('/api/admin/documents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          action,
          notes: actionNotes,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Action failed');
      }

      toast({
        title: 'Success',
        description: result.message,
        variant: 'default'
      });

      // Reset form and close dialog
      setSelectedDocument(null);
      setActionNotes('');
      setRejectionReason('');

      // Refresh documents
      fetchDocuments();

    } catch (error: any) {
      console.error('Document action error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Action failed',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
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
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.processing || 0}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="id_card">ID Card</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="business_permit">Business Permit</SelectItem>
                  <SelectItem value="tax_certificate">Tax Certificate</SelectItem>
                  <SelectItem value="agricultural_permit">Agricultural Permit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or document number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={fetchDocuments} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Verification Queue
          </CardTitle>
          <CardDescription>
            Review and verify user-submitted documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Confidence</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{doc.user_name}</div>
                          <div className="text-sm text-muted-foreground">{doc.user_email}</div>
                          <Badge variant="outline" className="text-xs">
                            {doc.user_role.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{formatDocumentType(doc.document_type)}</div>
                          {doc.document_number && (
                            <div className="text-sm text-muted-foreground">#{doc.document_number}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.verification_status)}
                          <Badge className={getStatusColor(doc.verification_status)}>
                            {doc.verification_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {(doc.ai_confidence_score * 100).toFixed(1)}%
                          </div>
                          {doc.fraud_indicators && doc.fraud_indicators.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {doc.fraud_indicators.length} fraud indicators
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(doc.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Document Review</DialogTitle>
                              <DialogDescription>
                                Review and verify {doc.user_name}'s {formatDocumentType(doc.document_type)}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedDocument && (
                              <div className="space-y-6">
                                {/* Document Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">User Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Name:</strong> {selectedDocument.user_name}</div>
                                      <div><strong>Email:</strong> {selectedDocument.user_email}</div>
                                      <div><strong>Role:</strong> {selectedDocument.user_role.replace('_', ' ')}</div>
                                      <div><strong>Verification Level:</strong> {selectedDocument.verification_level}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Document Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Type:</strong> {formatDocumentType(selectedDocument.document_type)}</div>
                                      <div><strong>Number:</strong> {selectedDocument.document_number || 'Not provided'}</div>
                                      <div><strong>AI Confidence:</strong> {(selectedDocument.ai_confidence_score * 100).toFixed(1)}%</div>
                                      <div><strong>Submitted:</strong> {formatDate(selectedDocument.created_at)}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Extracted Data */}
                                {selectedDocument.extracted_data && Object.keys(selectedDocument.extracted_data).length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">AI Extracted Data</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        {Object.entries(selectedDocument.extracted_data as Record<string, any>).map(([key, value]) => (
                                          value && (
                                            <div key={key}>
                                              <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value as string}
                                            </div>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Fraud Indicators */}
                                {selectedDocument.fraud_indicators && selectedDocument.fraud_indicators.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2 text-red-600">Fraud Indicators</h4>
                                    <div className="bg-red-50 p-3 rounded-lg">
                                      <ul className="list-disc list-inside text-sm text-red-800">
                                        {selectedDocument.fraud_indicators.map((indicator, index) => (
                                          <li key={index}>{indicator.replace(/_/g, ' ')}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {/* Document Image/PDF */}
                                <div>
                                  <h4 className="font-medium mb-2">Document Preview</h4>
                                  <div className="border rounded-lg p-4 bg-gray-50">
                                    <p className="text-sm text-muted-foreground">
                                      Document URL: {selectedDocument.document_url}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      In production, this would show the actual document image/PDF
                                    </p>
                                  </div>
                                </div>

                                {/* Action Notes */}
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="actionNotes">Review Notes (Optional)</Label>
                                    <Textarea
                                      id="actionNotes"
                                      value={actionNotes}
                                      onChange={(e) => setActionNotes(e.target.value)}
                                      placeholder="Add any notes about this verification..."
                                      rows={3}
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="rejectionReason">Rejection Reason (Required for rejection)</Label>
                                    <Textarea
                                      id="rejectionReason"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Explain why this document is being rejected..."
                                      rows={3}
                                    />
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button
                                    onClick={() => handleDocumentAction('approve')}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleDocumentAction('reject')}
                                    disabled={isProcessing}
                                    variant="destructive"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => handleDocumentAction('request_resubmission')}
                                    disabled={isProcessing}
                                    variant="outline"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Request Resubmission
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}