"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'buyer' | 'transporter' | 'educator' | 'tool_seller' | 'storage_provider' | 'admin';
  phone?: string;
  location?: string;
  profileImage?: string;
  walletBalance: number;
  escrowBalance: number;
  bio?: string;
  specialization?: string;
  roleRequestStatus?: 'pending' | 'approved' | 'rejected';
  requestedRole?: string;
  verified: boolean;
  rejectionReason?: string;
  verification_level?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  unreadNotifications: number;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  hasRole: (roles: string | string[]) => boolean;
  isAdmin: () => boolean;
  canEditProduct: (productSellerId: string | number) => boolean;
  canDeleteProduct: (productSellerId: string | number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session, status } = useSession();

  // Fetch unread notifications count
  const refreshNotifications = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
      if (res.ok) {
        const data = await res.json();
        setUnreadNotifications(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Sync with NextAuth session
  useEffect(() => {
    const syncUser = async () => {
      if (status === 'loading') return;

      if (session?.user) {
        try {
          // Fetch full user details
          // We can use the ID from the session to fetch the full profile
          const res = await fetch(`/api/users/${session.user.id}`);
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Fallback to session data if API fails
            setUser({
              ...session.user,
              role: session.user.role as any,
              walletBalance: 0,
              escrowBalance: 0,
              verified: false,
            } as User);
          }
        } catch (err) {
          console.error('Failed to fetch user details:', err);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    syncUser();
  }, [session, status]);

  // Poll for notifications every 30 seconds
  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Permission helpers
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const userRole = user.role.toLowerCase();
    return roleArray.some(r => r.toLowerCase() === userRole);
  };

  const isAdmin = (): boolean => {
    return user?.role?.toLowerCase() === 'admin';
  };

  const canEditProduct = (productSellerId: string | number): boolean => {
    if (!user) return false;
    // Admin can edit any product
    if (user.role?.toLowerCase() === 'admin') return true;
    // Seller can only edit their own products
    return user.id === productSellerId.toString();
  };

  const canDeleteProduct = (productSellerId: string | number): boolean => {
    if (!user) return false;
    // Admin can delete any product
    if (user.role?.toLowerCase() === 'admin') return true;
    // Seller can only delete their own products
    return user.id === productSellerId.toString();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        unreadNotifications,
        refreshNotifications,
        isLoading,
        hasRole,
        isAdmin,
        canEditProduct,
        canDeleteProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
