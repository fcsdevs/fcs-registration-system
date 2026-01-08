"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { registrationsApi } from "@/lib/api/registrations";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Printer, Download, Loader2, RefreshCcw, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function PrintTagsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("center-registrations");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    const fetchRegistrations = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Build query params based on active tab
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: search,
                include: 'member,event,participation'
            };

            if (activeTab === "my-registrations") {
                params.registeredBy = user.id;
            } else if (activeTab === "center-registrations") {
                // Rely on backend scoping
            }

            const response = await registrationsApi.list(params);

            if (response.data && response.data.data) {
                const responseData = response.data;
                setRegistrations(responseData.data);
                if (responseData.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: responseData.pagination.total,
                        pages: responseData.pagination.pages
                    }));
                } else if ((responseData as any).meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: (responseData as any).meta.total,
                        pages: (responseData as any).meta.pages
                    }));
                }
            } else {
                setRegistrations([]);
            }
        } catch (error) {
            console.error("Failed to fetch registrations", error);
            toast.error("Failed to load registrations");
        } finally {
            setLoading(false);
        }
    };

    // Debounce search or fetch on change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRegistrations();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, activeTab, pagination.page, user?.id]);

    const handlePrint = async (registration: any) => {
        try {
            toast.loading("Generating Tag...", { id: "print-toast" });
            const blob = await registrationsApi.downloadTag(registration.id);
            const url = window.URL.createObjectURL(blob);
            // Open in new tab which usually triggers browser PDF viewer with print option
            const win = window.open(url, '_blank');
            if (win) {
                win.focus();
            } else {
                // Fallback for popup blockers
                const a = document.createElement('a');
                a.href = url;
                a.download = `Tag-${registration.member?.firstName}.pdf`;
                a.click();
            }
            toast.success("Tag Generated!", { id: "print-toast" });
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate tag", { id: "print-toast" });
        }
    };

    const handleExport = async () => {
        toast("Exporting data...", { icon: "📥" });
        // Implement export logic here if API supports it
    };

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Print Tags</h1>

            <Card className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by FCS Code (e.g. FCS-123...)"
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => fetchRegistrations()} className="flex-1 sm:flex-none">
                            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button onClick={handleExport} className="flex-1 sm:flex-none">
                            <Download className="mr-2 h-4 w-4" /> Export Bulk
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="center-registrations" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-[400px] mb-4">
                        <TabsTrigger value="center-registrations">All Registrations</TabsTrigger>
                        <TabsTrigger value="my-registrations">Registered by Me</TabsTrigger>
                    </TabsList>

                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">Member</TableHead>
                                        <TableHead className="min-w-[100px]">FCS Code</TableHead>
                                        <TableHead className="min-w-[120px]">Event</TableHead>
                                        <TableHead className="min-w-[80px]">Status</TableHead>
                                        <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && registrations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ) : registrations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <Printer className="h-8 w-8 mb-2 opacity-50" />
                                                    <p>No registrations found matching your criteria.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        registrations.map((reg) => (
                                            <TableRow key={reg.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {reg.member?.firstName} {reg.member?.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{reg.member?.email}</div>
                                                    <div className="text-xs text-gray-400">{reg.member?.phoneNumber}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {reg.member?.fcsCode || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{reg.event?.title || 'Unknown Event'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {reg.registrationDate ? format(new Date(reg.registrationDate), 'MMM d, yyyy') : '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                            reg.status === 'CHECKED_IN' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' :
                                                                'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                                    }>
                                                        {reg.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="secondary" onClick={() => handlePrint(reg)}>
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        Print Tag
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Simple Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 py-4 px-2">
                            <div className="text-xs text-gray-500">
                                Page {pagination.page} of {pagination.pages || 1}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                    disabled={pagination.page <= 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                    disabled={pagination.page >= pagination.pages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </Card>
        </div>
    );
}
