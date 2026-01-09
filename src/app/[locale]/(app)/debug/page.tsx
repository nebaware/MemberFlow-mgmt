'use client';

import { useSession } from 'next-auth/react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
    const { data: session } = useSession();
    const { user, isAdmin } = useApp();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Debug Information</h1>

            <Card>
                <CardHeader>
                    <CardTitle>NextAuth Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AppContext User</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Permission Checks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p><strong>isAdmin():</strong> {isAdmin() ? 'true' : 'false'}</p>
                        <p><strong>User Role (raw):</strong> {user?.role}</p>
                        <p><strong>User Role (lowercase):</strong> {user?.role?.toLowerCase()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
