
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FarmerRegistrationForm } from "@/components/auth/forms/farmer-registration-form";
import { BuyerRegistrationForm } from "@/components/auth/forms/buyer-registration-form";
import { AgentRegistrationForm } from "@/components/transport-providers/agent-registration-form";
import { EducatorRegistrationForm } from "@/components/auth/forms/educator-registration-form";
import { ToolSellerRegistrationForm } from "@/components/auth/forms/tool-seller-registration-form";
import { StorageProviderRegistrationForm } from "@/components/auth/forms/storage-provider-registration-form";
import { User, ShoppingBag, Truck, BookOpen, Wrench, Warehouse } from "lucide-react";
import { useTranslations } from 'next-intl';


export function RegistrationTabs() {
  const t = useTranslations();

  return (
    <Tabs defaultValue="farmer" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        <TabsTrigger value="farmer" className="text-xs sm:text-sm">
          <User className="mr-1 sm:mr-2 h-4 w-4" /> {t('join.roles.farmer')}
        </TabsTrigger>
        <TabsTrigger value="buyer" className="text-xs sm:text-sm">
          <ShoppingBag className="mr-1 sm:mr-2 h-4 w-4" /> {t('join.roles.buyer')}
        </TabsTrigger>
        <TabsTrigger value="transport" className="text-xs sm:text-sm">
          <Truck className="mr-1 sm:mr-2 h-4 w-4" /> {t('join.roles.transport')}
        </TabsTrigger>
        <TabsTrigger value="educator" className="text-xs sm:text-sm">
          <BookOpen className="mr-1 sm:mr-2 h-4 w-4" /> {t('join.roles.educator')}
        </TabsTrigger>
        <TabsTrigger value="tool_seller" className="text-xs sm:text-sm">
          <Wrench className="mr-1 sm:mr-2 h-4 w-4" /> {t('join.roles.tool_seller')}
        </TabsTrigger>
        <TabsTrigger value="storage_provider" className="text-xs sm:text-sm">
          <Warehouse className="mr-1 sm:mr-2 h-4 w-4" /> {t('join.roles.storage')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="farmer">
        <FarmerRegistrationForm />
      </TabsContent>
      <TabsContent value="buyer">
        <BuyerRegistrationForm />
      </TabsContent>
      <TabsContent value="transport">
        <AgentRegistrationForm />
      </TabsContent>
      <TabsContent value="educator">
        <EducatorRegistrationForm />
      </TabsContent>
      <TabsContent value="tool_seller">
        <ToolSellerRegistrationForm />
      </TabsContent>
      <TabsContent value="storage_provider">
        <StorageProviderRegistrationForm />
      </TabsContent>
    </Tabs>
  );
}
