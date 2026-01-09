
import type React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavItems, Header } from '@/components/layout';
import { APP_NAME } from '@/lib/constants';
import { Leaf } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" isCollapsible={true} side="left">
          <SidebarHeader className="p-4 items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Leaf className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl group-data-[collapsible=icon]:hidden">
                {APP_NAME}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <NavItems /> {/* Corrected component name */}
          </SidebarContent>
          <SidebarFooter className="p-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} {APP_NAME}
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LanguageProvider>
  );
}

