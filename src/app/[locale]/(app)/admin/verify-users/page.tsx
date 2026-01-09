"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ShieldCheck,
  UserCheck,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  location: string;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  licenseVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export default function AdminVerifyUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin.verify_users');
  const tCommon = useTranslations('common');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'admin' && session?.user?.role !== 'ADMIN') {
      // Redirect non-admins
      if (status === 'authenticated') {
        router.push('/dashboard');
      }
    } else {
      fetchUsers();
    }
  }, [status, session, router, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/verify-license?status=${filter}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        toast({
          title: tCommon('error'),
          description: data.error || tCommon('error'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: tCommon('error'),
        description: tCommon('error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch('/api/admin/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status,
          notes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: status === 'approved' ? t('success_approve') : t('success_reject'),
          description: t('success_desc', { status: status === 'approved' ? 'verified' : 'rejected' }),
          action: <CheckCircle className="text-green-500" />,
        });

        // Remove user from list or update status
        setUsers(users.filter(u => u.id !== userId));
        setSelectedUser(null);
        setRejectionReason('');
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error: any) {
      toast({
        title: t('error_title'),
        description: error.message || tCommon('error'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || (loading && users.length === 0)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={filter === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('pending')}
            className="gap-2"
          >
            <AlertCircle className="h-4 w-4" /> {t('pending')}
          </Button>
          <Button
            variant={filter === 'verified' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('verified')}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" /> {t('verified')}
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('rejected')}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" /> {t('rejected')}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('search_placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredUsers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <UserCheck className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-medium">{t('no_users')}</h3>
              <p>{t('no_users_desc')}</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <Badge variant={
                      user.role === 'farmer' ? 'default' :
                        user.role === 'transporter' ? 'secondary' :
                          'outline'
                    } className="capitalize">
                      {user.role.replace('_', ' ')}
                    </Badge>
                    <Badge variant={
                      user.verificationStatus === 'verified' ? 'default' :
                        user.verificationStatus === 'rejected' ? 'destructive' :
                          'outline'
                    } className={
                      user.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''
                    }>
                      {user.verificationStatus}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Phone:</div>
                    <div className="font-medium">{user.phone || 'N/A'}</div>

                    <div className="text-muted-foreground">Location:</div>
                    <div className="font-medium">{user.location || 'N/A'}</div>

                    <div className="text-muted-foreground">{t('license')}:</div>
                    <div className="font-medium truncate" title={user.licenseNumber || ''}>
                      {user.licenseNumber || t('not_provided')}
                    </div>

                    <div className="text-muted-foreground">{t('registered')}:</div>
                    <div className="font-medium">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-4 flex gap-2 justify-end border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                        <FileText className="h-4 w-4 mr-2" /> {t('details')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{t('verify_dialog_title')}</DialogTitle>
                        <DialogDescription>
                          {t('verify_dialog_desc', { name: user.name, role: user.role })}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">{t('license_info')}</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-semibold">{t('license_number')}:</p>
                            <p className="text-lg font-mono">{user.licenseNumber || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Add more details here as needed */}

                        {filter === 'pending' && (
                          <div className="pt-4 flex flex-col gap-3">
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleVerify(user.id, 'approved')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? t('processing') : t('approve')}
                            </Button>

                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">{t('or_reject')}</span>
                              </div>
                            </div>

                            <Textarea
                              placeholder={t('rejection_reason')}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="min-h-[80px]"
                            />

                            <Button
                              variant="destructive"
                              className="w-full"
                              onClick={() => handleVerify(user.id, 'rejected', rejectionReason)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? t('processing') : t('reject')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
