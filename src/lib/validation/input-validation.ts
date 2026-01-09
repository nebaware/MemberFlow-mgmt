// Simple HTML sanitization without external dependencies

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'email' | 'phone' | 'url';
  min?: number;
  max?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class InputValidator {
  private errors: ValidationError[] = [];

  validate(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationError[] {
    this.errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      this.validateField(field, value, rule);
    }

    return this.errors;
  }

  private validateField(field: string, value: any, rule: ValidationRule): void {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      this.errors.push({ field, message: `${field} is required` });
      return;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return;
    }

    // Type validation
    if (rule.type) {
      if (!this.validateType(value, rule.type)) {
        this.errors.push({ field, message: `${field} must be a valid ${rule.type}` });
        return;
      }
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        this.errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` });
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        this.errors.push({ field, message: `${field} must not exceed ${rule.maxLength} characters` });
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        this.errors.push({ field, message: `${field} format is invalid` });
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        this.errors.push({ field, message: `${field} must be at least ${rule.min}` });
      }
      if (rule.max !== undefined && value > rule.max) {
        this.errors.push({ field, message: `${field} must not exceed ${rule.max}` });
      }
    }
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return typeof value === 'string' && /^\+?[\d\s\-\(\)]{10,}$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }
}

// Sanitization functions
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove dangerous characters
    .trim();
}

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Allow only safe HTML tags and remove dangerous attributes
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .trim();
}

export function sanitizeNumber(input: any): number | null {
  const num = Number(input);
  return isNaN(num) ? null : num;
}

export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1';
  }
  if (typeof input === 'number') {
    return input === 1;
  }
  return false;
}

// SQL injection prevention
export function escapeSqlString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/'/g, "''");
}

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    type: 'email' as const,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\u1200-\u137F]+$/ // Allow Amharic characters
  },
  phone: {
    type: 'phone' as const,
    pattern: /^\+251[0-9]{9}$/ // Ethiopian phone format
  },
  price: {
    type: 'number' as const,
    min: 0,
    max: 1000000
  },
  quantity: {
    type: 'number' as const,
    min: 0.1,
    max: 100000
  }
};