
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle, CheckCircle, Clock, Truck, GraduationCap, Warehouse, ShieldCheck, ArrowRight, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const roleRequestSchema = z.object({
    requestedRole: z.string().min(1, "Please select a role"),
    licenseNumber: z.string().min(1, "License number is required"),
    documentUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    // Role specific fields
    vehicleType: z.string().optional(),
    plateNumber: z.string().optional(),
    institution: z.string().optional(),
    facilityType: z.string().optional(),
    capacity: z.string().optional(),
});

type RoleRequestFormValues = z.infer<typeof roleRequestSchema>;

export function RoleRequestForm({ currentRole, defaultRole }: { currentRole: string; defaultRole?: string }) {
    const { toast } = useToast();
    const t = useTranslations();
    const { user, setUser } = useApp();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<RoleRequestFormValues>({
        resolver: zodResolver(roleRequestSchema),
        defaultValues: {
            requestedRole: defaultRole || "",
            licenseNumber: "",
            documentUrl: "",
            vehicleType: "",
            plateNumber: "",
            institution: "",
            facilityType: "",
            capacity: "",
        },
    });

    const requestedRole = form.watch("requestedRole");

    if (user?.roleRequestStatus === 'pending') {
        return (
            <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden relative">
                <div className="relative z-10 space-y-8">
                    <div className="h-20 w-20 rounded-3xl bg-amber-500/10 flex items-center justify-center animate-pulse">
                        <Clock className="h-10 w-10 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black font-outfit uppercase tracking-tight">Application Under Review</h2>
                        <p className="text-lg font-medium opacity-60">
                            You have a pending request to become a <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-4 py-1 rounded-full uppercase font-black text-[10px] ml-2">{user.requestedRole}</Badge>
                        </p>
                    </div>
                    <Alert className="bg-amber-500/5 border-amber-500/20 rounded-2xl p-6">
                        <Info className="h-5 w-5 text-amber-600" />
                        <AlertTitle className="text-amber-800 font-bold mb-1">Standard Processing Time</AlertTitle>
                        <AlertDescription className="text-amber-700 font-medium">
                            Our verification team is currently reviewing your documents. This process typically takes 24-48 hours. You will receive a notification once a decision is made.
                        </AlertDescription>
                    </Alert>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <ShieldCheck className="h-48 w-48 text-amber-500" />
                </div>
            </Card>
        );
    }

    async function onSubmit(values: RoleRequestFormValues) {
        setIsSubmitting(true);
        try {
            // Collect metadata for role-specific fields
            const metadata: any = {};
            if (values.requestedRole === 'transporter') {
                metadata.vehicleType = values.vehicleType;
                metadata.plateNumber = values.plateNumber;
            } else if (values.requestedRole === 'educator') {
                metadata.institution = values.institution;
            } else if (values.requestedRole === 'storage_provider') {
                metadata.facilityType = values.facilityType;
                metadata.capacity = values.capacity;
            }

            const res = await fetch("/api/user/role-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestedRole: values.requestedRole.toUpperCase(),
                    documents: values.documentUrl ? [{ type: 'license', url: values.documentUrl, ...metadata }] : [metadata],
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit request");
            }

            toast({
                title: "Application Submitted",
                description: "Your professional credentials have been uploaded successfully.",
            });

            if (user) {
                setUser({
                    ...user,
                    requestedRole: values.requestedRole,
                    roleRequestStatus: 'pending'
                });
            }

            form.reset();
            router.refresh();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const availableRoles = [
        "farmer",
        "buyer",
        "transporter",
        "storage_provider",
        "educator",
        "tool_seller",
    ].filter((role) => role !== currentRole?.toLowerCase());

    return (
        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden group">
            <CardHeader className="p-8 md:p-12 bg-gradient-to-br from-indigo-600/10 to-transparent">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                        <ShieldCheck className="h-7 w-7 text-indigo-600" />
                    </div>
                    <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
                        Professional Onboarding
                    </Badge>
                </div>
                <CardTitle className="text-4xl font-black font-outfit uppercase tracking-tight leading-none mb-2">Elevate your Status</CardTitle>
                <CardDescription className="text-lg font-medium opacity-60">
                    Apply for professional credentials to unlock the full potential of the Azmera ecosystem.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-0 space-y-10">
                {user?.roleRequestStatus === 'rejected' && (
                    <Alert variant="destructive" className="rounded-2xl bg-rose-500/5 border-rose-500/20 p-6">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="font-bold text-lg">Previous Application Rejected</AlertTitle>
                        <AlertDescription className="font-medium opacity-80">
                            Reason: {user.rejectionReason || 'Documents did not meet our verification standards'}.
                            Please address the issues and re-submit your application.
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="requestedRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Target Professional Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 group-focus-within:border-indigo-500/50 transition-all font-bold">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl border-white/10 glass">
                                                {availableRoles.map((role) => (
                                                    <SelectItem key={role} value={role} className="rounded-xl font-medium focus:bg-indigo-500/10">
                                                        {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="licenseNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Business License / ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="AZ-09-887-221" {...field} className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all font-bold" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Role Specific Fields Section */}
                        {requestedRole && (
                            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
                                <Separator className="bg-white/10" />

                                <div className="flex items-center gap-3 mb-2">
                                    {requestedRole === 'transporter' && <Truck className="h-6 w-6 text-indigo-500" />}
                                    {requestedRole === 'educator' && <GraduationCap className="h-6 w-6 text-indigo-500" />}
                                    {requestedRole === 'storage_provider' && <Warehouse className="h-6 w-6 text-indigo-500" />}
                                    <h4 className="text-xl font-black font-outfit uppercase tracking-tight">Role Details</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {requestedRole === 'transporter' && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="vehicleType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Vehicle Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 font-bold">
                                                                    <SelectValue placeholder="Select vehicle" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl border-white/10 glass">
                                                                <SelectItem value="light_truck">Light Truck (&lt; 3.5t)</SelectItem>
                                                                <SelectItem value="heavy_truck">Heavy Truck (&gt; 3.5t)</SelectItem>
                                                                <SelectItem value="refrigerated">Refrigerated (Van/Truck)</SelectItem>
                                                                <SelectItem value="motorcycle">Motorcycle / Bajaj</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="plateNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Plate Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="ET 3-44566" {...field} className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 font-bold" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    {requestedRole === 'educator' && (
                                        <FormField
                                            control={form.control}
                                            name="institution"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Institutional Affiliation</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Addis Ababa University / Ministry of Agriculture" {...field} className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 font-bold" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {requestedRole === 'storage_provider' && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="facilityType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Facility Class</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 font-bold">
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl border-white/10 glass">
                                                                <SelectItem value="cold_storage">Cold Storage (Refrigerated)</SelectItem>
                                                                <SelectItem value="dry_warehouse">Dry Warehouse</SelectItem>
                                                                <SelectItem value="silo">Grain Silo</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="capacity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Total Capacity (m³ / tons)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="500 Tons" {...field} className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 font-bold" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="documentUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Verification Document Link (PDF/JPG)</FormLabel>
                                    <FormControl>
                                        <div className="relative group/input">
                                            <Input placeholder="https://cloud.azmera.et/share/license-verif.pdf" {...field} className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-white/10 pr-32 focus:border-indigo-500/50 font-medium" />
                                            <div className="absolute right-2 top-2 h-10 px-4 bg-white/10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-muted-foreground tracking-widest border border-white/10">
                                                Upload
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-sm font-medium opacity-50 px-2 mt-2">
                                        Must be a direct link to your official license or organizational ID.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-xl font-black font-outfit uppercase tracking-tighter shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02]">
                            {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-2 h-6 w-6" />}
                            Submit Application
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="p-8 md:p-12 pt-0 flex items-center justify-center opacity-40">
                <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Secure End-to-End Verification
                </p>
            </CardFooter>
        </Card>
    );
}
