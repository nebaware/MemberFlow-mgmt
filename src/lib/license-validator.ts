/**
 * License Validation Utilities
 * Role-specific license format validation and verification
 */

export type UserRole = 'FARMER' | 'BUYER' | 'TRANSPORTER' | 'STORAGE_PROVIDER' | 'EDUCATOR' | 'ADMIN';

export interface LicenseValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validate license number format based on role
 */
export function validateLicenseFormat(
    licenseNumber: string,
    role: UserRole
): LicenseValidationResult {
    const errors: string[] = [];

    if (!licenseNumber || licenseNumber.trim().length === 0) {
        errors.push('License number is required');
        return { isValid: false, errors };
    }

    const trimmedLicense = licenseNumber.trim();

    switch (role) {
        case 'TRANSPORTER':
            // Format: TL-YYYY-XXXX (e.g., TL-2024-001)
            if (!/^TL-\d{4}-\d{3,6}$/.test(trimmedLicense)) {
                errors.push('Transporter license must be in format: TL-YYYY-XXX (e.g., TL-2024-001)');
            }
            break;

        case 'STORAGE_PROVIDER':
            // Format: SP-YYYY-XXXX or TIN format
            if (!/^(SP-\d{4}-\d{3,6}|TIN-\d{9,10})$/.test(trimmedLicense)) {
                errors.push('Storage provider license must be in format: SP-YYYY-XXX or TIN-XXXXXXXXX');
            }
            break;

        case 'EDUCATOR':
            // Format: EDU-YYYY-XXXX
            if (!/^EDU-\d{4}-\d{3,6}$/.test(trimmedLicense)) {
                errors.push('Educator license must be in format: EDU-YYYY-XXX (e.g., EDU-2024-001)');
            }
            break;

        case 'FARMER':
            // Format: FL-YYYY-XXXX (Farmer License) - optional but if provided must be valid
            if (trimmedLicense && !/^FL-\d{4}-\d{3,6}$/.test(trimmedLicense)) {
                errors.push('Farmer license must be in format: FL-YYYY-XXX (e.g., FL-2024-001)');
            }
            break;

        case 'BUYER':
            // Buyers typically don't need licenses, but can have business registration
            if (trimmedLicense && trimmedLicense.length < 5) {
                errors.push('Business registration number must be at least 5 characters');
            }
            break;

        case 'ADMIN':
            // Admins don't need licenses
            break;

        default:
            errors.push('Invalid role specified');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Check if license is expired
 */
export function isLicenseExpired(expiryDate: Date | string | null): boolean {
    if (!expiryDate) return false; // No expiry date means no expiration

    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();

    return expiry < now;
}

/**
 * Check if license is expiring soon (within 30 days)
 */
export function isLicenseExpiringSoon(expiryDate: Date | string | null): boolean {
    if (!expiryDate) return false;

    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return expiry <= thirtyDaysFromNow && expiry > now;
}

/**
 * Get license status
 */
export function getLicenseStatus(
    licenseVerified: boolean,
    expiryDate: Date | string | null
): 'verified' | 'pending' | 'expired' | 'expiring_soon' {
    if (!licenseVerified) return 'pending';
    if (isLicenseExpired(expiryDate)) return 'expired';
    if (isLicenseExpiringSoon(expiryDate)) return 'expiring_soon';
    return 'verified';
}

/**
 * Check if role requires license verification
 */
export function requiresLicense(role: UserRole): boolean {
    return ['TRANSPORTER', 'STORAGE_PROVIDER', 'EDUCATOR'].includes(role);
}

/**
 * Check if role can optionally have a license
 */
export function canHaveLicense(role: UserRole): boolean {
    return ['FARMER', 'BUYER'].includes(role);
}

/**
 * Get license requirement message for role
 */
export function getLicenseRequirementMessage(role: UserRole): string {
    switch (role) {
        case 'TRANSPORTER':
            return 'Valid driving license required for transporter registration';
        case 'STORAGE_PROVIDER':
            return 'Business license or TIN required for storage provider registration';
        case 'EDUCATOR':
            return 'Teaching or professional license required for educator registration';
        case 'FARMER':
            return 'Farmer license is optional but recommended';
        case 'BUYER':
            return 'Business registration is optional';
        case 'ADMIN':
            return 'No license required for admin accounts';
        default:
            return 'License requirements vary by role';
    }
}
