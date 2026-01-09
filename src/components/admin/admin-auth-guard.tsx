'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login?callbackUrl=/admin');
        } else if (session.user.role !== 'admin' && session.user.role !== 'ADMIN') {
            router.push('/dashboard'); // Redirect non-admins to dashboard
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
        return null; // Will redirect via useEffect
    }

    return <>{children}</>;
}
