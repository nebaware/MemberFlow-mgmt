"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    CreditCard, Truck, CheckCircle, AlertCircle, Shield, ArrowLeft, Package, TrendingUp
} from 'lucide-react';
import { OrderTimeline } from './order-timeline';
import { DisputeModal } from './dispute-modal';
import { format } from 'date-fns';

interface OrderDetailsClientProps {
    order: any;
    currentUserId: string;
}

export function OrderDetailsClient({ order, currentUserId }: OrderDetailsClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const isBuyer = order.buyerId === currentUserId;
    const isSeller = order.sellerId === currentUserId;

    const handlePay = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/payments/chapa/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id }),
            });
            if (!res.ok) throw new Error('Payment initialization failed');
            const data = await res.json();
            window.location.href = data.checkoutUrl;
        } catch (error: any) {
            toast({ title: 'Payment Failed', description: error.message, variant: 'destructive' });
            setIsProcessing(false);
        }
    };

    const handleShip = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/orders/${order.id}/ship`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed');
            toast({ title: 'Order Shipped', description: 'The buyer has been notified.' });
            router.refresh();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update shipping status.', variant: 'destructive' });
        } finally { setIsProcessing(false); }
    };

    const handleConfirmDelivery = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/orders/${order.id}/confirm`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed');
            toast({ title: 'Delivery Confirmed', description: 'Payment released.' });
            router.refresh();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to confirm delivery.', variant: 'destructive' });
        } finally { setIsProcessing(false); }
    };

    const getStatusBadge = () => {
        const statusConfig: Record<string, { bg: string, text: string, dot: string }> = {
            pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-600' },
            confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-600' },
            shipped: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', dot: 'bg-indigo-600' },
            delivered: { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-600' },
            cancelled: { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-600' },
        };
        const config = statusConfig[order.status] || statusConfig.pending;
        return (
            <div className={`px-4 py-1.5 rounded-full ${config.bg} ${config.text} border border-current/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest`}>
                <div className={`h-2 w-2 rounded-full ${config.dot} animate-pulse`}></div>
                {order.status}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-8 md:p-12 border border-blue-500/10 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <Button variant="ghost" onClick={() => router.push('/orders')} className="rounded-full glass h-10 border-white/20 px-6 font-black uppercase tracking-widest text-[10px]">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black font-outfit tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase">
                                Order #{order.orderNumber}
                            </h1>
                            <p className="text-muted-foreground text-lg font-medium">
                                Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
                <div className="absolute -top-48 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
                                <Package className="h-7 w-7 text-blue-600" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex gap-6 p-6 bg-white/30 dark:bg-black/20 rounded-[2.5rem] border border-white/10 group transition-all hover:bg-white/50">
                                    <div className="relative w-24 h-24 flex-shrink-0 rounded-[1.5rem] overflow-hidden border border-white/20">
                                        <Image
                                            src={item.product?.imageUrl || 'https://placehold.co/100x100.png'}
                                            alt={item.product?.title || 'Product'}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="text-xl font-black font-outfit uppercase">{item.product?.title}</h4>
                                        <p className="text-sm font-bold text-muted-foreground/60 capitalize">
                                            {item.quantity} units &times; {item.price.toLocaleString()} Birr
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                        <p className="text-2xl font-black font-outfit">{(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Birr</p>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-8 pt-8 space-y-3 border-t border-white/10">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Subtotal</span>
                                    <span className="text-xl font-bold font-outfit">{order.totalAmount.toLocaleString()} Birr</span>
                                </div>
                                <div className="flex justify-between items-center p-6 bg-blue-600/5 rounded-[2rem] border border-blue-500/10">
                                    <span className="text-lg font-black uppercase tracking-widest text-blue-600">Total Amount</span>
                                    <span className="text-4xl font-black font-outfit text-blue-600">{order.totalAmount.toLocaleString()} Birr</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {order.shippingAddress && (
                        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 shadow-2xl">
                            <div className="flex items-start gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Truck className="h-7 w-7 text-indigo-600" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-indigo-600">Delivery Address</h4>
                                    <p className="text-xl font-bold leading-relaxed">{order.shippingAddress}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {order.dispute && (
                        <Card className="bg-red-500/5 border border-red-500/20 rounded-[3rem] p-8 shadow-2xl">
                            <div className="flex items-start gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <AlertCircle className="h-7 w-7 text-red-600" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-red-600">Active Dispute</h4>
                                        <Badge variant="outline" className="rounded-full border-red-500/30 text-red-600 font-black uppercase text-[10px]">{order.dispute.status}</Badge>
                                    </div>
                                    <p className="text-lg font-bold"><strong>Reason:</strong> {order.dispute.reason}</p>
                                    {order.dispute.resolution && (
                                        <p className="text-md font-medium p-4 bg-white/20 rounded-2xl border border-white/20"><strong>Resolution:</strong> {order.dispute.resolution}</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 shadow-2xl">
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40 mb-8 px-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Order History
                        </h4>
                        <OrderTimeline order={order} />
                    </Card>

                    {order.escrowTransaction && (
                        <Card className="bg-gradient-to-br from-blue-600/10 to-indigo-600/5 backdrop-blur-xl border border-blue-500/20 rounded-[3rem] p-8 shadow-2xl text-center space-y-6">
                            <div className="h-20 w-20 rounded-[2rem] bg-white/50 dark:bg-black/20 flex items-center justify-center border border-white/20 mx-auto">
                                <Shield className="h-10 w-10 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Secure Escrow Protection</h3>
                                <p className="text-4xl font-black font-outfit uppercase">{order.escrowTransaction.amount.toLocaleString()} Birr</p>
                                <div className="flex justify-center mt-2">
                                    <Badge variant="outline" className="rounded-full border-blue-500/30 text-blue-600 font-black uppercase text-[10px] px-4 py-1">Funds {order.escrowTransaction.status}</Badge>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 shadow-2xl">
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40 mb-6 px-2">Order Managed Actions</h4>
                        <div className="space-y-3">
                            {isBuyer && order.paymentStatus === 'pending' && (
                                <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px]" onClick={handlePay} disabled={isProcessing}>
                                    <CreditCard className="mr-2 h-4 w-4" /> Pay with Chapa
                                </Button>
                            )}
                            {isBuyer && order.deliveryStatus === 'shipped' && order.paymentStatus !== 'released' && (
                                <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px]" onClick={handleConfirmDelivery} disabled={isProcessing}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Confirm Delivery
                                </Button>
                            )}
                            {isBuyer && order.paymentStatus === 'paid' && !order.dispute && order.deliveryStatus !== 'delivered' && (
                                <DisputeModal
                                    orderId={order.id}
                                    trigger={
                                        <Button variant="outline" className="w-full h-14 rounded-2xl border-red-500/20 text-red-600 font-black uppercase tracking-widest text-[10px]">
                                            <AlertCircle className="mr-2 h-4 w-4" /> Raise Dispute
                                        </Button>
                                    }
                                />
                            )}
                            {isSeller && order.deliveryStatus === 'pending' && order.paymentStatus === 'paid' && (
                                <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px]" onClick={handleShip} disabled={isProcessing}>
                                    <Truck className="mr-2 h-4 w-4" /> Dispatch Order
                                </Button>
                            )}
                            {order.deliveryStatus === 'delivered' && (
                                <div className="p-6 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 text-center space-y-2">
                                    <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Transaction Complete</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-[3rem] p-8 shadow-2xl">
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40 mb-6 px-2">Counterparty Info</h4>
                        <div className="space-y-4">
                            {isBuyer ? (
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-bold text-xs uppercase">{order.seller.name[0]}</div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{order.seller.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground opacity-60">Registered Seller</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-bold text-xs uppercase">{order.buyer.name[0]}</div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{order.buyer.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground opacity-60">Verified Buyer</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
