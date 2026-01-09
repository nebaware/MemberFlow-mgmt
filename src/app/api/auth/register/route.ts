import { NextResponse } from 'next/server';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password-utils';
import { validateLicenseFormat, requiresLicense } from '@/lib/license-validator';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            email,
            password,
            name,
            role,
            phone,
            location,
            licenseNumber,
            licenseExpiry,
            farmSize,
            farmSizeUnit,
            specialization,
            experienceYears,
        } = body;

        // Validate required fields
        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: 'Missing required fields: email, password, name, and role are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: 'Password does not meet requirements', details: passwordValidation.errors },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles = ['farmer', 'buyer', 'transporter', 'educator', 'tool_seller', 'storage_provider'];
        if (!validRoles.includes(role.toLowerCase())) {
            return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
        }

        // Validate license for roles that require it
        const roleUpper = role.toUpperCase() as any;
        if (requiresLicense(roleUpper)) {
            if (!licenseNumber) {
                return NextResponse.json(
                    { error: `License number is required for ${role} role` },
                    { status: 400 }
                );
            }

            const licenseValidation = validateLicenseFormat(licenseNumber, roleUpper);
            if (!licenseValidation.isValid) {
                return NextResponse.json(
                    { error: 'Invalid license format', details: licenseValidation.errors },
                    { status: 400 }
                );
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role: roleUpper, // Use the uppercase role enum
                phone: phone || null,
                location: location || null,
                licenseNumber: licenseNumber || null,
                licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
                licenseVerified: false,
                verificationStatus: 'pending',
                farmSize: farmSize ? parseFloat(farmSize) : null,
                farmSizeUnit: farmSizeUnit || null,
                specialization: specialization || null,
                experienceYears: experienceYears ? parseInt(experienceYears) : null,
            },
        });

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: requiresLicense(roleUpper)
                    ? 'Registration successful! Your account is pending license verification by an administrator.'
                    : 'Registration successful! You can now login to your account.',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    licenseVerified: newUser.licenseVerified,
                    verificationStatus: newUser.verificationStatus,
                },
                requiresVerification: requiresLicense(roleUpper),
            },
            { status: 201 }
        );
    } catch (err: any) {
        console.error('Registration error:', err);
        return NextResponse.json(
            { error: 'Registration failed', details: err.message },
            { status: 500 }
        );
    }
}
