"use client";

import { useState, useEffect, useRef } from "react";
import {
    Scan,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    Database,
    User,
    Hash,
    RefreshCw,
    Maximize2,
    Minimize2,
    Camera
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

interface RegistrarAttendanceViewProps {
    onEventChange?: (eventId: string) => void;
}

export function RegistrarAttendanceView({ onEventChange }: RegistrarAttendanceViewProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [inputValue, setInputValue] = useState("");
    const [processing, setProcessing] = useState(false);
    const [lastCheckIn, setLastCheckIn] = useState<any>(null);
    const [errorBehavior, setErrorBehavior] = useState<"toast" | "inline">("inline");
    const [errorMsg, setErrorMsg] = useState("");
    const [kioskMode, setKioskMode] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<any>(null);
    const [scannerReady, setScannerReady] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                const scanner = scannerRef.current;
                try {
                    if (scanner.stop) {
                        scanner.stop().catch((err: any) => console.warn(err));
                    } else if (scanner.clear) {
                        scanner.clear().catch((err: any) => console.warn(err));
                    }
                } catch (e) { console.warn(e); }
            }
        };
    }, []);

    useEffect(() => {
        fetchEvents();
    }, []);

    // Keep focus on input for continuous scanning
    useEffect(() => {
        if (selectedEventId && !processing) {
            inputRef.current?.focus();
        }
    }, [selectedEventId, processing, lastCheckIn, errorMsg]);

    useEffect(() => {
        // Handle full screen toggle for Kiosk
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setKioskMode(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    const fetchEvents = async () => {
        try {
            setEventsLoading(true);
            // Fetch published events
            const response = await eventsApi.list({ limit: 50, isPublished: true });
            console.log('Events API response:', response);

            let allEvents: any[] = [];

            if (Array.isArray(response.data)) {
                allEvents = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                allEvents = response.data.data;
            } else if (Array.isArray(response as any)) {
                allEvents = response as any;
            } else if ((response as any).data && Array.isArray((response as any).data)) {
                allEvents = (response as any).data;
            }

            console.log('Parsed events:', allEvents);

            setEvents(allEvents);

            // Removed auto-select as requested
        } catch (error) {
            toast.error("Failed to load events");
            setEvents([]);
        } finally {
            setEventsLoading(false);
        }
    };

    const handleEventChange = (value: string) => {
        setSelectedEventId(value);
        setLastCheckIn(null);
        setErrorMsg("");
        setInputValue("");
        if (onEventChange) onEventChange(value);
    };

    const enterKioskMode = () => {
        setKioskMode(true);
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
    };

    const exitKioskMode = () => {
        setKioskMode(false);
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const handleCheckIn = async (code: string, method: 'QR' | 'SAC' | 'MANUAL' | 'KIOSK') => {
        if (!code || !selectedEventId) return;

        setProcessing(true);
        setErrorMsg("");
        setLastCheckIn(null);

        try {
            // 1. Try to find registration in CURRENT event
            let response = await registrationsApi.list({
                eventId: selectedEventId,
                search: code,
                limit: 1
            });

            let matchedReg = null;

            // Helper to extract data safely
            const extractReg = (res: any) => {
                if (Array.isArray(res.data)) return res.data[0];
                if (res.data && Array.isArray(res.data.data)) return res.data.data[0];
                if ((res as any).data && Array.isArray((res as any).data)) return (res as any).data[0];
                return null;
            };

            matchedReg = extractReg(response);

            // 2. Fallback: If not found, look up directly by ID (Bypasses some scope checks if API allows)
            if (!matchedReg) {
                console.log("Not found in current event, attempting direct lookup...");
                try {
                    // This endpoint often bypasses list-view scope filters to fetch specific record details
                    const directResponse = await registrationsApi.getById(code);
                    const globalReg = directResponse.data;

                    if (globalReg) {
                        // Start date formatting for context
                        const eventDate = globalReg.event?.startDate ?
                            new Date(globalReg.event.startDate).toLocaleDateString() : 'N/A';
                        const eventTitle = globalReg.event?.title || "Unknown Event";

                        if (globalReg.eventId === selectedEventId) {
                            // Weird case: It IS in this event but list didn't find it
                            matchedReg = globalReg;
                        } else {
                            throw new Error(`Badge is for different event: "${eventTitle}" (${eventDate})`);
                        }
                    }
                } catch (lookupErr: any) {
                    console.warn("Direct lookup failed:", lookupErr.message);
                    // If verified to be a CUID format but not found, it really doesn't exist.
                }

                if (!matchedReg) {
                    throw new Error("Registration not found. Valid token?");
                }
            }

            // 3. Proceed with Check-in
            if (matchedReg.status === "CHECKED_IN") {
                setLastCheckIn({ ...matchedReg, alreadyCheckedIn: true });
            } else {
                await toast.promise(
                    attendanceApi.checkIn({
                        eventId: selectedEventId,
                        registrationId: matchedReg.id, // Use the ID we found
                        checkInMethod: method,
                        centerId: matchedReg.participation?.centerId || undefined
                    }),
                    {
                        loading: 'Checking in...',
                        success: 'Checked In Successfully!',
                        error: 'Failed to check in'
                    }
                );
                setLastCheckIn({ ...matchedReg, status: 'CHECKED_IN' });
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Error processing check-in");
            // Re-throw so the scanner loop knows it failed (if needed) or just let the error state handle it
            // We set ErrorMsg, so visual feedback is there.
        } finally {
            setProcessing(false);
        }
    };

    const processingRef = useRef(false);
    const lastScannedCodeRef = useRef<string | null>(null);

    useEffect(() => {
        processingRef.current = processing;
    }, [processing]);

    const onScanSuccess = async (decodedText: string) => {
        // Strict guard against duplicate processing
        if (processingRef.current) return;
        if (lastScannedCodeRef.current === decodedText) return;

        // Smart Filter: Ignore invalid or non-code text patterns (e.g., detected text from UI elements)
        if (decodedText.length < 3 ||
            decodedText.includes("New year service") ||
            decodedText.includes("FCS Registry") ||
            decodedText.includes("Your Badge")) {
            return;
        }

        console.log("Scanned:", decodedText);

        try {
            // 1. Lock processing
            processingRef.current = true;
            lastScannedCodeRef.current = decodedText;

            // 2. Visual Feedback: Pause Scanner
            if (scannerRef.current?.pause) {
                try {
                    scannerRef.current.pause(true);
                } catch (e) {
                    console.warn("Pause failed:", e);
                }
            }

            toast.loading("Verifying...", { id: 'scan-toast', duration: 2000 });

            // 3. Process Check-In
            await handleCheckIn(decodedText, 'QR');

            toast.dismiss('scan-toast');

        } catch (error) {
            console.error("Scan processing error:", error);
            toast.error("Scan failed to process");
        } finally {
            // 4. Resume Logic (Wait a bit so user sees the result)
            setTimeout(() => {
                if (scannerRef.current?.resume) {
                    try {
                        scannerRef.current.resume();
                    } catch (e) {
                        console.warn("Resume failed, restarting scanner:", e);
                        // Fallback: fully restart if resume fails
                        startScanner();
                    }
                }

                // 5. Unlock
                processingRef.current = false;
                lastScannedCodeRef.current = null;

            }, 2000); // 2 seconds delay for visual confirmation
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                // Determine if it is the Core class (stop) or Scanner class (clear)
                if (scannerRef.current.stop) {
                    await scannerRef.current.stop();
                } else if (scannerRef.current.clear) {
                    await scannerRef.current.clear();
                }
            } catch (e) {
                console.warn("Failed to stop scanner", e);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const startScanner = async () => {
        if (!scannerReady || !selectedEventId || !(window as any).Html5Qrcode) return;

        await stopScanner();

        // Clear the element manually in case of artifacts
        const element = document.getElementById("reader");
        if (element) element.innerHTML = "";

        try {
            const html5QrCode = new (window as any).Html5Qrcode("reader");
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 20,
                    qrbox: { width: 300, height: 300 },
                    aspectRatio: 1.0,
                    disableFlip: false, // Ensure mirroring is handled if needed
                },
                onScanSuccess,
                (err: any) => { /* ignore frame errors */ }
            );
            scannerRef.current = html5QrCode;
            setIsScanning(true);
        } catch (e) {
            console.error("Failed to start scanner", e);
            toast.error("Failed to start camera. Please check permissions.");
            setIsScanning(false);
        }
    };

    const processInput = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;
        await handleCheckIn(inputValue.trim(), kioskMode ? "KIOSK" : "MANUAL");
        setInputValue("");
    };

    return (
        <div className={`flex flex-col h-full bg-gray-50 ${kioskMode ? 'fixed inset-0 z-50 bg-white p-6' : ''}`}>
            <Script
                src="https://unpkg.com/html5-qrcode"
                strategy="lazyOnload"
                onLoad={() => setScannerReady(true)}
            />

            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Scan className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        Attendance Kiosk
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Scan barcode or enter FCS Code to check in.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <Select value={selectedEventId} onValueChange={handleEventChange}>
                            <SelectTrigger className={`w-full h-11 bg-white ${!selectedEventId ? 'border-amber-500 border-2' : ''}`}>
                                <SelectValue placeholder="📅 Select Event to Begin" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventsLoading ? (
                                    <div className="flex items-center justify-center py-4 text-sm text-gray-500 gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading events...
                                    </div>
                                ) : events.length === 0 ? (
                                    <div className="px-2 py-6 text-center text-sm text-gray-500">
                                        No active events found
                                    </div>
                                ) : (
                                    events.map((e) => (
                                        <SelectItem key={e.id} value={e.id}>
                                            {e.title}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" size="icon" onClick={kioskMode ? exitKioskMode : enterKioskMode} title="Toggle Kiosk Mode" className="shrink-0">
                        {kioskMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                <Tabs defaultValue="barcode" className="h-full flex flex-col" onValueChange={(val) => {
                    if (val !== 'camera') {
                        stopScanner();
                    }
                }}>
                    <div className="px-1 mb-4 flex justify-between items-center bg-gray-100 p-1 rounded-lg w-fit">
                        <TabsList>
                            <TabsTrigger value="barcode" className="gap-2"><Scan className="w-4 h-4" /> Barcode / Manual</TabsTrigger>
                            <TabsTrigger value="camera" className="gap-2"><Camera className="w-4 h-4" /> Camera</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="barcode" className="flex-1 mt-0 h-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full pb-6">
                            {/* Input Section */}
                            <Card className={`p-4 sm:p-8 flex flex-col justify-center items-center gap-4 sm:gap-6 shadow-md border-t-4 ${!selectedEventId ? 'border-t-amber-500 bg-amber-50/30' : 'border-t-blue-500'}`}>
                                {!selectedEventId ? (
                                    <div className="w-full max-w-md text-center space-y-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                                            <Scan className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Select an Event First</h3>
                                        <p className="text-sm sm:text-base text-gray-600">
                                            Please select an event from the dropdown menu above before you can start scanning attendees.
                                        </p>
                                        <div className="pt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-700 bg-amber-100 rounded-lg p-3">
                                            <span className="font-bold">Step 1:</span>
                                            <span>Choose event from dropdown ↑</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md space-y-4">
                                        <form onSubmit={processInput} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                            <div className="relative flex-1">
                                                <Input
                                                    ref={inputRef}
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="h-14 sm:h-16 text-lg sm:text-2xl pl-10 sm:pl-12 shadow-sm border-2 focus:border-blue-500 transition-all font-mono tracking-wider"
                                                    placeholder="Enter FCS Code"
                                                    disabled={processing}
                                                    autoComplete="off"
                                                />
                                                <Scan className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                    {processing && <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-spin" />}
                                                </div>
                                            </div>
                                            <Button type="submit" size="lg" className="h-14 sm:h-16 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={processing}>
                                                Check In
                                            </Button>
                                        </form>
                                        <p className="text-center text-xs sm:text-sm text-gray-400">
                                            Press <span className="font-mono bg-gray-100 px-1 rounded">Enter</span> to confirm
                                        </p>
                                    </div>
                                )}

                                {/* Status Feedback Area */}
                                {selectedEventId && (
                                    <div className="w-full max-w-md min-h-[120px] sm:min-h-[150px] flex items-center justify-center">
                                        {processing ? (
                                            <div className="text-center text-sm sm:text-base text-gray-500 animate-pulse">
                                                Checking records...
                                            </div>
                                        ) : errorMsg ? (
                                            errorMsg.toLowerCase().includes('already checked in') ? (
                                                <div className="text-center animate-in zoom-in duration-300">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                                                    </div>
                                                    <h3 className="text-lg sm:text-xl font-bold text-amber-600 mb-1">Already Checked In</h3>
                                                    <p className="text-sm sm:text-base text-amber-500">{errorMsg}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center animate-in zoom-in duration-300">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                                                    </div>
                                                    <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-1">Not Found / Error</h3>
                                                    <p className="text-sm sm:text-base text-red-500">{errorMsg}</p>
                                                </div>
                                            )
                                        ) : lastCheckIn ? (
                                            <div className="text-center animate-in zoom-in duration-300 w-full">
                                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${lastCheckIn.alreadyCheckedIn ? 'bg-amber-100' : 'bg-green-100'
                                                    }`}>
                                                    {lastCheckIn.alreadyCheckedIn ? (
                                                        <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
                                                    ) : (
                                                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                                                    )}
                                                </div>
                                                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${lastCheckIn.alreadyCheckedIn ? 'text-amber-700' : 'text-green-700'
                                                    }`}>
                                                    {lastCheckIn.alreadyCheckedIn ? 'Already Checked In' : 'Check-In Successful!'}
                                                </h3>

                                                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mt-4 text-left border border-gray-100 shadow-sm">
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm sm:text-base">
                                                            {lastCheckIn.member?.firstName?.[0]}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-base sm:text-lg text-gray-900 break-words">
                                                                {lastCheckIn.member?.firstName} {lastCheckIn.member?.lastName}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                                                <Badge variant="outline" className="font-mono text-xs">
                                                                    {lastCheckIn.member?.fcsCode}
                                                                </Badge>
                                                                <span>•</span>
                                                                <span className="break-all">{lastCheckIn.participation?.center?.centerName || 'No Center Assigned'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <Database className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
                                                <p className="text-sm sm:text-base">Waiting for scan...</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>

                            {/* Recent Scans / Instructions */}
                            <div className="space-y-6">
                                <Card className="p-4 sm:p-6 h-full border-dashed shadow-sm bg-gray-50/50">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-700 mb-4 flex items-center gap-2">
                                        <Hash className="w-4 h-4" />
                                        Instructions
                                    </h3>
                                    <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                                            <span>Select the correct event from the dropdown menu at the top.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                                            <span>Click inside the input box (it should auto-focus).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                                            <span>Use a barcode scanner to scan the participant&apos;s tag OR manually type their **FCS Code** (e.g., FCS/24/1001).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="bg-blue-100 text-blue-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                                            <span>Wait for the Green Success message. If Red, check the code and try again.</span>
                                        </li>
                                    </ul>

                                    <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg text-blue-800 text-xs sm:text-sm">
                                        <strong>Pro Tip:</strong> Toggle
                                        <Button variant="link" className="h-auto p-0 px-1 text-blue-800 underline text-xs sm:text-sm" onClick={kioskMode ? exitKioskMode : enterKioskMode}>
                                            Full Screen Mode
                                        </Button>
                                        for distraction-free scanning at entrance points.
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="camera" className="flex-1 mt-0 h-full">
                        <Card className="p-6 h-full flex flex-col items-center justify-center bg-black/5">
                            {!selectedEventId ? (
                                <div className="text-center p-8 bg-white rounded-lg shadow">
                                    <h3 className="text-lg font-bold mb-2">Select Event First</h3>
                                    <p>Please select an event from the dropdown above to start scanning.</p>
                                </div>
                            ) : !scannerReady ? (
                                <div className="text-center flex flex-col items-center gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <p>Loading scanner library...</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                                    <div id="reader" className="w-full"></div>
                                    <div className="mt-4 text-center text-sm text-gray-500">
                                        Camera permission is required. Scan the QR code on the participant&apos;s badge.
                                    </div>
                                    <div className="flex gap-4 mt-4">
                                        <Button onClick={startScanner} variant={isScanning ? "secondary" : "default"}>
                                            <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                                            {isScanning ? 'Reload Camera' : 'Start Camera'}
                                        </Button>
                                        {isScanning && (
                                            <Button onClick={() => stopScanner()} variant="destructive">
                                                <XCircle className="w-4 h-4 mr-2" /> Stop Camera
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div >
    );
}
