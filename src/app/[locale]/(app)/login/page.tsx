"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { signIn } from 'next-auth/react';

interface QuickLoginUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickLoginUsers, setQuickLoginUsers] = useState<QuickLoginUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/en/dashboard';
  const { toast } = useToast();

  // Fetch real users from database for quick login
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const users = await res.json();
          // Get one user per role for quick login
          const roleUsers: QuickLoginUser[] = [];
          const roles = ['admin', 'farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider'];

          roles.forEach(role => {
            const user = users.find((u: any) => u.role === role);
            if (user) {
              roleUsers.push({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
              });
            }
          });

          setQuickLoginUsers(roleUsers);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  /* 
   * Check if user is already logged in via session
   * This handles cases where user navigates to /login manually while authenticated
   */
  useEffect(() => {
    // We can't easily check session here without useSession hook, 
    // but the middleware should handle this.
    // However, if we just logged in, we want to respect that.
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false, // We handle redirect manually
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting...',
      });

      // Force a hard navigation to ensure cookies are sent and middleware passes
      window.location.href = callbackUrl;
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.message || 'Invalid credentials',
        variant: 'destructive',
      });
      setIsLoading(false); // Only stop loading if failed, otherwise we are redirecting
    }
  };

  const quickLogin = async (email: string) => {
    setIsLoading(true);

    try {
      // Use default password 'password123' for quick login
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password: 'password123',
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting...',
      });

      // Force a hard navigation
      window.location.href = callbackUrl;
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.message || 'Quick login failed',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Login to AZMERA</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {process.env.NODE_ENV === 'development' && (
          <Card className="shadow-xl border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-yellow-800">Quick Login (Development Only)</CardTitle>
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">DEV</span>
              </div>
              <CardDescription className="text-yellow-700">
                {loadingUsers
                  ? 'Loading users from database...'
                  : quickLoginUsers.length > 0
                    ? '⚠️ For testing only - Uses default password'
                    : 'No users found. Please register first.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingUsers ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </>
              ) : quickLoginUsers.length > 0 ? (
                quickLoginUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="w-full justify-start hover:bg-yellow-100"
                    onClick={() => quickLogin(user.email)}
                    disabled={isLoading}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span className="font-semibold capitalize">{user.role.replace('_', ' ')}:</span>
                    <span className="ml-2 text-muted-foreground truncate">{user.name} ({user.email})</span>
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">No users in database yet.</p>
                  <p className="text-sm">Register a new account or insert sample data.</p>
                </div>
              )}
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                <strong>⚠️ Security Warning:</strong> This feature is disabled in production.
                Always use proper authentication with passwords.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
