"use client";

import { PageTitle } from "@/components/shared/page-title";
import { RoleRequestsTable } from "@/components/admin/role-requests-table";
import { ShieldAlert } from "lucide-react";

export default function RoleRequestsPage() {
    return (
        <div className="space-y-6">
            <PageTitle
                title="Role Change Requests"
                description="Review and manage user requests to change their account roles."
            >
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    <ShieldAlert className="h-4 w-4 text-yellow-600" />
                    <span>Requires careful review</span>
                </div>
            </PageTitle>

            <RoleRequestsTable />
        </div>
    );
}
