/**
 * Authentication and Authorization System
 * Real-time user authentication with role-based permissions
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'farmer' 
  | 'buyer' 
  | 'transporter' 
  | 'educator' 
  | 'tool_seller' 
  | 'storage_provider' 
  | 'admin';

export type Permission =
  | 'view_dashboard'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_deliveries'
  | 'manage_storage'
  | 'manage_courses'
  | 'manage_users'
  | 'manage_payments'
  | 'view_analytics'
  | 'manage_settings';

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  farmer: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'view_analytics',
    'manage_settings',
  ],
  buyer: [
    'view_dashboard',
    'manage_orders',
    'manage_settings',
  ],
  transporter: [
    'view_dashboard',
    'manage_deliveries',
    'view_analytics',
    'manage_settings',
  ],
  educator: [
    'view_dashboard',
    'manage_courses',
    'view_analytics',
    'manage_settings',
  ],
  tool_seller: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'view_analytics',
    'manage_settings',
  ],
  storage_provider: [
    'view_dashboard',
    'manage_storage',
    'manage_orders',
    'view_analytics',
    'manage_settings',
  ],
  admin: [
    'view_dashboard',
    'manage_products',
    'manage_orders',
    'manage_deliveries',
    'manage_storage',
    'manage_courses',
    'manage_users',
    'manage_payments',
    'view_analytics',
    'manage_settings',
  ],
};

/**
 * Get user from localStorage (real-time)
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('azmera_current_user');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Set current user (real-time)
 */
export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('azmera_current_user', JSON.stringify(user));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new Event('storage'));
  } else {
    localStorage.removeItem('azmera_current_user');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: Permission): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.permissions.includes(permission);
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: UserRole[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return roles.includes(user.role);
}

/**
 * Check if user is verified
 */
export function isVerified(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.verified;
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // In production, call actual API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const user: User = {
        ...data.user,
        permissions: getUserPermissions(data.user.role),
      };
      
      setCurrentUser(user);
      
      return { success: true, user };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Login failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

/**
 * Logout user
 */
export function logout(): void {
  setCurrentUser(null);
  
  // Clear all user-related data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('azmera_demo_user');
    localStorage.removeItem('azmera_cart');
    localStorage.removeItem('azmera_favorites');
  }
}

/**
 * Register new user
 */
export async function register(userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  location?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      const user: User = {
        ...data.user,
        permissions: getUserPermissions(data.user.role),
      };
      
      setCurrentUser(user);
      
      return { success: true, user };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Registration failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`/api/users/${currentUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const data = await response.json();
      const updatedUser: User = {
        ...currentUser,
        ...data.user,
        permissions: getUserPermissions(data.user.role),
      };
      
      setCurrentUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Update failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, currentPassword, newPassword }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Password change failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

/**
 * Refresh user data from server
 */
export async function refreshUser(): Promise<User | null> {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const response = await fetch(`/api/users/${currentUser.id}`);
    
    if (response.ok) {
      const data = await response.json();
      const user: User = {
        ...data,
        permissions: getUserPermissions(data.role),
      };
      
      setCurrentUser(user);
      return user;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Listen for auth changes (cross-tab sync)
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorageChange = () => {
    callback(getCurrentUser());
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Require authentication (for protected routes)
 */
export function requireAuth(): User | null {
  const user = getCurrentUser();
  
  if (!user && typeof window !== 'undefined') {
    window.location.href = '/login';
    return null;
  }
  
  return user;
}

/**
 * Require specific permission
 */
export function requirePermission(permission: Permission): boolean {
  if (!hasPermission(permission)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return false;
  }
  
  return true;
}

/**
 * Require specific role
 */
export function requireRole(role: UserRole): boolean {
  if (!hasRole(role)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return false;
  }
  
  return true;
}
