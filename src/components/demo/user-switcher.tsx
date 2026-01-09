"use client";

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function DemoUserSwitcher() {
  const { user, setUser } = useApp();

  const demoUsers = [
    {
      id: '1',
      name: 'Abebe Kebede',
      email: 'abebe@farmer.com',
      role: 'farmer' as const,
      location: 'Addis Ababa',
      walletBalance: 5000,
      escrowBalance: 0,
      verified: true,
    },
    {
      id: '2',
      name: 'Tigist Alemu',
      email: 'tigist@buyer.com',
      role: 'buyer' as const,
      location: 'Bahir Dar',
      walletBalance: 3000,
      escrowBalance: 0,
      verified: false,
    },
    {
      id: '5',
      name: 'Yohannes Haile',
      email: 'yohannes@toolseller.com',
      role: 'tool_seller' as const,
      location: 'Dire Dawa',
      walletBalance: 4000,
      escrowBalance: 0,
      verified: true,
    },
    {
      id: '999',
      name: 'Admin User',
      email: 'admin@azmera.com',
      role: 'admin' as const,
      walletBalance: 0,
      escrowBalance: 0,
      verified: true,
    },
  ];

  const handleUserSwitch = async (demoUser: typeof demoUsers[0]) => {
    // Perform real login
    try {
      if (demoUser.id === 'logout') {
        // Handle logout
        return;
      }

      // Default password for all demo users is 'password123'
      const result = await import('next-auth/react').then(mod => mod.signIn('credentials', {
        redirect: true,
        callbackUrl: '/en/dashboard',
        email: demoUser.email,
        password: 'password123',
      }));
    } catch (e) {
      console.error("Demo login failed", e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('azmera_demo_user');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          {user ? (
            <>
              <span className="hidden sm:inline">{user.name}</span>
              <Badge variant="secondary" className="hidden md:inline">
                {user.role}
              </Badge>
            </>
          ) : (
            <span>Demo Login</span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Demo Users (Testing)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {demoUsers.map((demoUser) => (
          <DropdownMenuItem
            key={demoUser.id}
            onClick={() => handleUserSwitch(demoUser)}
            className="cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{demoUser.name}</span>
                {user?.id === demoUser.id && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {demoUser.role}
                </Badge>
                <span>{demoUser.email}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              Logout
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
