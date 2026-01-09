
"use client";

import React, { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ShieldCheck, CheckCircle, Banknote, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

// Mock data - in a real app, this would come from a backend
interface Transaction {
  id: string;
  type: 'Earning' | 'Withdrawal' | 'EscrowRelease';
  amount: number;
  date: Date;
  description: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'InEscrow';
}

export default function EarningsPage() {
  const { toast } = useToast();
  const t = useTranslations();
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      // Get user ID from localStorage (in production, from auth context)
      const userStr = localStorage.getItem('azmera_user') || localStorage.getItem('azmera_demo_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || '1';

      // Fetch real transactions from PostgreSQL
      const response = await fetch(`/api/payments?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();

        // Transform API data to match Transaction interface
        const transformedTransactions: Transaction[] = data.map((tx: any) => ({
          id: tx.id.toString(),
          type: tx.type as 'Earning' | 'Withdrawal' | 'EscrowRelease',
          amount: tx.type === 'Withdrawal' ? -Math.abs(parseFloat(tx.amount) || 0) : (parseFloat(tx.amount) || 0),
          date: new Date(tx.created_at),
          description: tx.description || `${tx.type} transaction`,
          status: tx.status as 'Pending' | 'Completed' | 'Failed' | 'InEscrow',
        }));

        setTransactions(transformedTransactions);

        // Calculate balances from real data
        const currentEscrow = transformedTransactions
          .filter(t => t.status === 'InEscrow')
          .reduce((sum, t) => sum + t.amount, 0);

        const currentWithdrawable = transformedTransactions
          .filter(t => (t.type === 'Earning' || t.type === 'EscrowRelease') && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0)
          + transformedTransactions
            .filter(t => t.type === 'Withdrawal' && t.status === 'Completed')
            .reduce((sum, t) => sum + t.amount, 0);

        setEscrowBalance(currentEscrow);
        setWithdrawableBalance(Math.max(0, currentWithdrawable));
      } else {
        // No transactions found
        setTransactions([]);
        setEscrowBalance(0);
        setWithdrawableBalance(0);
      }
    } catch (error) {
      console.error('Failed to fetch earnings data:', error);
      setTransactions([]);
      setEscrowBalance(0);
      setWithdrawableBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (withdrawableBalance <= 0) {
      toast({
        title: "Withdrawal Failed",
        description: "You have no funds available to withdraw.",
        variant: "destructive",
      });
      return;
    }
    // Simulate withdrawal
    const withdrawalAmount = withdrawableBalance;
    const newTransaction: Transaction = {
      id: `txn${Date.now()}`,
      type: 'Withdrawal',
      amount: -withdrawalAmount,
      date: new Date(), // This is fine as it's generated client-side on action
      description: `Withdrawal to linked account (Demo)`,
      status: 'Pending',
    };
    setTransactions(prev => [newTransaction, ...prev]);
    // setWithdrawableBalance(0); // This will be handled by the useEffect that depends on 'transactions'

    toast({
      title: "Withdrawal Initiated (Demo)",
      description: `${withdrawalAmount.toFixed(2)} Birr is being processed. It may take 2-3 business days.`,
      action: <CheckCircle className="text-green-500" />,
    });
  };

  return (
    <>
      <PageTitle
        title={t('earnings.title')}
        description={t('earnings.description')}
      />
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-yellow-500" />
              {t('payment.escrow')}
            </CardTitle>
            <CardDescription>{t('trans.in_escrow')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Number(escrowBalance).toFixed(2)} {t('common.birr')}</p>
            <p className="text-xs text-muted-foreground">{t('payment.secured_escrow')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
              {t('earnings.title')}
            </CardTitle>
            <CardDescription>{t('earnings.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{withdrawableBalance.toFixed(2)} {t('common.birr')}</p>
            <Button onClick={handleWithdraw} className="mt-2 w-full sm:w-auto" disabled={withdrawableBalance <= 0}>
              <Banknote className="mr-2 h-4 w-4" /> {t('common.save')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {t('trans.title')}
          </CardTitle>
          <CardDescription>
            {t('trans.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((txn, index) => (
                <React.Fragment key={txn.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(txn.date, 'dd MMM yyyy')} - {txn.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.amount.toFixed(2)} Birr
                      </p>
                      <Badge variant={txn.status === 'Completed' ? 'outline' : txn.status === 'InEscrow' ? 'secondary' : 'default'}
                        className={
                          txn.status === 'InEscrow' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            txn.status === 'Pending' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                              txn.status === 'Failed' ? 'bg-red-100 text-red-700 border-red-300' : ''
                        }>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                  {index < transactions.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No transactions yet.</p>
              <p className="text-sm">Your earnings and withdrawals will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
