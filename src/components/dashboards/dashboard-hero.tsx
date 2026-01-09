"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowRight, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function DashboardHero() {
    const t = useTranslations('dashboard');

    // Generate particle positions once on mount to avoid hydration mismatch
    const [particles, setParticles] = useState<Array<{ left: number; top: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        setParticles(
            Array.from({ length: 8 }, (_, i) => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                delay: i * 0.5,
                duration: 3 + Math.random() * 2
            }))
        );
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl text-white shadow-2xl">
            {/* 3D Animated Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                    filter: 'brightness(0.7) contrast(1.1) saturate(1.2)'
                }}
            >
                <source src="/images/unwatermark_PixVerse_V5_Image_Text_540P_Seamless_3D_animat (1).mp4" type="video/mp4" />
            </video>

            {/* Dynamic Gradient Overlay with Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/85 via-green-800/75 to-yellow-900/85 animate-gradient-shift"></div>

            {/* Animated Glow Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Floating Particles Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full animate-float-particle"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: `${particle.duration}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Holographic Grid Lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-0 left-[20%] w-px h-full bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent animate-slide-down"></div>
                <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-green-400/60 to-transparent animate-slide-down" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-0 left-[80%] w-px h-full bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent animate-slide-down" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 text-center sm:px-8 md:px-12 lg:py-24 xl:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-4 lg:mb-6 inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 lg:px-4 text-xs sm:text-sm font-medium text-green-100 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                        <Leaf className="mr-1.5 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4 text-green-300 animate-pulse" />
                        <span className="line-clamp-1">{t('platform_desc')}</span>
                    </div>
                </motion.div>

                <motion.h1
                    className="mb-4 lg:mb-6 max-w-4xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <span className="block drop-shadow-lg">{t('hero_title')}</span>
                    <span className="block bg-gradient-to-r from-green-200 via-teal-200 to-green-200 bg-clip-text text-transparent mt-1 lg:mt-2 animate-gradient-text bg-[length:200%_auto]">
                        {t('hero_subtitle')}
                    </span>
                </motion.h1>

                <motion.p
                    className="mb-6 lg:mb-10 max-w-2xl text-sm sm:text-base lg:text-lg xl:text-xl text-green-100 px-2 drop-shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {t('select_role_desc')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Button
                        size="lg"
                        className="h-11 sm:h-12 lg:h-14 rounded-full bg-gradient-to-r from-white to-green-50 px-6 sm:px-8 text-base lg:text-lg font-bold text-green-900 hover:from-green-50 hover:to-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20"
                        onClick={() => document.getElementById('role-selection')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        {t('hero_cta')}
                        <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5 animate-bounce-x" />
                    </Button>
                </motion.div>
            </div>

            {/* Enhanced CSS Animations */}
            <style jsx>{`
                @keyframes gradient-shift {
                    0%, 100% { opacity: 0.85; }
                    50% { opacity: 0.95; }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                }
                @keyframes float-particle {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 0.3; }
                    90% { opacity: 0.3; }
                    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
                }
                @keyframes slide-down {
                    0% { transform: translateY(-100%); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(100%); opacity: 0; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes gradient-text {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes bounce-x {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(4px); }
                }
                
                .animate-gradient-shift { animation: gradient-shift 8s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
                .animate-float-particle { animation: float-particle linear infinite; }
                .animate-slide-down { animation: slide-down 8s linear infinite; }
                .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
                .animate-gradient-text { animation: gradient-text 3s linear infinite; }
                .animate-bounce-x { animation: bounce-x 1s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
