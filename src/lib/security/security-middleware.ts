import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/auth-helpers';
import { apiRateLimit, authRateLimit, aiRateLimit } from '@/lib/security/rate-limit';
import { addSecurityHeaders } from '@/lib/security/security-headers';
import { InputValidator, commonRules } from '@/lib/validation/input-validation';

export interface SecurityOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: 'api' | 'auth' | 'ai' | 'none';
  validateInput?: Record<string, any>;
  allowedMethods?: string[];
}

export async function securityMiddleware(
  request: NextRequest,
  options: SecurityOptions = {}
): Promise<NextResponse | null> {

  // Method validation
  if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: options.allowedMethods.join(', ') } }
    );
  }

  // Rate limiting
  if (options.rateLimit && options.rateLimit !== 'none') {
    let rateLimitResult: NextResponse | null = null;

    switch (options.rateLimit) {
      case 'api':
        rateLimitResult = await apiRateLimit(request);
        break;
      case 'auth':
        rateLimitResult = await authRateLimit(request);
        break;
      case 'ai':
        rateLimitResult = await aiRateLimit(request);
        break;
    }

    if (rateLimitResult) {
      return addSecurityHeaders(rateLimitResult);
    }
  }

  // Authentication
  if (options.requireAuth) {
    const user = await getAuthUser(request);
    if (!user) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    // Admin check
    if (options.requireAdmin && user.role !== 'admin') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      );
    }
  }

  // Input validation (for POST/PUT/PATCH requests)
  if (options.validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json();
      const validator = new InputValidator();
      const errors = validator.validate(body, options.validateInput);

      if (errors.length > 0) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Validation failed', details: errors },
            { status: 400 }
          )
        );
      }
    } catch (error) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      );
    }
  }

  return null; // Continue processing
}

// Convenience functions for common security patterns
export const withAuth = (options: Omit<SecurityOptions, 'requireAuth'> = {}) => ({
  ...options,
  requireAuth: true
});

export const withAdmin = (options: Omit<SecurityOptions, 'requireAuth' | 'requireAdmin'> = {}) => ({
  ...options,
  requireAuth: true,
  requireAdmin: true
});

export const withRateLimit = (type: 'api' | 'auth' | 'ai', options: Omit<SecurityOptions, 'rateLimit'> = {}) => ({
  ...options,
  rateLimit: type
});

// Common validation schemas
export const validationSchemas = {
  user: {
    email: commonRules.email,
    name: commonRules.name,
    password: commonRules.password,
    phone: commonRules.phone
  },
  product: {
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { required: true, minLength: 10, maxLength: 1000 },
    price: commonRules.price,
    category: { required: true, minLength: 2, maxLength: 50 }
  },
  order: {
    productId: { required: true, type: 'number' as const },
    quantity: commonRules.quantity,
    deliveryAddress: { required: true, minLength: 10, maxLength: 200 }
  }
};