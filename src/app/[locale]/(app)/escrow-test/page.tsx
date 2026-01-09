'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  transporterId?: string;
  amount: number;
  status: string;
  orderId: string;
  createdAt: string;
  autoReleaseDate?: string;
}

interface EscrowStats {
  totalHeld: number;
  totalReleased: number;
  totalDisputed: number;
  activeEscrows: number;
}

export default function EscrowTestPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [stats, setStats] = useState<EscrowStats | null>(null);

  // Form states
  const [holdForm, setHoldForm] = useState({
    buyerId: '1',
    sellerId: '2',
    transporterId: '3',
    amount: '1000',
    orderId: `ORD-${Date.now()}`,
    autoReleaseDays: '7',
  });

  const [confirmForm, setConfirmForm] = useState({
    escrowId: '',
    confirmedBy: '1',
  });

  const [disputeForm, setDisputeForm] = useState({
    transactionId: '',
    raisedBy: '1',
    reason: '',
  });

  useEffect(() => {
    loadEscrows();
    loadStats();
  }, []);

  const loadEscrows = () => {
    const stored = localStorage.getItem('escrow_transactions');
    if (stored) {
      setEscrows(JSON.parse(stored));
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/escrow/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleHoldEscrow = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/escrow/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: holdForm.buyerId,
          sellerId: holdForm.sellerId,
          transporterId: holdForm.transporterId || undefined,
          amount: parseFloat(holdForm.amount),
          orderId: holdForm.orderId,
          autoReleaseDays: parseInt(holdForm.autoReleaseDays),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`✅ Escrow held successfully! ID: ${data.escrow.id}`, 'success');
        loadEscrows();
        loadStats();
        // Generate new order ID for next test
        setHoldForm({ ...holdForm, orderId: `ORD-${Date.now()}` });
      } else {
        showMessage(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/escrow/confirm-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: confirmForm.escrowId,
          confirmedBy: confirmForm.confirmedBy,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('✅ Delivery confirmed! Escrow will be released.', 'success');
        loadEscrows();
        loadStats();
      } else {
        showMessage(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/escrow/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: disputeForm.transactionId,
          raisedBy: disputeForm.raisedBy,
          reason: disputeForm.reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage(`✅ Dispute raised! ID: ${data.dispute.id}`, 'success');
        loadEscrows();
      } else {
        showMessage(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Error: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      held: { variant: 'default', icon: Clock, color: 'text-yellow-600' },
      released: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      disputed: { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
      refunded: { variant: 'secondary', icon: RefreshCw, color: 'text-blue-600' },
    };

    const config = variants[status] || variants.held;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Escrow Payment System Test
          </h1>
          <p className="text-muted-foreground mt-1">
            Test automated escrow agent and payment protection
          </p>
        </div>
        <Button onClick={() => { loadEscrows(); loadStats(); }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {message && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Active Escrows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEscrows}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Released
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReleased}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Disputed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDisputed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Total Held
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHeld}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="hold" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hold">Hold Escrow</TabsTrigger>
          <TabsTrigger value="confirm">Confirm Delivery</TabsTrigger>
          <TabsTrigger value="dispute">Raise Dispute</TabsTrigger>
        </TabsList>

        <TabsContent value="hold">
          <Card>
            <CardHeader>
              <CardTitle>Hold Payment in Escrow</CardTitle>
              <CardDescription>
                Create a new escrow transaction with automated release conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyerId">Buyer ID</Label>
                  <Input
                    id="buyerId"
                    value={holdForm.buyerId}
                    onChange={(e) => setHoldForm({ ...holdForm, buyerId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellerId">Seller ID</Label>
                  <Input
                    id="sellerId"
                    value={holdForm.sellerId}
                    onChange={(e) => setHoldForm({ ...holdForm, sellerId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transporterId">Transporter ID (Optional)</Label>
                  <Input
                    id="transporterId"
                    value={holdForm.transporterId}
                    onChange={(e) => setHoldForm({ ...holdForm, transporterId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ETB)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={holdForm.amount}
                    onChange={(e) => setHoldForm({ ...holdForm, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={holdForm.orderId}
                    onChange={(e) => setHoldForm({ ...holdForm, orderId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoReleaseDays">Auto-Release Days</Label>
                  <Input
                    id="autoReleaseDays"
                    type="number"
                    value={holdForm.autoReleaseDays}
                    onChange={(e) => setHoldForm({ ...holdForm, autoReleaseDays: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleHoldEscrow} disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Hold in Escrow'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirm">
          <Card>
            <CardHeader>
              <CardTitle>Confirm Delivery</CardTitle>
              <CardDescription>
                Confirm delivery to trigger escrow release
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="escrowId">Escrow ID</Label>
                <Input
                  id="escrowId"
                  placeholder="ESC-..."
                  value={confirmForm.escrowId}
                  onChange={(e) => setConfirmForm({ ...confirmForm, escrowId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmedBy">Confirmed By (User ID)</Label>
                <Input
                  id="confirmedBy"
                  value={confirmForm.confirmedBy}
                  onChange={(e) => setConfirmForm({ ...confirmForm, confirmedBy: e.target.value })}
                />
              </div>
              <Button onClick={handleConfirmDelivery} disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Confirm Delivery'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispute">
          <Card>
            <CardHeader>
              <CardTitle>Raise Dispute</CardTitle>
              <CardDescription>
                Report an issue with an escrow transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Escrow Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="ESC-..."
                  value={disputeForm.transactionId}
                  onChange={(e) => setDisputeForm({ ...disputeForm, transactionId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="raisedBy">Raised By (User ID)</Label>
                <Input
                  id="raisedBy"
                  value={disputeForm.raisedBy}
                  onChange={(e) => setDisputeForm({ ...disputeForm, raisedBy: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Describe the issue..."
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                />
              </div>
              <Button onClick={handleRaiseDispute} disabled={loading} className="w-full" variant="destructive">
                {loading ? 'Processing...' : 'Raise Dispute'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Escrow Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Escrow Transactions</CardTitle>
          <CardDescription>All escrow transactions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {escrows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No escrow transactions yet. Create one above to test!
            </p>
          ) : (
            <div className="space-y-3">
              {escrows.map((escrow) => (
                <div
                  key={escrow.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm">{escrow.id}</div>
                    {getStatusBadge(escrow.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-semibold">{escrow.amount} ETB</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Buyer:</span>
                      <span className="ml-2">{escrow.buyerId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Seller:</span>
                      <span className="ml-2">{escrow.sellerId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Order:</span>
                      <span className="ml-2">{escrow.orderId}</span>
                    </div>
                  </div>
                  {escrow.autoReleaseDate && (
                    <div className="text-xs text-muted-foreground">
                      Auto-release: {new Date(escrow.autoReleaseDate).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
