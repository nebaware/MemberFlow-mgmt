
"use client";

import * as React from "react";
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/types';
import { NAV_ITEMS } from '@/lib/constants';
import { useApp } from '@/contexts/AppContext';
import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';

// Translation key mapping for navigation items
// Maps English labels from NAV_ITEMS to translation keys
const getNavTranslationKey = (label: string): string => {
  const keyMap: Record<string, string> = {
    'Dashboard': 'dashboard',
    'Marketplace': 'marketplace',
    'Browse Products': 'browse',
    'List Your Product': 'list_product',
    'My Orders & Sales': 'orders',
    'My Favorites': 'favorites',
    'Services & Tools': 'services',
    'AI Crop Advisor': 'ai_advisor',
    'Pricing Assistant': 'pricing',
    'Cooperative Planner': 'cooperative',
    'IoT & Weather': 'iot_weather',
    'Request Transport': 'transportation',
    'Find Storage': 'storage',
    'Learning Hub': 'learning',
    'Explore Courses': 'learning',
    'My Profile': 'profile',
    'View Profile': 'profile',
    'My Earnings': 'earnings',
    'Transactions': 'transactions',
    'Notifications': 'notifications',
    'Settings': 'settings',
    'Login/Logout': 'settings',
    'Admin': 'admin',
    'KYC Command Center': 'kyc_command',
    'Verify Users': 'admin',
    'Verify Users (Legacy)': 'admin',
    'Verification Center': 'verification',
    'Platform Revenue': 'earnings',
    'Join Azmera': 'join',
    'About Us': 'about',
  };
  return keyMap[label] || label.toLowerCase().replace(/\s+/g, '_');
};


export function NavItems() {
  const pathname = usePathname();
  const { isOpen, isCollapsible } = useSidebar();
  const { user } = useApp();
  const t = useTranslations();

  // Function to get translated label
  const getTranslatedLabel = (label: string): string => {
    const key = getNavTranslationKey(label);
    return t(`nav.${key}`);
  };

  // Filter navigation items based on user role
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // Hide Admin section for non-admin users
      if (item.label === 'Admin' && user?.role !== 'admin') {
        return false;
      }

      // Filter children if they exist
      if (item.children) {
        item.children = filterNavItems(item.children);
      }

      return true;
    });
  };

  const filteredNavItems = filterNavItems([...NAV_ITEMS]);

  const renderNavItem = (item: NavItem, isSubItem = false, parentKey = ''): JSX.Element => {
    const key = `${parentKey}-${item.label.replace(/\s+/g, '-')}`;
    const isActive = item.href ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) : false;

    if (item.children && item.children.length > 0) {
      // Determine if any child is active to keep accordion open
      const isChildActive = item.children.some(child => child.href && pathname.startsWith(child.href));
      const defaultAccordionValue = isChildActive ? key : undefined;

      if (isCollapsible && !isOpen) {
        // Collapsed state: Show parent icon with tooltip, children in a dropdown/popover (simplified here)
        return (
          <TooltipProvider key={key} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isChildActive ? "default" : "ghost"}
                  className="w-full justify-center h-10"
                  asChild
                >
                  {/* In collapsed mode, parent might not be directly clickable if it's just a group */}
                  {/* For simplicity, making it a non-functional button or link to the first child */}
                  <Link href={item.href || item.children[0].href || '#'}>
                    <item.icon className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {getTranslatedLabel(item.label)}
                {item.children && (
                  <div className="flex flex-col gap-1">
                    {item.children.map(child => (
                      <Link key={child.label} href={child.href || '#'} className="text-xs p-1 hover:bg-muted rounded-sm">
                        {getTranslatedLabel(child.label)}
                      </Link>
                    ))}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      // Expanded state: Show accordion
      return (
        <Accordion key={key} type="single" collapsible defaultValue={defaultAccordionValue} className="w-full">
          <AccordionItem value={key} className="border-b-0">
            <AccordionTrigger
              className={cn(
                "py-2 px-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm font-medium group",
                isChildActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <div className="flex items-center gap-2">
                <item.icon className={cn("h-5 w-5", isChildActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground")} />
                <span className="group-data-[collapsible=icon]:hidden">{getTranslatedLabel(item.label)}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4 group-data-[collapsible=icon]:hidden">
              <div className="flex flex-col space-y-1 mt-1">
                {item.children.map(child => renderNavItem(child, true, key))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    // Single item without children
    if (isCollapsible && !isOpen) {
      // Collapsed state for single item
      return (
        <TooltipProvider key={key} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-center h-10"
                asChild
              >
                <Link href={item.href || '#'}>
                  <item.icon className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.tooltip || getTranslatedLabel(item.label)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Expanded state for single item
    return (
      <Button
        key={key}
        variant={isActive ? (isSubItem ? 'secondary' : 'default') : 'ghost'}
        className={cn(
          "w-full justify-start h-auto py-2 px-3 text-sm font-medium",
          isSubItem && "pl-8", // Indent sub-items
          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        )}
        asChild
      >
        <Link href={item.href || '#'}>
          <item.icon className={cn("h-5 w-5 mr-2", "group-data-[collapsible=icon]:mr-0")} />
          <span className="group-data-[collapsible=icon]:hidden">{getTranslatedLabel(item.label)}</span>
        </Link>
      </Button>
    );
  };

  return (
    <nav className="grid items-start gap-1 px-2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
      {filteredNavItems.map(item => renderNavItem(item, false, 'nav'))}
    </nav>
  );
}
