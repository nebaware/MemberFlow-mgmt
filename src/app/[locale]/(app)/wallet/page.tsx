"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign, ArrowDownToLine } from 'lucide-react';
import { format } from 'date-fns';
import { PageTitle } from '@/components/shared/page-title';

interface WalletData {
    id: string;
    balance: number;
    pendingBalance: number;
    totalEarnings: number;
    dailyWithdrawalLimit: number;
    monthlyWithdrawalLimit: number;
    dailyWithdrawn: number;
    monthlyWithdrawn: number;
    twoFactorEnabled?: boolean;
    transactions: Array<{
        id: string;
        type: string;
        amount: number;
        description: string;
        createdAt: Date;
    }>;
}

export default function WalletPage() {
    const { toast } = useToast();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [withdrawalToken, setWithdrawalToken] = useState('');
    const [require2FA, setRequire2FA] = useState(false);

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/wallet');
            if (res.ok) {
                const data = await res.json();
                setWallet(data.wallet);
            }
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setup2FA = async () => {
        try {
            const res = await fetch('/api/auth/2fa/setup', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setShow2FASetup(true);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to start 2FA setup',
                variant: 'destructive',
            });
        }
    };

    const verify2FA = async () => {
        try {
            const res = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (res.ok) {
                toast({
                    title: 'Success',
                    description: 'Two-factor authentication enabled',
                });
                setShow2FASetup(false);
                fetchWallet();
            } else {
                throw new Error('Invalid token');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Invalid verification code',
                variant: 'destructive',
            });
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid amount',
                variant: 'destructive',
            });
            return;
        }

        if (wallet && amount > wallet.balance) {
            toast({
                title: 'Insufficient Balance',
                description: 'You do not have enough balance for this withdrawal',
                variant: 'destructive',
            });
            return;
        }

        if (require2FA && !withdrawalToken) {
            toast({
                title: '2FA Required',
                description: 'Please enter your 2FA code',
                variant: 'destructive',
            });
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    token: withdrawalToken
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.require2FA) {
                    setRequire2FA(true);
                    toast({
                        title: 'Authentication Required',
                        description: 'Please enter your 2FA code to confirm withdrawal',
                    });
                    setIsProcessing(false);
                    return;
                }

                if (data.error?.includes('limit exceeded')) {
                    toast({
                        title: data.error,
                        description: `Remaining: ${data.remaining?.toFixed(2)} Birr`,
                        variant: 'destructive',
                    });
                } else {
                    throw new Error(data.error || 'Withdrawal failed');
                }
                return;
            }

            toast({
                title: 'Withdrawal Requested',
                description: `Your withdrawal of ${amount} Birr has been processed.`,
            });

            setWithdrawAmount('');
            setWithdrawalToken('');
            setRequire2FA(false);
            fetchWallet();
        } catch (error: any) {
            toast({
                title: 'Withdrawal Failed',
                description: error.message || 'Failed to process withdrawal. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container max-w-4xl py-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-muted rounded-lg" />
                    <div className="h-64 bg-muted rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <PageTitle
                title="My Wallet"
                description="Manage your earnings and withdrawals"
            />

            {/* Balance Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Available Balance</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {wallet?.balance.toFixed(2)} Birr
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending Balance</CardDescription>
                        <CardTitle className="text-3xl text-yellow-600">
                            {wallet?.pendingBalance.toFixed(2)} Birr
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Earnings</CardDescription>
                        <CardTitle className="text-3xl text-blue-600">
                            {wallet?.totalEarnings.toFixed(2)} Birr
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Withdrawal Limits Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Withdrawal Limits</CardTitle>
                    <CardDescription>Your daily and monthly withdrawal limits</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Daily Limit</span>
                                <span className="font-semibold">{wallet?.dailyWithdrawalLimit.toFixed(2)} Birr</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Withdrawn Today</span>
                                <span className="font-semibold">{wallet?.dailyWithdrawn.toFixed(2)} Birr</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Remaining Today</span>
                                <span className="font-semibold text-green-600">
                                    {((wallet?.dailyWithdrawalLimit || 0) - (wallet?.dailyWithdrawn || 0)).toFixed(2)} Birr
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Monthly Limit</span>
                                <span className="font-semibold">{wallet?.monthlyWithdrawalLimit.toFixed(2)} Birr</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Withdrawn This Month</span>
                                <span className="font-semibold">{wallet?.monthlyWithdrawn.toFixed(2)} Birr</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Remaining This Month</span>
                                <span className="font-semibold text-green-600">
                                    {((wallet?.monthlyWithdrawalLimit || 0) - (wallet?.monthlyWithdrawn || 0)).toFixed(2)} Birr
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2FA Setup */}
            {!wallet?.twoFactorEnabled && (
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Enable Two-Factor Authentication for secure withdrawals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!show2FASetup ? (
                            <Button onClick={setup2FA}>Enable 2FA</Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto">
                                    <img src={qrCode} alt="2FA QR Code" width={200} height={200} />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app</p>
                                    <p className="text-xs font-mono bg-muted p-2 rounded">{secret}</p>
                                </div>
                                <div className="flex gap-2 max-w-xs mx-auto">
                                    <Input
                                        placeholder="Enter 6-digit code"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        maxLength={6}
                                    />
                                    <Button onClick={verify2FA}>Verify</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Withdrawal */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowDownToLine className="h-5 w-5" />
                        Withdraw Funds
                    </CardTitle>
                    <CardDescription>
                        Request a withdrawal from your available balance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-4">
                            <div>
                                <Label htmlFor="amount">Amount (Birr)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            {require2FA && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="token">2FA Code</Label>
                                    <Input
                                        id="token"
                                        placeholder="Enter 6-digit code from authenticator"
                                        value={withdrawalToken}
                                        onChange={(e) => setWithdrawalToken(e.target.value)}
                                        maxLength={6}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Security check required for this withdrawal
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-end h-full pt-8">
                            <Button onClick={handleWithdraw} disabled={isProcessing}>
                                {require2FA ? 'Confirm Withdrawal' : 'Withdraw'}
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Withdrawals are typically processed within 1-3 business days.
                    </p>
                </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <WalletIcon className="h-5 w-5" />
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {wallet?.transactions && wallet.transactions.length > 0 ? (
                        <div className="space-y-3">
                            {wallet.transactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {transaction.type === 'credit' ? (
                                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                                                <TrendingDown className="h-4 w-4 text-red-600" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm">{transaction.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(transaction.createdAt), 'PPp')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} Birr
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                            {transaction.type}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No transactions yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
