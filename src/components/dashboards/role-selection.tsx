"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, ShoppingCart, Truck, GraduationCap, Wrench, Warehouse, ArrowRight } from "lucide-react";

interface RoleSelectionProps {
    onSelectRole: (role: string) => void;
    currentRole: string;
}

export function RoleSelection({ onSelectRole, currentRole }: RoleSelectionProps) {
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');

    const roles = [
        {
            id: "farmer",
            title: t('role_farmer'),
            description: t('role_farmer_desc'),
            icon: Sprout,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20",
            border: "hover:border-green-500",
            gradient: "hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/30 dark:hover:to-emerald-950/30"
        },
        {
            id: "buyer",
            title: t('role_buyer'),
            description: t('role_buyer_desc'),
            icon: ShoppingCart,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20",
            border: "hover:border-blue-500",
            gradient: "hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30"
        },
        {
            id: "transporter",
            title: t('role_transporter'),
            description: t('role_transporter_desc'),
            icon: Truck,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/20",
            border: "hover:border-amber-500",
            gradient: "hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30"
        },
        {
            id: "educator",
            title: t('role_educator'),
            description: t('role_educator_desc'),
            icon: GraduationCap,
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/20",
            border: "hover:border-purple-500",
            gradient: "hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30"
        },
        {
            id: "tool_seller",
            title: t('role_tool_seller'),
            description: t('role_tool_seller_desc'),
            icon: Wrench,
            color: "text-cyan-600",
            bg: "bg-cyan-100 dark:bg-cyan-900/20",
            border: "hover:border-cyan-500",
            gradient: "hover:from-cyan-50 hover:to-sky-50 dark:hover:from-cyan-950/30 dark:hover:to-sky-950/30"
        },
        {
            id: "storage_provider",
            title: t('role_storage_provider'),
            description: t('role_storage_provider_desc'),
            icon: Warehouse,
            color: "text-rose-600",
            bg: "bg-rose-100 dark:bg-rose-900/20",
            border: "hover:border-rose-500",
            gradient: "hover:from-rose-50 hover:to-red-50 dark:hover:from-rose-950/30 dark:hover:to-red-950/30"
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div id="role-selection" className="py-8 md:py-12 lg:py-16 space-y-6 lg:space-y-10">
            <div className="text-center space-y-2 lg:space-y-4 px-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('role_selection_title')}</h2>
                <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">{t('role_selection_subtitle')}</p>
            </div>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
            >
                {roles.map((role) => (
                    <motion.div key={role.id} variants={item}>
                        <Card
                            className={`h-full cursor-pointer transition-all duration-300 border-2 ${currentRole === role.id ? 'border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]' : 'border-transparent hover:shadow-md'} ${role.border} bg-gradient-to-br ${role.gradient} bg-card`}
                            onClick={() => onSelectRole(role.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${role.bg} flex items-center justify-center mb-3 lg:mb-4 transition-transform group-hover:scale-110`}>
                                    <role.icon className={`h-6 w-6 lg:h-8 lg:w-8 ${role.color}`} />
                                </div>
                                <CardTitle className="text-lg lg:text-xl">{role.title}</CardTitle>
                                <CardDescription className="text-sm lg:text-base">{role.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Button
                                    variant={currentRole === role.id ? "default" : "outline"}
                                    className="w-full group"
                                    size="sm"
                                >
                                    {currentRole === role.id ? tCommon('active') : tCommon('view')}
                                    <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${currentRole === role.id ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
