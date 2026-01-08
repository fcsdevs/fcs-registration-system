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
    Loader2,
    Filter,
    ArrowRight
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
            const response = await eventsApi.list({ limit: 100, isPublished: true });

            let allEvents: any[] = [];

            // Robust data extraction
            if (Array.isArray(response.data)) {
                allEvents = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                allEvents = response.data.data;
            } else if (Array.isArray(response as any)) {
                allEvents = response as any;
            } else if ((response as any).data && Array.isArray((response as any).data)) {
                allEvents = (response as any).data;
            }

            if (allEvents.length > 0) {
                setEvents(allEvents);
                setSelectedEventId(allEvents[0].id);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const fetchTrayData = async () => {
        if (!selectedEventId || !user) return;

        try {
            setStatsLoading(true);

            const statsResponse = await registrationsApi.getStats({
                eventId: selectedEventId
            });

            if (statsResponse.data) {
                setStats(statsResponse.data.data);
            }

            const registrationsResponse = await registrationsApi.list({
                page: pagination.page,
                limit: pagination.limit,
                eventId: selectedEventId,
                registeredBy: user.id,
                search: searchTerm
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

    if (loading && !selectedEventId) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#060CCD] mx-auto mb-4" />
                    <p className="text-[#475569] font-medium animate-pulse">Initializing Registrar Tray...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Glossy Header Area */}
            <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 text-[#060CCD] mb-1">
                                <Filter size={14} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Registrar Portal</span>
                            </div>
                            <h1 className="text-3xl font-black text-[#0F172A] leading-none">Registration Tray</h1>
                            <p className="text-sm text-[#64748B] mt-2 font-medium">
                                Welcome back, <span className="text-[#060CCD] font-bold">{user?.firstName}</span>
                            </p>
                        </div>

                        {/* Event Selector - Desktop */}
                        <div className="flex items-center gap-4 animate-fade-in animation-delay-200">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Active Event Session</span>
                                <div className="flex items-center gap-3 bg-[#F1F5F9] px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-[#060CCD] transition-all">
                                    <Calendar className="w-4 h-4 text-[#475569]" />
                                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                        <SelectTrigger className="w-[220px] border-none bg-transparent shadow-none focus:ring-0 p-0 h-auto text-sm font-bold text-[#0F172A]">
                                            <SelectValue placeholder="Select Event" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#E2E8F0] shadow-2xl">
                                            {events.map(event => (
                                                <SelectItem key={event.id} value={event.id} className="rounded-xl font-medium">
                                                    {event.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Mobile Event Select Only */}
                            <div className="sm:hidden flex flex-col gap-1 w-full">
                                <label className="text-[10px] font-bold text-[#94A3B8] uppercase">Current Event</label>
                                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                    <SelectTrigger className="w-full bg-[#F1F5F9] border-none rounded-2xl py-6 font-bold text-[#0F172A]">
                                        <SelectValue placeholder="Select Event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map(event => (
                                            <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                {/* Stats Cards - Modernized */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    {/* Primary Stat: My Contributions */}
                    <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-[#060CCD] to-[#010030] p-8 text-white group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <UserPlus className="w-32 h-32 transform translate-x-8 -translate-y-8" />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md mb-6 border border-white/10">
                                <UserPlus size={14} className="text-[#3B82F6]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">My Contributions</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <h3 className="text-5xl font-black tabular-nums">{stats?.registeredByMe || 0}</h3>
                                <div className="h-10 w-[2px] bg-white/20" />
                                <div>
                                    <p className="text-xs font-bold text-white/60 uppercase">Registrations</p>
                                    <p className="text-[10px] text-blue-300 font-medium">Managed by you</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Secondary Stat: Center Total */}
                    <Card className="relative overflow-hidden border border-[#E2E8F0] shadow-xl bg-white p-8 group hover:border-[#10B981] transition-colors">
                        <div className="inline-flex items-center gap-2 bg-[#E8F5F1] px-3 py-1 rounded-full mb-6 text-[#10B981]">
                            <Users size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Center Impact</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-4xl font-black text-[#0F172A] tabular-nums">{stats?.centerStats?.totalRegistered || 0}</h3>
                                <p className="text-xs font-bold text-[#64748B] uppercase mt-1">Total Members Registered</p>
                            </div>
                            <div className="h-12 w-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-all">
                                <Users size={24} />
                            </div>
                        </div>
                    </Card>

                    {/* Tertiary Stat: Checked In */}
                    <Card className="relative overflow-hidden border border-[#E2E8F0] shadow-xl bg-white p-8 group hover:border-[#8B5CF6] transition-colors sm:col-span-2 lg:col-span-1">
                        <div className="inline-flex items-center gap-2 bg-[#F5F3FF] px-3 py-1 rounded-full mb-6 text-[#8B5CF6]">
                            <UserCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Physical Presence</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-4xl font-black text-[#0F172A] tabular-nums">{stats?.centerStats?.totalCheckedIn || 0}</h3>
                                <p className="text-xs font-bold text-[#64748B] uppercase mt-1">Members Checked-In</p>
                            </div>
                            <div className="h-12 w-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all">
                                <UserCheck size={24} />
                            </div>
                        </div>
                        <div className="mt-6 h-1 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#8B5CF6] transition-all duration-1000"
                                style={{ width: `${stats?.centerStats?.totalRegistered ? (stats.centerStats.totalCheckedIn / stats.centerStats.totalRegistered) * 100 : 0}%` }}
                            />
                        </div>
                    </Card>
                </div>

                {/* Search and Filters Area */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in animation-delay-400">
                    <div className="relative w-full sm:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                        <Input
                            placeholder="Search by name, FCS code, or center..."
                            className="bg-white border-[#E2E8F0] pl-12 py-6 rounded-2xl shadow-sm focus:ring-[#060CCD] transition-all font-medium text-[#475569]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none py-6 rounded-2xl border-[#E2E8F0] hover:bg-[#F8FAFC] font-bold text-[#475569] gap-2"
                            onClick={() => fetchTrayData()}
                        >
                            <RefreshCcw size={18} className={statsLoading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh Data</span>
                        </Button>
                        <Button className="flex-1 sm:flex-none py-6 px-8 rounded-2xl bg-[#060CCD] hover:bg-[#010030] font-bold text-white shadow-xl shadow-blue-200 gap-2">
                            <Download size={18} />
                            Export Tray
                        </Button>
                    </div>
                </div>

                {/* List Container */}
                <Card className="border-[#E2E8F0] shadow-2xl rounded-[32px] overflow-hidden bg-white animate-slide-up animation-delay-500">
                    <div className="p-6 sm:p-8 border-b border-[#F1F5F9] flex items-center justify-between">
                        <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Recent Registrations</h2>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] rounded-full text-[10px] font-bold text-[#64748B] uppercase">
                            <Users size={12} />
                            {pagination.total} Records
                        </div>
                    </div>

                    {/* Table View - Hidden on Mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#F8FAFC]">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="font-bold text-[#1e293b] py-6 px-8">Member Information</TableHead>
                                    <TableHead className="font-bold text-[#1e293b]">FCS Identity</TableHead>
                                    <TableHead className="font-bold text-[#1e293b]">Participation</TableHead>
                                    <TableHead className="font-bold text-[#1e293b]">Current Status</TableHead>
                                    <TableHead className="text-right font-bold text-[#1e293b] px-8">Center Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading || statsLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-[#F8FAFC]">
                                            <TableCell className="px-8 py-6"><div className="h-10 w-48 bg-[#F1F5F9] rounded-2xl animate-pulse" /></TableCell>
                                            <TableCell><div className="h-6 w-24 bg-[#F1F5F9] rounded-xl animate-pulse" /></TableCell>
                                            <TableCell><div className="h-6 w-32 bg-[#F1F5F9] rounded-xl animate-pulse" /></TableCell>
                                            <TableCell><div className="h-8 w-24 bg-[#F1F5F9] rounded-full animate-pulse" /></TableCell>
                                            <TableCell className="px-8"><div className="h-6 w-32 bg-[#F1F5F9] rounded-xl animate-pulse ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : registrations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 text-[#94A3B8]">
                                                <Search size={48} className="opacity-20" />
                                                <p className="text-sm font-bold uppercase tracking-widest">No matching records found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registrations.map((reg) => (
                                        <TableRow key={reg.id} className="hover:bg-[#F8FAFC]/50 transition-colors border-none group cursor-pointer">
                                            <TableCell className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#F1F5F9] to-white border border-[#E2E8F0] flex items-center justify-center font-black text-[#060CCD]">
                                                        {reg.member?.firstName?.[0]}{reg.member?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-[#0F172A] group-hover:text-[#060CCD] transition-colors uppercase text-sm">
                                                            {reg.member?.firstName} {reg.member?.lastName}
                                                        </div>
                                                        <div className="text-xs text-[#64748B] font-medium">{reg.member?.email || 'System Member'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-[11px] font-black text-[#64748B] bg-[#F1F5F9] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
                                                    {reg.member?.fcsCode || 'PENDING'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-[#475569]">
                                                        <MapPin size={12} className="text-[#3B82F6]" />
                                                        {reg.participation?.participationMode || 'ONSITE'}
                                                    </div>
                                                    <div className="text-[10px] text-[#94A3B8] font-medium">
                                                        {reg.registrationDate ? format(new Date(reg.registrationDate), "MMM d, hh:mm a") : 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`rounded-full px-4 py-1 text-[10px] font-black border-none uppercase tracking-widest ${reg.status === 'CONFIRMED' ? 'bg-[#E8F5F1] text-[#10B981]' :
                                                            reg.status === 'CHECKED_IN' || reg.status === 'ATTENDED' ? 'bg-[#F5F3FF] text-[#8B5CF6]' :
                                                                reg.status === 'CANCELLED' ? 'bg-[#FEF2F2] text-[#EF4444]' :
                                                                    'bg-[#F1F5F9] text-[#64748B]'
                                                        }`}
                                                >
                                                    {reg.status === 'CHECKED_IN' ? 'Verified' : reg.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <div className="flex items-center justify-end gap-2 text-[#475569] font-bold text-sm">
                                                    <span>{reg.participation?.center?.centerName || 'Main Campus'}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View - Card based list */}
                    <div className="md:hidden space-y-px bg-[#F1F5F9]">
                        {registrations.length === 0 && !loading ? (
                            <div className="bg-white p-20 text-center text-[#94A3B8] flex flex-col items-center gap-4">
                                <Search size={40} className="opacity-10" />
                                <span className="text-xs font-black uppercase tracking-widest">No Records</span>
                            </div>
                        ) : registrations.map((reg) => (
                            <div key={reg.id} className="bg-white p-6 active:bg-[#F8FAFC] transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center font-black text-[#060CCD] text-sm">
                                            {reg.member?.firstName?.[0]}{reg.member?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#0F172A] uppercase text-xs">
                                                {reg.member?.firstName} {reg.member?.lastName}
                                            </h4>
                                            <p className="text-[10px] font-mono text-[#64748B] mt-1">{reg.member?.fcsCode}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        className={`rounded-full px-3 py-1 text-[9px] font-black uppercase border-none ${reg.status === 'CONFIRMED' ? 'bg-[#E8F5F1] text-[#10B981]' :
                                                reg.status === 'CHECKED_IN' || reg.status === 'ATTENDED' ? 'bg-[#F5F3FF] text-[#8B5CF6]' :
                                                    'bg-[#F1F5F9] text-[#64748B]'
                                            }`}
                                    >
                                        {reg.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F8FAFC]">
                                    <div>
                                        <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Center</p>
                                        <p className="text-[11px] font-bold text-[#475569] truncate">{reg.participation?.center?.centerName || 'Main'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Participation</p>
                                        <p className="text-[11px] font-bold text-[#475569]">{reg.participation?.participationMode || 'ONSITE'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination - Modernized */}
                    <div className="p-6 sm:p-8 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#F8FAFC]/50">
                        <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">
                            Showing <span className="text-[#060CCD] px-1">{registrations.length}</span> of <span className="text-[#0F172A] px-1">{pagination.total}</span> records
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="h-12 w-12 rounded-2xl border-[#E2E8F0] bg-white text-[#475569] hover:bg-white hover:text-[#060CCD] p-0"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(pagination.pages, 3) }).map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pagination.page === pageNum ? "default" : "ghost"}
                                            className={`h-12 w-12 rounded-2xl text-xs font-black transition-all ${pagination.page === pageNum
                                                    ? "bg-[#060CCD] text-white shadow-lg shadow-blue-200"
                                                    : "text-[#64748B] hover:bg-white"
                                                }`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                {pagination.pages > 3 && <span className="px-2 text-[#CBD5E1]">•••</span>}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="h-12 w-12 rounded-2xl border-[#E2E8F0] bg-white text-[#475569] hover:bg-white hover:text-[#060CCD] p-0"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
