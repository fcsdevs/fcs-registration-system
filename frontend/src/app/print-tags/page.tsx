"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { registrationsApi } from "@/lib/api/registrations";
import { eventsApi } from "@/lib/api/events";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Printer, Download, Loader2, RefreshCcw, FileText, User, Calendar, MapPin, Tag, ArrowRight, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("all");
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
                search: search.trim(), // Use trim instead of forced upperCase to allow name search
                include: 'member,event,participation'
            };

            if (selectedEventId && selectedEventId !== "all") {
                params.eventId = selectedEventId;
            }

            if (activeTab === "my-registrations") {
                params.registeredBy = user.id;
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

    const fetchEvents = async () => {
        try {
            const response = await eventsApi.list({ limit: 100 });
            // Extract the array from PaginatedResponse<Event>
            const eventList = response.data?.data || (Array.isArray(response.data) ? response.data : []);
            setEvents(eventList);
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Debounce search or fetch on change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRegistrations();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, activeTab, pagination.page, user?.id, selectedEventId]);

    const handlePrint = async (registration: any) => {
        try {
            toast.loading("Preparing Badge...", { id: "print-toast" });
            const blob = await registrationsApi.downloadTag(registration.id);
            const url = window.URL.createObjectURL(blob);

            const win = window.open(url, '_blank');
            if (win) {
                win.focus();
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.download = `FCS-Badge-${registration.member?.firstName}.pdf`;
                a.click();
            }
            toast.success("Badge Ready!", { id: "print-toast" });
        } catch (error) {
            console.error(error);
            toast.error("Print Generation Failed", { id: "print-toast" });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Glossy Header Area */}
            <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 text-[#060CCD] mb-1">
                                <Tag size={14} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Credential Management</span>
                            </div>
                            <h1 className="text-3xl font-black text-[#0F172A] leading-none">Print Tags & Badges</h1>
                            <p className="text-sm text-[#64748B] mt-2 font-medium">Verify credentials and generate identification for attendees.</p>
                        </div>

                        <div className="flex items-center gap-3 animate-fade-in animation-delay-200">
                            <Button onClick={fetchRegistrations} variant="outline" className="h-12 w-12 rounded-2xl border-[#E2E8F0] p-0 group">
                                <RefreshCcw className={`h-5 w-5 text-[#475569] group-hover:text-[#060CCD] transition-colors ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button className="h-12 px-8 rounded-2xl bg-[#0F172A] hover:bg-black text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-slate-200 gap-2">
                                <Download size={18} />
                                Multi Export
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                {/* Search Bar & Event Filter - Modernized */}
                <div className="flex flex-col lg:flex-row gap-4 items-stretch animate-slide-up">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                        <Input
                            placeholder="Scan or Search by Name / FCS Code..."
                            className="h-16 pl-14 pr-6 bg-white border-[#E2E8F0] rounded-[24px] shadow-sm text-lg font-medium placeholder:text-[#94A3B8] focus:ring-[#060CCD] transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Badge className="bg-[#E8F5F1] text-[#10B981] border-none font-black text-[10px] py-1 px-3 rounded-full">READY</Badge>
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-[350px]">
                        <div className="relative h-full">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8] z-10 pointer-events-none" />
                            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                <SelectTrigger className="h-16 pl-14 rounded-[24px] bg-white border-[#E2E8F0] shadow-sm text-left font-bold text-[#0F172A]">
                                    <SelectValue placeholder="Select Event Session" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#E2E8F0] shadow-2xl">
                                    <SelectItem value="all" className="font-bold py-3">All Active Events</SelectItem>
                                    {events.map((event) => (
                                        <SelectItem key={event.id} value={event.id} className="py-3">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{event.title}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                                    {format(new Date(event.startDate), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="center-registrations" onValueChange={setActiveTab} className="w-full animate-slide-up animation-delay-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                        <TabsList className="bg-[#F1F5F9] p-1.5 rounded-2xl h-auto">
                            <TabsTrigger value="center-registrations" className="rounded-xl px-6 py-3 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-[#060CCD] data-[state=active]:shadow-sm">Center Registry</TabsTrigger>
                            <TabsTrigger value="my-registrations" className="rounded-xl px-6 py-3 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-[#060CCD] data-[state=active]:shadow-sm">Handled by Me</TabsTrigger>
                        </TabsList>

                        <div className="text-xs font-black text-[#94A3B8] uppercase tracking-widest bg-white border border-[#F1F5F9] px-4 py-2 rounded-full shadow-sm">
                            {pagination.total} Records Found
                        </div>
                    </div>

                    <Card className="border-[#E2E8F0] shadow-2xl rounded-[32px] overflow-hidden bg-white">
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-[#F8FAFC]">
                                    <TableRow className="border-none">
                                        <TableHead className="py-6 px-8 font-black text-[#1E293B] uppercase text-[11px] tracking-widest">Registrant Detail</TableHead>
                                        <TableHead className="font-black text-[#1E293B] uppercase text-[11px] tracking-widest">FCS Identity</TableHead>
                                        <TableHead className="font-black text-[#1E293B] uppercase text-[11px] tracking-widest">Attendance Mode</TableHead>
                                        <TableHead className="font-black text-[#1E293B] uppercase text-[11px] tracking-widest">System Status</TableHead>
                                        <TableHead className="text-right px-8 font-black text-[#1E293B] uppercase text-[11px] tracking-widest">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && registrations.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className="border-none">
                                                <TableCell className="px-8 py-6"><div className="h-10 w-48 bg-[#F1F5F9] rounded-2xl animate-pulse" /></TableCell>
                                                <TableCell><div className="h-6 w-24 bg-[#F1F5F9] rounded-xl animate-pulse" /></TableCell>
                                                <TableCell><div className="h-6 w-32 bg-[#F1F5F9] rounded-xl animate-pulse" /></TableCell>
                                                <TableCell><div className="h-8 w-24 bg-[#F1F5F9] rounded-full animate-pulse" /></TableCell>
                                                <TableCell className="px-8"><div className="h-10 w-32 bg-[#F1F5F9] rounded-xl animate-pulse ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : registrations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-32 text-center text-slate-400">
                                                <Printer size={48} className="mx-auto mb-4 opacity-10" />
                                                <p className="font-bold uppercase text-xs tracking-widest">No matching records</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        registrations.map((reg) => (
                                            <TableRow key={reg.id} className="hover:bg-[#F8FAFC]/50 transition-colors border-none group">
                                                <TableCell className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        {reg.member?.profilePhotoUrl ? (
                                                            <img
                                                                src={reg.member.profilePhotoUrl}
                                                                className="h-12 w-12 rounded-2xl object-cover shadow-lg border-2 border-white"
                                                                alt="profile"
                                                                onError={(e) => {
                                                                    (e.target as any).src = 'https://ui-avatars.com/api/?name=' + reg.member?.firstName + '+' + reg.member?.lastName;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#060CCD] to-[#3B82F6] flex items-center justify-center font-black text-white shadow-lg">
                                                                {reg.member?.firstName?.[0]}{reg.member?.lastName?.[0]}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-black text-[#0F172A] group-hover:text-[#060CCD] transition-colors">{reg.member?.firstName} {reg.member?.lastName}</div>
                                                            <div className="text-xs font-medium text-[#64748B]">{reg.member?.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono font-black text-[11px] px-3 py-1.5 border-[#E2E8F0] bg-[#F1F5F9] text-[#475569] rounded-xl">
                                                        {reg.member?.fcsCode || 'PENDING'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-xs font-bold text-[#475569] flex items-center gap-1.5">
                                                            <MapPin size={12} className="text-[#060CCD]" />
                                                            {reg.participation?.participationMode || 'ONSITE'}
                                                            {reg.participation?.center?.centerName && (
                                                                <span className="text-[#94A3B8] font-medium">— {reg.participation.center.centerName}</span>
                                                            )}
                                                        </div>
                                                        {reg.groupAssignment?.group && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                                                                    {reg.groupAssignment.group.type}: {reg.groupAssignment.group.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="text-[10px] font-medium text-[#94A3B8]">{reg.event?.title}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`rounded-full px-4 py-1 text-[10px] font-black border-none uppercase tracking-widest ${reg.status === 'CONFIRMED' ? 'bg-[#E8F5F1] text-[#10B981]' :
                                                        reg.status === 'CHECKED_IN' ? 'bg-[#F5F3FF] text-[#8B5CF6]' :
                                                            'bg-[#F1F5F9] text-[#64748B]'
                                                        }`}>
                                                        {reg.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <Button onClick={() => handlePrint(reg)} className="rounded-2xl bg-[#F1F5F9] text-[#0F172A] hover:bg-[#060CCD] hover:text-white transition-all font-black text-xs px-6 py-5 gap-2 border-none shadow-none">
                                                        <Printer size={16} />
                                                        GENERATE BADGE
                                                    </Button>
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
                                <div className="bg-white p-24 text-center text-slate-400">
                                    <Printer size={40} className="mx-auto mb-4 opacity-10" />
                                    <p className="font-bold uppercase text-[10px] tracking-widest">No matching records</p>
                                </div>
                            ) : registrations.map((reg) => (
                                <div key={reg.id} className="bg-white p-6 active:bg-[#F8FAFC] transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            {reg.member?.profilePhotoUrl ? (
                                                <img
                                                    src={reg.member.profilePhotoUrl}
                                                    className="h-10 w-10 rounded-xl object-cover shadow-md"
                                                    alt="profile"
                                                    onError={(e) => {
                                                        (e.target as any).src = 'https://ui-avatars.com/api/?name=' + reg.member?.firstName + '+' + reg.member?.lastName;
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#060CCD] to-[#3B82F6] flex items-center justify-center font-black text-white text-xs">
                                                    {reg.member?.firstName?.[0]}{reg.member?.lastName?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-black text-[#0F172A] uppercase text-xs">{reg.member?.firstName} {reg.member?.lastName}</h4>
                                                <p className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded mt-1 w-fit">{reg.member?.fcsCode}</p>
                                            </div>
                                        </div>
                                        <Badge className={`rounded-full px-3 py-1 text-[9px] font-black uppercase border-none ${reg.status === 'CONFIRMED' ? 'bg-[#E8F5F1] text-[#10B981]' :
                                            reg.status === 'CHECKED_IN' ? 'bg-[#F5F3FF] text-[#8B5CF6]' :
                                                'bg-[#F1F5F9] text-[#64748B]'
                                            }`}>
                                            {reg.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-[#F8FAFC]">
                                        <div className="flex flex-col">
                                            <div className="text-[10px] font-bold text-[#64748B] uppercase flex items-center gap-1">
                                                <MapPin size={10} />
                                                {reg.participation?.participationMode || 'ONSITE'}
                                            </div>
                                            {reg.groupAssignment?.group && (
                                                <div className="text-[9px] font-black text-emerald-600 mt-0.5 uppercase">
                                                    {reg.groupAssignment.group.type}: {reg.groupAssignment.group.name}
                                                </div>
                                            )}
                                        </div>
                                        <Button onClick={() => handlePrint(reg)} size="sm" className="bg-[#060CCD] text-white rounded-xl font-bold text-[10px] px-4">
                                            PRINT BADGE
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination - Modernized */}
                        <div className="p-8 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#F8FAFC]/50">
                            <div className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                                Showing Page <span className="text-[#060CCD]">{pagination.page}</span> of {pagination.pages || 1}
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-2xl border-[#E2E8F0] bg-white font-bold text-xs"
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                    disabled={pagination.page <= 1}
                                >
                                    BACK
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-2xl border-[#E2E8F0] bg-white font-bold text-xs"
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                    disabled={pagination.page >= pagination.pages}
                                >
                                    NEXT
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Tabs>
            </div>
        </div>
    );
}
