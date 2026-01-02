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
    const [activeTab, setActiveTab] = useState("my-registrations");
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
                // If the user has a centerId, we filter by it. 
                // Note: user object might not have centerId directly if not updated in context, 
                // but usually registrars are scoped.
                // If no centerId is passed, backend might return all or scoped based on token.
                // We'll leave it open mostly, or rely on backend defaults.
                if ((user as any).centerId) {
                    params.centerId = (user as any).centerId;
                }
            }

            const response = await registrationsApi.list(params);

            if (response.data && response.data.data) {
                setRegistrations(response.data.data);
                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.pagination.total,
                        pages: response.data.pagination.pages
                    }));
                } else if ((response.data as any).meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: (response.data as any).meta.total,
                        pages: (response.data as any).meta.pages
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

    const handlePrint = (registration: any) => {
        // Placeholder for print functionality
        // In a real app, this would open a PDF or a print window
        toast.success(`Scanning/Printing tag for ${registration.member?.firstName}...`);
        console.log("Printing tag for:", registration);
    };

    const handleExport = async () => {
        toast("Exporting data...", { icon: "📥" });
        // Implement export logic here if API supports it
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Print Tags</h1>

            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                    <div className="relative flex-1 max-w-sm w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search user by name, email, phone..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" onClick={() => fetchRegistrations()}>
                            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Export Bulk
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                        <TabsTrigger value="my-registrations">Registered by Me</TabsTrigger>
                        <TabsTrigger value="center-registrations">Center Registrations</TabsTrigger>
                    </TabsList>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>FCS Code</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
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
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="text-xs text-gray-500 mr-4">
                            Page {pagination.page} of {pagination.pages || 1}
                        </div>
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
                </Tabs>
            </Card>
        </div>
    );
}
