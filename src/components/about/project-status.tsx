"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Activity, Users, ShoppingCart, Globe, Server } from "lucide-react";
import { motion } from "framer-motion";

export function ProjectStatus() {
    const t = useTranslations("about");

    const stats = [
        {
            label: t("stat_active_users"),
            value: "12,543",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            status: "Live",
        },
        {
            label: t("stat_transactions"),
            value: "2,890",
            icon: ShoppingCart,
            color: "text-green-500",
            bg: "bg-green-500/10",
            status: "Processing",
        },
        {
            label: t("stat_uptime"),
            value: "99.9%",
            icon: Server,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            status: "Operational",
        },
        {
            label: t("stat_regions"),
            value: "8",
            icon: Globe,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            status: "Expanding",
        },
    ];

    return (
        <section className="py-12">
            <div className="text-center mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                        <Activity className="w-8 h-8 text-primary animate-pulse" />
                        {t("status_title")}
                    </h2>
                    <p className="text-muted-foreground text-lg">{t("status_subtitle")}</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-2 opacity-50`}>
                                <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stat.color.replace('text-', 'bg-')}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${stat.color.replace('text-', 'bg-')}`}></span>
                                    </span>
                                    {stat.status}
                                </div>
                            </div>
                            <CardContent className="p-6 flex flex-col items-center text-center pt-10">
                                <div className={`p-4 rounded-full ${stat.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
