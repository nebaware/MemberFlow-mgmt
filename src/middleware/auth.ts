// Middleware for role-based access control
export function requireAuth(user: any) {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function requireAdmin(user: any) {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

export function requireRole(user: any, allowedRoles: string[]) {
  if (!user) {
    throw new Error('Authentication required');
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }
  return user;
}

export function canAccessResource(user: any, resourceOwnerId: string) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.id === resourceOwnerId;
}
