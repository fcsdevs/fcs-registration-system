"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { registrationsApi } from "@/lib/api/registrations";
import { eventsApi } from "@/lib/api/events";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    UserCheck,
    UserPlus,
    Search,
    Download,
    RefreshCcw,
    Calendar,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function RegistrationTrayPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [stats, setStats] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch active events on mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Fetch stats and registrations when event changes
    useEffect(() => {
        if (selectedEventId) {
            fetchTrayData();
        }
    }, [selectedEventId, pagination.page, searchTerm]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await eventsApi.list({ limit: 100 });
            if (response.data && response.data.data.length > 0) {
                setEvents(response.data.data);
                // Auto select the first event
                setSelectedEventId(response.data.data[0].id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Failed to load events");
            setLoading(false);
        }
    };

    const fetchTrayData = async () => {
        if (!selectedEventId || !user) return;

        try {
            setStatsLoading(true);

            // Fetch Stats - backend will filter by user's scope
            const statsResponse = await registrationsApi.getStats({
                eventId: selectedEventId
            });

            if (statsResponse.data) {
                setStats(statsResponse.data.data);
            }

            // 2. Fetch My Registrations
            const registrationsResponse = await registrationsApi.list({
                page: pagination.page,
                limit: pagination.limit,
                eventId: selectedEventId,
                registeredBy: user.id, // Filter by ME
                search: searchTerm // For search functionality
            });

            if (registrationsResponse.data && registrationsResponse.data.data) {
                const responseData = registrationsResponse.data;
                setRegistrations(responseData.data);
                setPagination(prev => ({
                    ...prev,
                    total: responseData.pagination.total,
                    pages: responseData.pagination.pages
                }));
            }

        } catch (error) {
            console.error("Error fetching tray data:", error);
            toast.error("Failed to load registration data");
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);

    if (loading && !selectedEventId) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading Registrar Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Registration Tray</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and track your registration activities.
                    </p>
                </div>

                {/* Event Selector */}
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                        <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0 text-sm font-medium">
                            <SelectValue placeholder="Select Event" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(event => (
                                <SelectItem key={event.id} value={event.id}>
                                    {event.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Personal Registrations */}
                <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <UserPlus className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <UserPlus className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">Registered by You</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-bold">{stats?.registeredByMe || 0}</h3>
                            <span className="text-sm text-blue-200">Total</span>
                        </div>
                    </div>
                </Card>

                {/* Card 2: Center Total */}
                <Card className="relative overflow-hidden border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Center Registrations</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900">{stats?.centerStats?.totalRegistered || 0}</h3>
                            <span className="text-sm text-gray-500">Members</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Total registered under your center</p>
                    </div>
                </Card>

                {/* Card 3: Checked In */}
                <Card className="relative overflow-hidden border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 w-1 h-full bg-purple-500" />
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <UserCheck className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Confirmed Present</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900">{stats?.centerStats?.totalCheckedIn || 0}</h3>
                            <span className="text-sm text-gray-500">Verified</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Members physically confirmed at center</p>
                    </div>
                </Card>
            </div>

            {/* Registrations List */}
            <Card className="border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search records..."
                                className="pl-9 w-full sm:w-[250px] bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={() => fetchTrayData()}>
                            <RefreshCcw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="outline" size="icon">
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-600">Member</TableHead>
                                <TableHead className="font-semibold text-gray-600">FCS ID</TableHead>
                                <TableHead className="font-semibold text-gray-600">Date</TableHead>
                                <TableHead className="font-semibold text-gray-600">Mode</TableHead>
                                <TableHead className="font-semibold text-gray-600">Status</TableHead>
                                <TableHead className="text-right font-semibold text-gray-600">Center</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading || statsLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-gray-100 rounded animate-pulse ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                        No registrations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registrations.map((reg) => (
                                    <TableRow key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-gray-900">
                                                {reg.member?.firstName} {reg.member?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500">{reg.member?.email || 'No email'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {reg.member?.fcsCode || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {reg.registrationDate ? format(new Date(reg.registrationDate), "MMM d, yyyy") : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal text-xs">
                                                {reg.participation?.participationMode || 'ONLINE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`font-normal text-xs ${reg.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    reg.status === 'CHECKED_IN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        reg.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}
                                            >
                                                {reg.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-gray-600">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm">{reg.participation?.center?.centerName || 'No Center'}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium">{registrations.length}</span> of <span className="font-medium">{pagination.total}</span> records
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
                            {pagination.page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
