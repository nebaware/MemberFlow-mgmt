"use client";

import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, ArrowUpRight, ArrowDownRight, Shield, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Transaction {
  id: number;
  user_id: number;
  order_id: number | null;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

export default function TransactionsPage() {
  const t = useTranslations();
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // In a real app, get userId from auth context
      const userId = 1;
      const response = await fetch(`/api/payments?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Completed': 'default',
      'InEscrow': 'secondary',
      'Pending': 'outline',
      'Failed': 'destructive',
      'Cancelled': 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EscrowHold':
      case 'EscrowRelease':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'Payment':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'Earning':
      case 'Refund':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateTotals = () => {
    if (!transactions) return { total: 0, escrow: 0, completed: 0 };

    return transactions.reduce((acc, tx) => {
      const amount = parseFloat(tx.amount as any) || 0;
      if (tx.status === 'Completed') {
        acc.completed += amount;
      }
      if (tx.status === 'InEscrow') {
        acc.escrow += amount;
      }
      acc.total += amount;
      return acc;
    }, { total: 0, escrow: 0, completed: 0 });
  };

  const totals = calculateTotals();

  return (
    <>
      <PageTitle
        title={t('trans.title')}
        description={t('trans.description')}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.total.toFixed(2)} Birr</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totals.escrow.toFixed(2)} Birr</div>
            <p className="text-xs text-muted-foreground">Held securely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totals.completed.toFixed(2)} Birr</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of all your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="font-medium">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{tx.description}</TableCell>
                    <TableCell className="font-semibold">{(parseFloat(tx.amount as any) || 0).toFixed(2)} Birr</TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Your payment history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
