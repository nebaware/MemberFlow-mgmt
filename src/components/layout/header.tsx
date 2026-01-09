"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import BackendIcon from '@/components/icons/backend-icon';
import { ModeToggle } from "@/components/layout/mode-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 bg-background/40 backdrop-blur-xl border-b border-white/10 dark:border-white/5">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <div className="mr-8 hidden md:flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
              <BackendIcon className="h-6 w-6 text-primary" />
            </div>
            <span className="hidden font-bold text-xl sm:inline-block font-outfit tracking-tight">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Mobile sidebar trigger */}
        <div className="md:hidden flex items-center h-full mr-2">
          <SidebarTrigger className="h-10 w-10" />
        </div>

        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          {/* Mobile App Name */}
          <div className="md:hidden">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <BackendIcon className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-outfit tracking-tight">
                {APP_NAME}
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-3">
            <div className="hidden sm:flex items-center h-9 px-3 rounded-full bg-muted/30 border border-white/5 mx-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Ecosystem Active</span>
              <div className="ml-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
            </div>
            <ModeToggle />
            <LanguageSwitcher />
            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  );
}
