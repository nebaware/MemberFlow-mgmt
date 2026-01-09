import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth.config";
import { z } from "zod";

/**
 * Require authentication for API routes
 */
export async function requireAuth(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json(
            { error: "Unauthorized - Please log in" },
            { status: 401 }
        );
    }

    return session;
}

/**
 * Require specific role(s) for API routes
 */
export async function requireRole(request: Request, allowedRoles: string[]) {
    const session = await requireAuth(request);

    if (session instanceof NextResponse) {
        return session; // Return error response
    }

    if (!allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
            { error: "Forbidden - Insufficient permissions" },
            { status: 403 }
        );
    }

    return session;
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T>(
    request: Request,
    schema: z.ZodSchema<T>
): Promise<T | NextResponse> {
    try {
        const body = await request.json();
        return schema.parse(body);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

/**
 * Combined auth + validation helper
 */
export async function validateAuthRequest<T>(
    request: Request,
    schema: z.ZodSchema<T>,
    allowedRoles?: string[]
) {
    // Check authentication
    const session = allowedRoles
        ? await requireRole(request, allowedRoles)
        : await requireAuth(request);

    if (session instanceof NextResponse) {
        return session; // Return error response
    }

    // Validate request body
    const data = await validateRequest(request, schema);

    if (data instanceof NextResponse) {
        return data; // Return error response
    }

    return { session, data };
}
