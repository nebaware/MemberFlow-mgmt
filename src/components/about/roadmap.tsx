"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Rocket, Smartphone, Mic, Link as LinkIcon, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function Roadmap() {
    const t = useTranslations("about");

    const milestones = [
        {
            quarter: "Q1 2025",
            title: t("roadmap_q1_title"),
            description: t("roadmap_q1_desc"),
            icon: Smartphone,
            color: "bg-blue-500",
            status: "In Progress",
        },
        {
            quarter: "Q2 2025",
            title: t("roadmap_q2_title"),
            description: t("roadmap_q2_desc"),
            icon: Mic,
            color: "bg-purple-500",
            status: "Planned",
        },
        {
            quarter: "Q3 2025",
            title: t("roadmap_q3_title"),
            description: t("roadmap_q3_desc"),
            icon: LinkIcon,
            color: "bg-green-500",
            status: "Planned",
        },
        {
            quarter: "Q4 2025",
            title: t("roadmap_q4_title"),
            description: t("roadmap_q4_desc"),
            icon: Globe,
            color: "bg-orange-500",
            status: "Planned",
        },
    ];

    return (
        <section className="py-12">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                        <Rocket className="w-8 h-8 text-primary" />
                        {t("roadmap_title")}
                    </h2>
                    <p className="text-muted-foreground text-lg">{t("roadmap_subtitle")}</p>
                </motion.div>
            </div>

            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 rounded-full" />

                <div className="space-y-12 md:space-y-0">
                    {milestones.map((milestone, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            {/* Content Side */}
                            <div className="w-full md:w-1/2 p-4">
                                <Card className={`overflow-hidden hover:shadow-lg transition-shadow border-l-4 ${index % 2 === 0 ? "md:text-right border-l-primary md:border-l-0 md:border-r-4 md:border-r-primary" : "border-l-primary"}`}>
                                    <CardContent className="p-6">
                                        <div className={`flex items-center gap-3 mb-2 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-wider">
                                                {milestone.quarter}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full border ${milestone.status === "In Progress" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                                {milestone.status}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 md:inline-flex">
                                            {milestone.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            {milestone.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Center Icon */}
                            <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-background border-4 border-primary shadow-lg shrink-0 my-4 md:my-0">
                                <milestone.icon className="w-5 h-5 text-primary" />
                            </div>

                            {/* Empty Side */}
                            <div className="w-full md:w-1/2 p-4 hidden md:block" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
