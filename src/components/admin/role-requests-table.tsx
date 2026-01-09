
"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ExternalLink, ShieldCheck, User as UserIcon, Calendar, FileText, X, Check, AlertTriangle, Truck, GraduationCap, Warehouse } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export function RoleRequestsTable() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/role-requests");
            if (res.ok) {
                const data = await res.json();
                setRequests(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            toast({ title: "Error", description: "Failed to fetch pending requests", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (action: "approve" | "reject") => {
        if (!selectedRequest) return;

        setProcessingId(selectedRequest.id);
        try {
            const res = await fetch("/api/admin/role-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId: selectedRequest.id,
                    action: action,
                    rejectionReason: action === 'reject' ? notes : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to process request");
            }

            toast({
                title: action === 'approve' ? "Role Elevated" : "Request Rejected",
                description: `The user has been notified and their status updated.`,
            });

            fetchRequests();
            setIsOpen(false);
            setNotes("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                <p className="text-sm font-black uppercase tracking-widest opacity-40">Loading KYC Data...</p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black font-outfit uppercase tracking-tight">Zero Pending Tasks</h3>
                    <p className="text-lg font-medium opacity-60">All professional verification requests have been processed.</p>
                </div>
            </Card>
        );
    }

    const getRoleIcon = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'transporter': return <Truck className="h-4 w-4" />;
            case 'educator': return <GraduationCap className="h-4 w-4" />;
            case 'storage_provider': return <Warehouse className="h-4 w-4" />;
            default: return <ShieldCheck className="h-4 w-4" />;
        }
    };

    const parseDocs = (docs: any) => {
        if (!docs) return [];
        try {
            return typeof docs === 'string' ? JSON.parse(docs) : docs;
        } catch {
            return [];
        }
    };

    return (
        <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-10 border-b border-white/5 bg-gradient-to-br from-indigo-600/5 to-transparent">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-black font-outfit uppercase tracking-tight">Verification Queue</CardTitle>
                        <CardDescription className="text-lg font-medium opacity-60">Audit and approve professional credentials for the Azmera ecosystem.</CardDescription>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
                        {requests.length} Pending Actions
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-b border-white/5 hover:bg-transparent">
                            <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Professional User</TableHead>
                            <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Status</TableHead>
                            <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Requested Role</TableHead>
                            <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity Reference</TableHead>
                            <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submission Date</TableHead>
                            <TableHead className="pr-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <TableCell className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center font-black text-indigo-500 shadow-inner">
                                            {req.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black font-outfit uppercase tracking-tight text-lg">{req.name}</div>
                                            <div className="text-sm font-medium opacity-40">{req.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="rounded-lg font-black uppercase text-[9px] tracking-widest opacity-60">
                                        {req.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center gap-2 w-fit">
                                        {getRoleIcon(req.requestedRole)}
                                        {req.requestedRole}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="font-mono text-sm font-bold opacity-60">{req.licenseNumber || "N/A"}</div>
                                </TableCell>
                                <TableCell className="text-sm font-bold opacity-40">
                                    {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="pr-10 text-right">
                                    <Sheet open={isOpen && selectedRequest?.id === req.id} onOpenChange={(open) => {
                                        setIsOpen(open);
                                        if (open) setSelectedRequest(req);
                                    }}>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" className="rounded-xl glass border-white/10 font-black uppercase tracking-widest text-[9px] h-10 px-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                Audit Request
                                                <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent className="w-[400px] sm:w-[540px] bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-l border-white/10 p-0 overflow-hidden flex flex-col">
                                            <div className="p-10 space-y-8 flex-1 overflow-y-auto">
                                                <SheetHeader className="space-y-4">
                                                    <Badge className="w-fit bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[9px]">
                                                        Pending Professional Audit
                                                    </Badge>
                                                    <SheetTitle className="text-4xl font-black font-outfit uppercase tracking-tight leading-none">
                                                        Elevate to <span className="text-indigo-600">{req.requestedRole}</span>
                                                    </SheetTitle>
                                                    <SheetDescription className="text-base font-medium opacity-60">
                                                        Review credentials for <strong>{req.name}</strong> to ensure compliance with Azmera professional standards.
                                                    </SheetDescription>
                                                </SheetHeader>

                                                <Separator className="bg-black/5 dark:bg-white/5" />

                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Professional Dossier</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Card className="bg-black/5 border-none p-4 rounded-2xl flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                                <UserIcon className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase opacity-40">Identity Ref</p>
                                                                <p className="text-sm font-bold">{req.licenseNumber}</p>
                                                            </div>
                                                        </Card>
                                                        <Card className="bg-black/5 border-none p-4 rounded-2xl flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                                <Calendar className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase opacity-40">Applied On</p>
                                                                <p className="text-sm font-bold">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Verification Documents</h4>
                                                    <div className="space-y-3">
                                                        {parseDocs(req.documents).map((doc: any, i: number) => (
                                                            <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 rounded-2xl bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-600/10 transition-colors group/doc">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center">
                                                                        <FileText className="h-5 w-5 text-indigo-600" />
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-sm font-black uppercase tracking-tight">{doc.type || 'License Document'}</p>
                                                                        <p className="text-[10px] font-bold opacity-40">Verified via SSL Cloud Storage</p>
                                                                    </div>
                                                                </div>
                                                                <ExternalLink className="h-4 w-4 opacity-20 group-hover/doc:opacity-100 transition-opacity" />
                                                            </a>
                                                        ))}
                                                        {(!req.documents || parseDocs(req.documents).length === 0) && (
                                                            <div className="p-10 rounded-2xl bg-rose-500/5 border border-dashed border-rose-500/20 flex flex-col items-center justify-center text-center space-y-3 text-rose-600">
                                                                <AlertTriangle className="h-8 w-8" />
                                                                <p className="text-xs font-bold uppercase tracking-widest opacity-60">No supporting documents found</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Administrative Notes</h4>
                                                    <Textarea
                                                        placeholder="Add audit notes or rejection reasons here..."
                                                        className="min-h-[120px] rounded-2xl bg-black/5 border-none p-6 font-medium focus:ring-2 focus:ring-indigo-600 transition-all shadow-inner"
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <SheetFooter className="p-10 bg-black/5 border-t border-black/5 gap-4 sm:flex-row flex-col">
                                                <Button
                                                    variant="outline"
                                                    disabled={processingId === req.id || !notes}
                                                    onClick={() => handleAction('reject')}
                                                    className="flex-1 h-14 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px]"
                                                >
                                                    <X className="mr-2 h-4 w-4" /> Reject Request
                                                </Button>
                                                <Button
                                                    disabled={processingId === req.id}
                                                    onClick={() => handleAction('approve')}
                                                    className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 font-black uppercase tracking-widest text-[10px]"
                                                >
                                                    <Check className="mr-2 h-4 w-4" /> Approve Elevation
                                                </Button>
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
