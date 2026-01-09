'use client';

import { DocumentManagement } from '@/components/admin/document-management';

export default function AdminDocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Document Verification Management</h1>
          <p className="text-muted-foreground">
            Review and verify user-submitted documents to maintain platform security and trust.
          </p>
        </div>
        
        <DocumentManagement />
      </div>
    </div>
  );
}