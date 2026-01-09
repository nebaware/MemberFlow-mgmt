"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Dispute {
    id: string;
    orderId: string;
    raisedBy: string;
    reason: string;
    status: string;
    createdAt: Date;
    order: {
        orderNumber: string;
        totalAmount: number;
        buyer: { id: string; name: string; email: string };
        seller: { id: string; name: string; email: string };
        items: Array<{ product: { title: string }; quantity: number }>;
    };
}

export function DisputesTable() {
    const router = useRouter();
    const { toast } = useToast();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [showResolveDialog, setShowResolveDialog] = useState(false);
    const [resolveAction, setResolveAction] = useState<'release' | 'refund' | 'partial'>('release');
    const [resolution, setResolution] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const res = await fetch('/api/admin/disputes');
            if (res.ok) {
                const data = await res.json();
                setDisputes(data.disputes);
            }
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
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
        if (!selectedDispute || !resolution.trim()) {
            toast({
                title: 'Error',
                description: 'Please provide a resolution description',
                variant: 'destructive',
            });
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: resolveAction, resolution }),
            });

            if (!res.ok) throw new Error('Failed to resolve dispute');

            toast({
                title: 'Dispute Resolved',
                description: `Dispute has been resolved with action: ${resolveAction}`,
            });

            setShowResolveDialog(false);
            setSelectedDispute(null);
            setResolution('');
            fetchDisputes();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to resolve dispute',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const openResolveDialog = (dispute: Dispute) => {
        setSelectedDispute(dispute);
        setShowResolveDialog(true);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                Pending Disputes
                            </CardTitle>
                            <CardDescription>Review and resolve order disputes</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchDisputes}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {disputes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No pending disputes</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Parties</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {disputes.map((dispute) => (
                                        <TableRow key={dispute.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold">#{dispute.order.orderNumber}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {dispute.order.items.length} item(s)
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <div>
                                                        <span className="font-semibold">Buyer:</span> {dispute.order.buyer.name}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">Seller:</span> {dispute.order.seller.name}
                                                    </div>
                                                    <div>
                                                        <Badge variant="outline" className="text-xs">
                                                            Raised by: {dispute.raisedBy === dispute.order.buyer.id ? 'Buyer' : 'Seller'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm max-w-xs line-clamp-2">{dispute.reason}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-semibold">{dispute.order.totalAmount.toFixed(2)} Birr</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{format(new Date(dispute.createdAt), 'PP')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(dispute.createdAt), 'p')}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openResolveDialog(dispute)}
                                                >
                                                    Resolve
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resolve Dialog */}
            <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Resolve Dispute</DialogTitle>
                        <DialogDescription>
                            Order #{selectedDispute?.order.orderNumber} - {selectedDispute?.order.totalAmount.toFixed(2)} Birr
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDispute && (
                        <div className="space-y-4">
                            {/* Dispute Details */}
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                <div>
                                    <p className="text-sm font-semibold">Dispute Reason:</p>
                                    <p className="text-sm text-muted-foreground">{selectedDispute.reason}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold">Buyer:</p>
                                        <p>{selectedDispute.order.buyer.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedDispute.order.buyer.email}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Seller:</p>
                                        <p>{selectedDispute.order.seller.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedDispute.order.seller.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Resolution Action */}
                            <div>
                                <Label>Resolution Action</Label>
                                <RadioGroup value={resolveAction} onValueChange={(value: any) => setResolveAction(value)}>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <RadioGroupItem value="release" id="release" />
                                        <Label htmlFor="release" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="font-semibold">Release to Seller</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Release funds from escrow to the seller
                                                    </p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <RadioGroupItem value="refund" id="refund" />
                                        <Label htmlFor="refund" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-600" />
                                                <div>
                                                    <p className="font-semibold">Refund to Buyer</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Refund the full amount to the buyer
                                                    </p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                                        <RadioGroupItem value="partial" id="partial" />
                                        <Label htmlFor="partial" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                <div>
                                                    <p className="font-semibold">Partial Resolution</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Custom resolution (requires manual processing)
                                                    </p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Resolution Notes */}
                            <div>
                                <Label htmlFor="resolution">Resolution Notes</Label>
                                <Textarea
                                    id="resolution"
                                    placeholder="Explain the resolution decision..."
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleResolve} disabled={isProcessing}>
                            {isProcessing ? 'Resolving...' : 'Resolve Dispute'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
