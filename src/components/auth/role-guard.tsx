"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
    children: React.ReactNode;
    requiredRole: string | string[];
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
    const { user, isLoading } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        // If user has 'admin' role, they can access everything (optional, but good practice)
        if (user.role === 'admin') return;

        if (!roles.includes(user.role)) {
            // Redirect to profile settings with the first required role as the requested role
            const targetRole = roles[0];
            router.push(`/profile?tab=settings&requestRole=${targetRole}`);
        }
    }, [user, isLoading, requiredRole, router]);

    if (isLoading || !user) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (user.role !== 'admin' && !roles.includes(user.role)) {
        return null; // Don't render children while redirecting
    }

    return <>{children}</>;
}
