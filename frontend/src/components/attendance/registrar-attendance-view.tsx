"use client";

import { useState, useEffect, useRef } from "react";
import {
    Scan,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    Database,
    Hash,
    RefreshCw,
    Maximize2,
    Minimize2,
    Camera,
    Calendar,
    User,
    AlertCircle,
    ArrowRight,
    MapPin,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { registrationsApi } from "@/lib/api/registrations";
import { attendanceApi } from "@/lib/api/attendance";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eventsApi } from "@/lib/api/events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Script from "next/script";
import { format } from "date-fns";

interface RegistrarAttendanceViewProps {
    onEventChange?: (eventId: string) => void;
}

export function RegistrarAttendanceView({ onEventChange }: RegistrarAttendanceViewProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [inputValue, setInputValue] = useState("");
    const [processing, setProcessing] = useState(false);
    const [lastCheckIn, setLastCheckIn] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<{ title: string, detail: string, type: 'not_found' | 'wrong_event' | 'generic' } | null>(null);
    const [kioskMode, setKioskMode] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<any>(null);
    const [scannerReady, setScannerReady] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        fetchEvents();

        // Handle full screen toggle for Kiosk
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setKioskMode(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            if (scannerRef.current) {
                const scanner = scannerRef.current;
                try {
                    if (scanner.stop) scanner.stop().catch(() => { });
                    else if (scanner.clear) scanner.clear().catch(() => { });
                } catch (e) { }
            }
        };
    }, []);

    // Auto-focus logic
    useEffect(() => {
        if (selectedEventId && !processing) {
            const timer = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [selectedEventId, processing, lastCheckIn, errorMsg]);

    const fetchEvents = async () => {
        try {
            setEventsLoading(true);
            const response = await eventsApi.list({ limit: 50, isPublished: true });
            let allEvents: any[] = [];
            if (Array.isArray(response.data)) allEvents = response.data;
            else if (response.data?.data) allEvents = response.data.data;
            setEvents(allEvents);
        } catch (error) {
            toast.error("Failed to load events");
        } finally {
            setEventsLoading(false);
        }
    };

    const handleEventChange = (value: string) => {
        setSelectedEventId(value);
        setLastCheckIn(null);
        setErrorMsg(null);
        setInputValue("");
        if (onEventChange) onEventChange(value);
    };

    const toggleKioskMode = () => {
        if (!kioskMode) {
            setKioskMode(true);
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            setKioskMode(false);
            document.exitFullscreen().catch(() => { });
        }
    };

    const handleCheckIn = async (code: string, method: 'QR' | 'SAC' | 'MANUAL' | 'KIOSK') => {
        if (!code || !selectedEventId) return;

        setProcessing(true);
        setErrorMsg(null);
        setLastCheckIn(null);

        try {
            // Intelligent Lookup Phase
            // 1. Search for this code in the CURRENT event context first
            let response = await registrationsApi.list({
                eventId: selectedEventId,
                search: code,
                limit: 1
            });

            let matchedReg = response.data?.data?.[0] || (response.data as any)?.[0];

            // 2. Conflict Analysis Strategy
            if (!matchedReg) {
                // If not found in current event, let's see if they are registered AT ALL globally
                // This helps solve "Where is my registration?" confusion
                const globalSearch = await registrationsApi.list({
                    search: code,
                    limit: 1
                });

                const globalReg = globalSearch.data?.data?.[0] || (globalSearch.data as any)?.[0];

                if (globalReg) {
                    // FOUND GLOABLLY but not for this event!
                    const eventTitle = globalReg.event?.title || "another session";
                    setErrorMsg({
                        type: 'wrong_event',
                        title: "Mismatched Session",
                        detail: `Member is registered for "${eventTitle}", not this event.`
                    });
                    return;
                } else {
                    // Not found anywhere
                    setErrorMsg({
                        type: 'not_found',
                        title: "Record Not Found",
                        detail: "No registration found with this identification code."
                    });
                    return;
                }
            }

            // 3. Status Handling & Attendance Marking
            if (matchedReg.status === "CHECKED_IN" || matchedReg.status === "ATTENDED") {
                setLastCheckIn({ ...matchedReg, alreadyCheckedIn: true });
            } else {
                await attendanceApi.checkIn({
                    eventId: selectedEventId,
                    registrationId: matchedReg.id,
                    checkInMethod: method,
                    centerId: matchedReg.participation?.centerId || undefined
                });
                setLastCheckIn({ ...matchedReg, status: 'CHECKED_IN' });
                toast.success(`${matchedReg.member?.firstName} Verified!`);
            }
        } catch (err: any) {
            setErrorMsg({
                type: 'generic',
                title: "Processing Error",
                detail: err.message || "Something went wrong while verifying this badge."
            });
        } finally {
            setProcessing(false);
        }
    };

    const processingRef = useRef(false);
    useEffect(() => { processingRef.current = processing; }, [processing]);

    const onScanSuccess = async (decodedText: string) => {
        if (processingRef.current) return;

        // Filter out UI noise that scanners might pick up
        if (decodedText.length < 5) return;

        try {
            processingRef.current = true;
            if (scannerRef.current?.pause) scannerRef.current.pause(true);
            await handleCheckIn(decodedText, 'QR');
        } catch (error) {
            toast.error("Scan verification failed");
        } finally {
            setTimeout(() => {
                if (scannerRef.current?.resume) scannerRef.current.resume();
                processingRef.current = false;
            }, 1500);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.stop) await scannerRef.current.stop();
                else if (scannerRef.current.clear) await scannerRef.current.clear();
            } catch (e) { }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const startScanner = async () => {
        if (!scannerReady || !selectedEventId || !(window as any).Html5Qrcode) return;
        await stopScanner();
        const element = document.getElementById("reader");
        if (element) element.innerHTML = "";
        try {
            const html5QrCode = new (window as any).Html5Qrcode("reader");
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 20, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 },
                onScanSuccess,
                () => { }
            );
            scannerRef.current = html5QrCode;
            setIsScanning(true);
        } catch (e) {
            toast.error("Camera access denied");
        }
    };

    return (
        <div className={`flex flex-col min-h-screen bg-[#F8FAFC] ${kioskMode ? 'fixed inset-0 z-[100] p-0 overflow-hidden' : ''}`}>
            <Script
                src="https://unpkg.com/html5-qrcode"
                strategy="lazyOnload"
                onLoad={() => setScannerReady(true)}
            />

            {/* Premium Header Container */}
            <div className={`bg-white border-b border-[#E2E8F0] shadow-sm ${kioskMode ? 'p-6' : 'p-6'}`}>
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#060CCD] to-[#010030] rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Kiosk Admission</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.1em]">System Live</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex-1 min-w-[200px] transition-all ${!selectedEventId ? 'ring-2 ring-amber-400 ring-offset-2 rounded-2xl' : ''}`}>
                            <Select value={selectedEventId} onValueChange={handleEventChange}>
                                <SelectTrigger className="h-14 border-none bg-[#F1F5F9] rounded-2xl px-6 font-bold text-[#0F172A] shadow-inner">
                                    <SelectValue placeholder="📅 Select Global Event" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-[#E2E8F0] shadow-2xl">
                                    {events.map((e) => (
                                        <SelectItem key={e.id} value={e.id} className="rounded-xl font-medium focus:bg-[#F1F5F9]">
                                            {e.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" className="h-14 w-14 rounded-2xl border-[#E2E8F0] bg-white text-[#475569] shadow-sm hover:scale-105 transition-transform" onClick={toggleKioskMode}>
                            {kioskMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                        </Button>
                    </div>
                </div>
            </div>

            <div className={`flex-1 flex flex-col items-center justify-center transition-all ${kioskMode ? 'p-12' : 'p-6'}`}>
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Main Interaction Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <Tabs defaultValue="manual" className="w-full" onValueChange={(v) => { if (v !== 'camera') stopScanner(); }}>
                            <div className="flex justify-center mb-8">
                                <TabsList className="bg-[#F1F5F9] p-1.5 rounded-[20px] h-auto">
                                    <TabsTrigger value="manual" className="rounded-2xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-[#060CCD] data-[state=active]:text-white shadow-none transition-all">
                                        <Hash size={14} className="mr-2" /> Manual Scan
                                    </TabsTrigger>
                                    <TabsTrigger value="camera" className="rounded-2xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-[#060CCD] data-[state=active]:text-white shadow-none transition-all">
                                        <Camera size={14} className="mr-2" /> Live Vision
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="manual" className="mt-0 focus-visible:outline-none">
                                <Card className="p-10 rounded-[40px] border-[#E2E8F0] shadow-2xl bg-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-focus-within:opacity-10 transition-opacity">
                                        <Scan size={120} className="text-[#060CCD]" />
                                    </div>

                                    <div className="relative z-10 w-full text-center space-y-8">
                                        <div>
                                            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Identification Input</h2>
                                            <p className="text-sm text-[#94A3B8] font-medium">Input FCS Code or full name from badge</p>
                                        </div>

                                        <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(inputValue.trim(), kioskMode ? 'KIOSK' : 'MANUAL'); setInputValue(""); }} className="space-y-4">
                                            <div className="relative">
                                                <Input
                                                    ref={inputRef}
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="h-24 text-4xl text-center font-black tracking-tighter rounded-3xl border-[#E2E8F0] bg-[#F8FAFC] focus:ring-4 focus:ring-[#060CCD]/10 transition-all uppercase placeholder:text-[#CBD5E1]"
                                                    placeholder="-- -- -- --"
                                                    disabled={processing || !selectedEventId}
                                                    autoComplete="off"
                                                />
                                                {processing && (
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                        <Loader2 className="h-8 w-8 text-[#060CCD] animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processing || !selectedEventId || !inputValue}
                                                className="w-full h-20 rounded-3xl bg-[#060CCD] hover:bg-[#010030] text-xl font-black uppercase tracking-widest shadow-xl shadow-blue-200"
                                            >
                                                Confirm Attendance
                                            </Button>
                                        </form>

                                        {!selectedEventId && (
                                            <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 animate-pulse">
                                                <AlertCircle size={16} className="text-amber-600" />
                                                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Please Select Event Session Above</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="camera" className="mt-0 focus-visible:outline-none">
                                <Card className="p-6 rounded-[40px] border-[#E2E8F0] shadow-2xl bg-black relative overflow-hidden h-[450px]">
                                    <div id="reader" className="w-full h-full object-cover rounded-3xl overflow-hidden opacity-90"></div>
                                    {!isScanning && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 text-white p-8 text-center">
                                            <Camera size={64} className="mb-4 opacity-50" />
                                            <h3 className="text-xl font-black uppercase mb-2">Live Camera Vision</h3>
                                            <p className="text-gray-400 text-sm mb-8">Access system camera to scan member QR codes</p>
                                            <Button onClick={startScanner} className="h-16 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200">
                                                Activate Vision
                                            </Button>
                                        </div>
                                    )}
                                    {isScanning && (
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                                            <Button onClick={() => stopScanner()} variant="destructive" className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest">
                                                Power Off
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Results & Feedback Area */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 space-y-6">
                            {lastCheckIn ? (
                                <Card className={`p-8 rounded-[40px] border-none shadow-2xl animate-in zoom-in duration-500 overflow-hidden relative ${lastCheckIn.alreadyCheckedIn ? 'bg-amber-100' : 'bg-[#E8F5F1]'
                                    }`}>
                                    {/* Background Icon */}
                                    <div className="absolute -bottom-6 -right-6 opacity-10">
                                        <CheckCircle2 size={120} className={lastCheckIn.alreadyCheckedIn ? 'text-amber-600' : 'text-[#10B981]'} />
                                    </div>

                                    <div className="relative z-10 text-center">
                                        <div className={`h-20 w-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${lastCheckIn.alreadyCheckedIn ? 'bg-amber-400 text-white' : 'bg-[#10B981] text-white'
                                            }`}>
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${lastCheckIn.alreadyCheckedIn ? 'text-amber-800' : 'text-[#1F7A63]'
                                            }`}>
                                            {lastCheckIn.alreadyCheckedIn ? 'Duplicate Access' : 'Checked In Successfully'}
                                        </h3>
                                        <div className="h-px w-12 bg-black/10 mx-auto mb-6" />

                                        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 text-left border border-white/50">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="h-12 w-12 bg-[#060CCD] rounded-2xl flex items-center justify-center text-white font-black select-none">
                                                    {lastCheckIn.member?.firstName?.[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-[#0F172A] uppercase truncate text-sm">
                                                        {lastCheckIn.member?.firstName} {lastCheckIn.member?.lastName}
                                                    </p>
                                                    <Badge variant="outline" className="mt-1 font-mono text-[10px] bg-white border-blue-100 text-[#060CCD]">
                                                        {lastCheckIn.member?.fcsCode}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                                                    <MapPin size={12} className="text-[#060CCD]" />
                                                    {lastCheckIn.participation?.center?.centerName || 'Main Campus'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                                                    <ArrowRight size={12} className="text-[#060CCD]" />
                                                    {lastCheckIn.participation?.participationMode || 'ONSITE'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : errorMsg ? (
                                <Card className={`p-8 rounded-[40px] border-none shadow-2xl animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative ${errorMsg.type === 'wrong_event' ? 'bg-amber-100' : 'bg-red-50'
                                    }`}>
                                    <div className="absolute -bottom-6 -right-6 opacity-10">
                                        <XCircle size={120} className={errorMsg.type === 'wrong_event' ? 'text-amber-600' : 'text-red-600'} />
                                    </div>
                                    <div className="relative z-10 text-center">
                                        <div className={`h-20 w-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${errorMsg.type === 'wrong_event' ? 'bg-amber-400 text-white' : 'bg-red-500 text-white'
                                            }`}>
                                            <AlertCircle size={40} />
                                        </div>
                                        <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${errorMsg.type === 'wrong_event' ? 'text-amber-800' : 'text-red-800'
                                            }`}>
                                            {errorMsg.title}
                                        </h3>
                                        <p className={`text-sm font-bold ${errorMsg.type === 'wrong_event' ? 'text-amber-700/80' : 'text-red-700/80'
                                            }`}>
                                            {errorMsg.detail}
                                        </p>

                                        {errorMsg.type === 'wrong_event' && (
                                            <div className="mt-8 p-4 bg-white/50 rounded-2xl text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                                                <RefreshCw size={14} />
                                                Switch event context to verify
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-8 rounded-[40px] border-dashed border-2 border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center text-center space-y-4 bg-[#F8FAFC]">
                                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg">
                                        <Database size={32} className="text-[#CBD5E1]" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[#0F172A] uppercase text-xs tracking-widest">Awaiting Identity</h4>
                                        <p className="text-[10px] text-[#94A3B8] font-bold mt-1 uppercase">Ready for scanner input...</p>
                                    </div>
                                    <div className="pt-6 w-full space-y-2">
                                        <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#060CCD] w-1/3 animate-[loading_2s_infinite]" />
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    );
}
