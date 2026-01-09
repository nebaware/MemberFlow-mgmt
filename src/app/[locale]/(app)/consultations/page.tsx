
"use client";

import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageSquare, Check, X, CalendarDays, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

// Mock data type for consultation requests
interface ConsultationRequest {
  id: string;
  userName: string;
  userContact?: string; // Optional email/phone
  requestTopic: string;
  details: string;
  requestedDate: Date;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
}

export default function ConsultationRequestsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const { toast } = useToast();
  const t = useTranslations();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const response = await fetch('/api/consultations');
        if (response.ok) {
          const data = await response.json();
          setRequests(data.consultations || []);
        }
      } catch (error) {
        console.error('Failed to fetch consultations:', error);
      }
    };
    
    fetchConsultations();
  }, []);

  const handleAction = async (requestId: string, action: 'Accepted' | 'Declined' | 'Completed') => {
    try {
      const response = await fetch(`/api/consultations/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        setRequests(prevRequests =>
          prevRequests.map(req => req.id === requestId ? { ...req, status: action } : req)
        );
        toast({
          title: `Request ${action}`,
          description: `Consultation request has been marked as ${action.toLowerCase()}.`,
        });
      } else {
        throw new Error('Failed to update consultation');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update consultation status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <PageTitle
        title="Consultation Requests"
        description="Manage requests for advisory services from users."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Incoming & Ongoing Consultations
          </CardTitle>
          <CardDescription>
            Review requests and manage your consultation schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{req.userName}</p>
                          {req.userContact && <p className="text-xs text-muted-foreground">{req.userContact}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{req.requestTopic}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{req.details}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {req.requestedDate.toLocaleDateString()} {req.requestedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === 'Pending' ? 'secondary' :
                            req.status === 'Accepted' ? 'default' :
                              req.status === 'Completed' ? 'outline' :
                                'destructive'
                        }
                        className={
                          req.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-400' :
                            req.status === 'Accepted' ? 'bg-blue-500/20 text-blue-700 border-blue-400' :
                              req.status === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-400' : ''
                        }
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {req.status === 'Pending' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'Accepted')} className="text-green-600 border-green-600 hover:bg-green-50">
                            <Check className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'Declined')} className="text-red-600 border-red-600 hover:bg-red-50">
                            <X className="h-4 w-4 mr-1" /> Decline
                          </Button>
                        </>
                      )}
                      {req.status === 'Accepted' && (
                        <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'Completed')}>
                          Mark as Completed
                        </Button>
                      )}
                      {(req.status === 'Completed' || req.status === 'Declined') && (
                        <Button variant="ghost" size="sm" disabled>No Actions</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No active consultation requests.</p>
              <p className="text-sm">Users can request consultations based on your profile and expertise.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
