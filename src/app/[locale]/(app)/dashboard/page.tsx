
"use client";

import { useState, type ReactNode, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageTitle } from '@/components/shared/page-title';
import { APP_NAME } from '@/lib/constants';
import { FarmerDashboard } from '@/components/dashboards/farmer-dashboard';
import { BuyerDashboard } from '@/components/dashboards/buyer-dashboard';
import { TransporterDashboard } from '@/components/dashboards/transporter-dashboard';
import { EducatorDashboard } from '@/components/dashboards/educator-dashboard';
import { ToolSellerDashboard } from '@/components/dashboards/tool-seller-dashboard';
import { StorageProviderDashboard } from '@/components/dashboards/storage-provider-dashboard';
import { useTranslations } from 'next-intl';
import { DashboardHero } from '@/components/dashboards/dashboard-hero';
import { RoleSelection } from '@/components/dashboards/role-selection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Role = "farmer" | "buyer" | "transporter" | "educator" | "tool_seller" | "storage_provider" | "admin" | "none";

function DashboardContent() {
  const [currentUserRole, setCurrentUserRole] = useState<Role>("none");
  const searchParams = useSearchParams();
  const t = useTranslations();

  const roleDisplayNames: Record<Role, string> = {
    farmer: t('dashboard.role_farmer'),
    buyer: t('dashboard.role_buyer'),
    transporter: t('dashboard.role_transporter'),
    educator: t('dashboard.role_educator'),
    tool_seller: t('dashboard.role_tool_seller'),
    storage_provider: t('dashboard.role_storage_provider'),
    admin: 'Admin',
    none: t('dashboard.select_role')
  };

  useEffect(() => {
    const roleFromQuery = searchParams.get('role') as Role | null;
    if (roleFromQuery && roleDisplayNames.hasOwnProperty(roleFromQuery) && roleFromQuery !== 'none') {
      if (currentUserRole !== roleFromQuery) {
        setCurrentUserRole(roleFromQuery);
      }
    }
  }, [searchParams, currentUserRole, setCurrentUserRole]);

  const handleRoleChange = (newRole: string) => {
    setCurrentUserRole(newRole as Role);
    // Scroll to top when role changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderDashboardByRole = (): ReactNode => {
    switch (currentUserRole) {
      case "farmer":
        return <FarmerDashboard />;
      case "buyer":
        return <BuyerDashboard />;
      case "transporter":
        return <TransporterDashboard />;
      case "educator":
        return <EducatorDashboard />;
      case "tool_seller":
        return <ToolSellerDashboard />;
      case "storage_provider":
        return <StorageProviderDashboard />;
      case "admin":
        window.location.href = '/admin/database';
        return null;
      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHero />
            <RoleSelection onSelectRole={handleRoleChange} currentRole={currentUserRole} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      {currentUserRole !== "none" && (
        <div className="mb-6 flex items-center justify-between">
          <PageTitle
            title={t('nav.dashboard')}
            description={`${t('dashboard.role')}: ${roleDisplayNames[currentUserRole]}`}
          />
          <Button
            variant="outline"
            onClick={() => setCurrentUserRole("none")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('dashboard.select_role')}
          </Button>
        </div>
      )}

      {renderDashboardByRole()}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
