"use client";

import { CheckCircle, Clock, Truck, Package, ShieldCheck, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface OrderTimelineProps {
    order: {
        status: string;
        paymentStatus: string;
        deliveryStatus: string;
        escrowStatus: string;
        createdAt: Date;
        updatedAt: Date;
    };
}

interface TimelineStep {
    label: string;
    icon: any;
    completed: boolean;
    timestamp?: Date;
    color: string;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
    const steps: TimelineStep[] = [
        {
            label: 'Order Placed',
            icon: Package,
            completed: true,
            timestamp: order.createdAt,
            color: 'text-blue-500',
        },
        {
            label: 'Payment Confirmed',
            icon: ShieldCheck,
            completed: order.paymentStatus === 'paid' || order.paymentStatus === 'released',
            timestamp: order.paymentStatus === 'paid' ? order.updatedAt : undefined,
            color: 'text-green-500',
        },
        {
            label: 'Shipped',
            icon: Truck,
            completed: order.deliveryStatus === 'shipped' || order.deliveryStatus === 'delivered',
            timestamp: order.deliveryStatus === 'shipped' ? order.updatedAt : undefined,
            color: 'text-indigo-500',
        },
        {
            label: 'Delivered',
            icon: CheckCircle,
            completed: order.deliveryStatus === 'delivered',
            timestamp: order.deliveryStatus === 'delivered' ? order.updatedAt : undefined,
            color: 'text-emerald-500',
        },
    ];

    // Check for disputed status
    if (order.escrowStatus === 'disputed') {
        steps.push({
            label: 'Disputed',
            icon: AlertCircle,
            completed: true,
            timestamp: order.updatedAt,
            color: 'text-red-500',
        });
    }

    return (
        <div className="py-6">
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

                {/* Timeline Steps */}
                <div className="space-y-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="relative flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${step.completed
                                            ? `${step.color} bg-background border-current`
                                            : 'border-muted bg-muted text-muted-foreground'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-0.5">
                                    <p className={`font-semibold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {step.label}
                                    </p>
                                    {step.timestamp && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {format(new Date(step.timestamp), 'PPp')}
                                        </p>
                                    )}
                                    {!step.completed && index > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Pending
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
