"use client";

import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Dispute {
    id: number;
    order_id: number;
    raiser_name: string;
    raiser_email: string;
    reason: string;
    description: string;
    status: 'Open' | 'Resolved' | 'Rejected';
    resolution_notes: string;
    created_at: string;
    order_amount: number;
}

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [resolutionStatus, setResolutionStatus] = useState<'Resolved' | 'Rejected'>('Resolved');
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const res = await fetch('/api/disputes');
            if (!res.ok) throw new Error('Failed to fetch disputes');
            const data = await res.json();
            setDisputes(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load disputes',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedDispute) return;
        setIsResolving(true);

        try {
            const res = await fetch(`/api/disputes/${selectedDispute.id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: resolutionStatus,
                    resolutionNotes,
                }),
            });

            if (!res.ok) throw new Error('Failed to resolve dispute');

            toast({
                title: 'Dispute Updated',
                description: `Dispute marked as ${resolutionStatus}`,
            });

            setSelectedDispute(null);
            fetchDisputes();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update dispute',
                variant: 'destructive',
            });
        } finally {
            setIsResolving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Open':
                return <Badge variant="destructive">Open</Badge>;
            case 'Resolved':
                return <Badge variant="default" className="bg-green-600">Resolved</Badge>;
            case 'Rejected':
                return <Badge variant="secondary">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <PageTitle
                title="Dispute Management"
                description="Review and resolve order disputes"
            />

            <Card>
                <CardHeader>
                    <CardTitle>All Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : disputes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No disputes found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Raiser</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disputes.map((dispute) => (
                                    <TableRow key={dispute.id}>
                                        <TableCell>#{dispute.id}</TableCell>
                                        <TableCell>Order #{dispute.order_id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{dispute.raiser_name}</p>
                                                <p className="text-xs text-muted-foreground">{dispute.raiser_email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{dispute.reason}</Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                                        <TableCell>{format(new Date(dispute.created_at), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedDispute(dispute);
                                                    setResolutionStatus('Resolved');
                                                    setResolutionNotes('');
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Dispute Details #{selectedDispute?.id}</DialogTitle>
                        <DialogDescription>
                            Review the dispute details and take action.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDispute && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-muted-foreground">Order Amount</p>
                                    <p>{selectedDispute.order_amount?.toFixed(2)} Birr</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Reason</p>
                                    <p>{selectedDispute.reason}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="font-semibold text-sm text-muted-foreground">Description</p>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    {selectedDispute.description}
                                </div>
                            </div>

                            {selectedDispute.status === 'Open' ? (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <p className="font-semibold">Resolution Action</p>
                                        <Select
                                            value={resolutionStatus}
                                            onValueChange={(v: any) => setResolutionStatus(v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Resolved">Resolve (Refund/Compensate)</SelectItem>
                                                <SelectItem value="Rejected">Reject (No Action)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="font-semibold">Resolution Notes</p>
                                        <Textarea
                                            placeholder="Explain the resolution..."
                                            value={resolutionNotes}
                                            onChange={(e) => setResolutionNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 pt-4 border-t">
                                    <p className="font-semibold text-sm text-muted-foreground">Resolution</p>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
                                        <p className="font-medium mb-1">Status: {selectedDispute.status}</p>
                                        <p>{selectedDispute.resolution_notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                            Close
                        </Button>
                        {selectedDispute?.status === 'Open' && (
                            <Button onClick={handleResolve} disabled={isResolving || !resolutionNotes}>
                                {isResolving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Submit Resolution'
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
