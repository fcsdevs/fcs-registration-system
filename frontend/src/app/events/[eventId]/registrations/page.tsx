"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { registrationsApi } from "@/lib/api/registrations";
import { eventsApi } from "@/lib/api/events";
import { Registration, Event } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Users,
    ArrowLeft,
    Search,
    Filter,
    Download,
    Mail,
    Phone,
    User,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    MoreVertical,
    Printer,
    FileSpreadsheet,
    MapPin
} from "lucide-react";
import { ProtectedRoute } from "@/components/common/route-guards";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function EventRegistrationsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventRes, regsRes, statsRes] = await Promise.all([
                eventsApi.getById(eventId),
                registrationsApi.getByEvent(eventId, { limit: 100 }),
                registrationsApi.getStats({ eventId })
            ]);

            setEvent(eventRes.data || null);
            setRegistrations(regsRes.data?.data || []);
            setStats(statsRes.data || null);
        } catch (error) {
            console.error("Failed to fetch registrations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintTag = async (registrationId: string) => {
        try {
            const blob = await registrationsApi.downloadTag(registrationId);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Print failed:", error);
            alert("Failed to generate tag");
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const search = searchTerm.toLowerCase();
        return (
            reg.member?.firstName?.toLowerCase().includes(search) ||
            reg.member?.lastName?.toLowerCase().includes(search) ||
            reg.member?.fcsCode?.toLowerCase().includes(search) ||
            reg.member?.email?.toLowerCase().includes(search)
        );
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/events/${eventId}`)}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Event
                        </Button>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="h-8 w-8 text-emerald-600" />
                                    Attendee Roster
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    Managing {stats?.totalRegistrations || 0} registrations for {event?.title}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    <Download className="h-4 w-4 mr-2" />
                                    Bulk Tags
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard label="Total" value={stats?.totalRegistrations || 0} icon={Users} color="blue" />
                        <StatCard label="Confirmed" value={stats?.totalRegistrations || 0} icon={CheckCircle2} color="green" />
                        <StatCard label="On-site" value={stats?.registrationsByMode?.find((m: any) => m.mode === 'ONSITE')?.count || 0} icon={MapPin} color="amber" />
                        <StatCard label="Online" value={stats?.registrationsByMode?.find((m: any) => m.mode === 'ONLINE')?.count || 0} icon={Search} color="purple" />
                    </div>

                    {/* Filters & Table */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b px-6 py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name, FCS code, or email..."
                                    className="pl-10 max-w-md"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Member</TableHead>
                                    <TableHead>FCS Code</TableHead>
                                    <TableHead>Mode/Center</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRegistrations.map((reg) => (
                                    <TableRow key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                    {reg.member?.firstName?.[0]}{reg.member?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {reg.member?.firstName} {reg.member?.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                                        {reg.member?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-medium text-gray-600">
                                            {reg.member?.fcsCode}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="mb-1 block w-fit">
                                                {reg.participationMode}
                                            </Badge>
                                            <span className="text-[10px] text-gray-400">
                                                {reg.center?.centerName || 'No center assigned'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                    reg.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }>
                                                {reg.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-500">
                                            {new Date(reg.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-blue-600"
                                                    onClick={() => handlePrintTag(reg.id)}
                                                    title="Print Tag"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400"
                                                    onClick={() => router.push(`/my-events/registration/${reg.id}`)}
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRegistrations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            No registrations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-green-600 bg-green-50",
        amber: "text-amber-600 bg-amber-50",
        purple: "text-purple-600 bg-purple-50",
    };

    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-xl ${colors[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
