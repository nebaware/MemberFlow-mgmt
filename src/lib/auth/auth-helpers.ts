import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';

export interface AuthUser {
  id: string;
  role: string;
  email: string;
  licenseVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

/**
 * Get authenticated user from request (Server-side)
 */
export async function getAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      role: session.user.role?.toLowerCase() || 'farmer',
      email: session.user.email || 'unknown@example.com',
      licenseVerified: (session.user as any).licenseVerified,
      verificationStatus: (session.user as any).verificationStatus,
    };
  } catch (err) {
    console.error('Auth error:', err);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, roles: string | string[]): boolean {
  if (!user) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user can edit a product
 */
export function canEditProduct(user: AuthUser | null, productSellerId: string | number): boolean {
  if (!user) return false;
  // Admin can edit any product
  if (user.role === 'admin') return true;
  // Seller can only edit their own products
  return user.id === productSellerId.toString();
}

/**
 * Calculate platform commission
 * Platform takes a percentage of each sale
 */
export function calculateCommission(amount: number, rate: number = 0.05): {
  platformFee: number;
  sellerAmount: number;
} {
  const platformFee = amount * rate; // 5% default commission
  const sellerAmount = amount - platformFee;

  return {
    platformFee: parseFloat(platformFee.toFixed(2)),
    sellerAmount: parseFloat(sellerAmount.toFixed(2)),
  };
}

/**
 * Get commission rate based on product category or seller tier
 */
export function getCommissionRate(category?: string, sellerTier?: string): number {
  // Premium sellers get lower commission
  if (sellerTier === 'premium') return 0.03; // 3%

  // Different rates for different categories
  switch (category) {
    case 'Agricultural Technologies':
      return 0.07; // 7% for equipment
    case 'Coffee':
      return 0.04; // 4% for coffee (high value)
    default:
      return 0.05; // 5% standard
  }
}

/**
 * Check if user's license is verified
 */
export function isLicenseVerified(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.licenseVerified === true;
}

/**
 * Check if user can perform action that requires license verification
 */
export function canPerformLicensedAction(user: AuthUser | null): boolean {
  if (!user) return false;
  // Admin can always perform actions
  if (user.role === 'admin') return true;
  // Other users need verified license
  return user.licenseVerified === true;
}

/**
 * Check if user can list products/services
 */
export function canListProducts(user: AuthUser | null): boolean {
  if (!user) return false;
  // Admin can always list
  if (user.role === 'admin') return true;
  // Farmers, tool sellers, and storage providers need verified license to list
  const rolesRequiringVerification = ['farmer', 'tool_seller', 'storage_provider'];
  if (rolesRequiringVerification.includes(user.role)) {
    return user.licenseVerified === true;
  }
  return false;
}

/**
 * Check if user can accept/provide services
 */
export function canProvideServices(user: AuthUser | null): boolean {
  if (!user) return false;
  // Admin can always provide services
  if (user.role === 'admin') return true;
  // Transporters, educators, storage providers need verified license
  const rolesRequiringVerification = ['transporter', 'educator', 'storage_provider'];
  if (rolesRequiringVerification.includes(user.role)) {
    return user.licenseVerified === true;
  }
  return false;
}

/**
 * Get user's access restrictions based on license status
 */
export function getUserRestrictions(user: AuthUser | null): {
  canLogin: boolean;
  canListProducts: boolean;
  canProvideServices: boolean;
  canPlaceOrders: boolean;
  canViewMarketplace: boolean;
  message?: string;
} {
  if (!user) {
    return {
      canLogin: false,
      canListProducts: false,
      canProvideServices: false,
      canPlaceOrders: false,
      canViewMarketplace: false,
      message: 'Not authenticated',
    };
  }

  // Admin has full access
  if (user.role === 'admin') {
    return {
      canLogin: true,
      canListProducts: true,
      canProvideServices: true,
      canPlaceOrders: true,
      canViewMarketplace: true,
    };
  }

  // Buyers can login and place orders without license verification
  if (user.role === 'buyer') {
    return {
      canLogin: true,
      canListProducts: false,
      canProvideServices: false,
      canPlaceOrders: true,
      canViewMarketplace: true,
    };
  }

  // Other roles can login but need license verification for certain actions
  const isVerified = user.licenseVerified === true;

  return {
    canLogin: true,
    canListProducts: isVerified,
    canProvideServices: isVerified,
    canPlaceOrders: true,
    canViewMarketplace: true,
    message: isVerified ? undefined : 'License verification pending. Some features are restricted.',
  };
}
