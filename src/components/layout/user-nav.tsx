
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, LayoutDashboard, Bell, Wallet, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';

export function UserNav() {
  const { user, setUser, unreadNotifications } = useApp();
  const router = useRouter();
  const t = useTranslations('user_nav');
  const tCommon = useTranslations('common');

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('azmera_demo_user');
    await signOut({ callbackUrl: '/login' });
  };

  // If no user, show login button
  if (!user) {
    return (
      <Button variant="default" size="sm" asChild>
        <Link href="/login">{t('login')}</Link>
      </Button>
    );
  }

  // Safely get initials
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const getRoleBadge = () => {
    const roleColors: Record<string, string> = {
      farmer: 'bg-green-600',
      buyer: 'bg-blue-600',
      transporter: 'bg-purple-600',
      educator: 'bg-orange-600',
      tool_seller: 'bg-cyan-600',
      storage_provider: 'bg-indigo-600',
      admin: 'bg-red-600',
    };
    return roleColors[user?.role || ''] || 'bg-gray-600';
  };

  const getRoleLabel = () => {
    if (!user?.role) return t('role_user');
    // Try to translate role if possible, or fallback to uppercase
    // Assuming roles might be translated elsewhere or we just uppercase them for now
    return user.role.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative" asChild>
        <Link href="/notifications">
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                <Badge className={`${getRoleBadge()} text-xs`}>
                  {getRoleLabel()}
                </Badge>
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {user.location && (
                <p className="text-xs text-muted-foreground">📍 {user.location}</p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Wallet Info */}
          <div className="px-2 py-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                {t('wallet')}
              </span>
              <span className="font-semibold text-green-600">
                {Number(user.walletBalance || 0).toFixed(2)} {tCommon('birr')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {t('escrow')}
              </span>
              <span className="font-semibold text-yellow-600">
                {Number(user.escrowBalance || 0).toFixed(2)} {tCommon('birr')}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>{t('dashboard')}</span>
              </Link>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/en/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>{t('admin')}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>{t('profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/earnings">
                <Wallet className="mr-2 h-4 w-4" />
                <span>{t('earnings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                <span>{t('notifications')}</span>
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {unreadNotifications}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
