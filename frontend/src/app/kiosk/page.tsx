"use client";

import { useState, useEffect, useRef } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { Smartphone, QrCode, CheckCircle, XCircle, Search, Calendar, UserCheck, Loader, Camera, RefreshCw } from "lucide-react";

export default function KioskPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "pending">("pending");
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<any>(null);
  const isScanningRef = useRef(false);


  useEffect(() => {
    fetchEvents();
    checkCameraPermission();
  }, []);

  useEffect(() => {
    if (scannerActive && videoRef.current && cameraPermission === "granted") {
      startScanner();
    }
    return () => {
      if (readerRef.current) {
        try {
          readerRef.current.reset();
        } catch (e) {
          console.error("Error stopping scanner:", e);
        }
      }
      if (videoRef.current && videoRef.current.srcObject) {
         try {
           const stream = videoRef.current.srcObject as MediaStream;
           stream.getTracks().forEach(track => track.stop());
           videoRef.current.srcObject = null;
         } catch (err) {}
      }
    };
  }, [scannerActive, cameraPermission]);

  const fetchEvents = async () => {
    try {
      const response = await api.get<any>("/events");
      const data = response.data?.data || response.data || [];
      const activeEvents = Array.isArray(data) ? data.filter((e: any) => e.isPublished) : [];
      setEvents(activeEvents);
      if (activeEvents.length > 0) {
        setSelectedEventId(activeEvents[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(searchQuery);
  };

  const performSearch = async (query: string) => {
    if (!selectedEventId || !query.trim()) return;

    try {
      setLoading(true);
      setMessage(null);
      setSearchResult(null);
      setRegistration(null);

      const response = await api.get<any>(`/registrations?eventId=${selectedEventId}&search=${encodeURIComponent(query.trim())}&limit=1`);

      // Handle nested data structure { data: { data: [], pagination: {} } } or simple { data: [] }
      const body = response.data;
      const registrations = body?.data || body || [];
      const foundRegistration = Array.isArray(registrations) ? registrations[0] : null;

      if (foundRegistration) {
        setRegistration(foundRegistration);
        setSearchResult(foundRegistration.member);
      } else {
        setMessage({ type: "error", text: "No registration found matching this query." });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      setMessage({ type: "error", text: "Search failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };



  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission("granted");
    } catch (error) {
      console.error("Camera permission denied:", error);
      setCameraPermission("denied");
    }
  };

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      await videoRef.current.play();

      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      reader.decodeFromVideoElement(videoRef.current, (result, err) => {
        if (result && !isScanningRef.current) {
          isScanningRef.current = true;
          const barcode = result.getText().trim();
          console.log("Barcode scanned:", barcode);
          setSearchQuery(barcode);
          setScannerActive(false);
          performSearch(barcode);
        }
      });
    } catch (error) {
      console.error("Scanner error:", error);
      setMessage({ type: "error", text: "Scanner initialization failed" });
      setScannerActive(false);
    }
  };

  const handleCheckIn = async () => {
    if (!registration) return;

    try {
      setLoading(true);
      await api.post(`/registrations/${registration.id}/attendance`, { method: "KIOSK" });

      setMessage({ type: "success", text: `Check-in successful for ${searchResult.firstName}!` });

      // Auto-clear after success
      setTimeout(() => {
        setSearchQuery("");
        setSearchResult(null);
        setRegistration(null);
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      const errorMsg = error.response?.error?.message || error.message || "Check-in failed";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-300/40 mb-5 animate-pulse">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Check-In Mark Attendance</h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto font-medium">Scan QR codes or search members for rapid event check-in</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Event Selector */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 backdrop-blur-sm">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Active Event</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      setSearchResult(null);
                      setRegistration(null);
                      setMessage(null);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm text-slate-700 appearance-none transition-all"
                  >
                    <option value="">Select Event...</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Input */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 backdrop-blur-sm">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Manual Search</label>
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name, Phone, or ID"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm text-slate-700 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !searchQuery.trim() || !selectedEventId}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {loading ? "Searching..." : "Search"}
                  </button>
                </form>
              </div>

              {/* Scanner Toggle */}
              {cameraPermission === "granted" && (
                <button
                  onClick={() => {
                    const newState = !scannerActive;
                    setScannerActive(newState);
                    if (newState) isScanningRef.current = false;
                  }}
                  className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md border-2 ${scannerActive

                    ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
                    : "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    }`}
                >
                  {scannerActive ? (
                    <>
                      <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse" />
                      Stop Scanner
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Activate Scanner
                    </>
                  )}
                </button>
              )}

              {cameraPermission === "denied" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700 font-medium">Camera access denied. Please enable camera permissions.</p>
                </div>
              )}
            </div>

            {/* Right Panel - Scanner & Results */}
            <div className="lg:col-span-2 space-y-4">

              {/* Scanner View */}
              {scannerActive && cameraPermission === "granted" && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                  <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      style={{ transform: "scaleX(-1)" }}
                    />
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-emerald-400 rounded-lg shadow-lg shadow-emerald-500/50 animate-pulse" />
                      <div className="absolute top-4 left-4 right-4 h-16 bg-gradient-to-b from-emerald-400/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 h-16 bg-gradient-to-t from-emerald-400/20 to-transparent" />
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center text-sm font-medium">
                    Position QR code or barcode in frame
                  </div>
                </div>
              )}

              {/* Results Display */}
              {searchResult && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Header with member info */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                        {searchResult.firstName?.[0]}{searchResult.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-black truncate">{searchResult.firstName} {searchResult.lastName}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="px-2.5 py-1 bg-white/20 rounded-md text-xs font-bold uppercase tracking-wide">{searchResult.fcsCode}</span>
                          {searchResult.gender && <span className="text-sm font-medium opacity-90">• {searchResult.gender}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{searchResult.email || "—"}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-sm font-semibold text-slate-700">{searchResult.phoneNumber || "—"}</p>
                      </div>
                    </div>

                    {/* Registration Status */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Registration Status</p>
                      {registration ? (
                        <div className="space-y-2">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${registration.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}>
                            {registration.status}
                          </div>
                          <p className="text-xs text-slate-500">Ref: {registration.id.slice(0, 12)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-rose-600">⚠️ Not Registered for Event</p>
                      )}
                    </div>

                    {/* Check-in Button */}
                    <button
                      onClick={handleCheckIn}
                      disabled={loading || !registration}
                      className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${registration && !loading
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200/50"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          CONFIRM CHECK-IN
                        </>
                      )}
                    </button>

                    {/* Clear Button */}
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResult(null);
                        setRegistration(null);
                        setMessage(null);
                        isScanningRef.current = false;
                        setScannerActive(true);
                      }}
                      className="w-full py-2 rounded-lg font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Scan Another
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 border ${message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-sm">{message.text}</span>
                </div>
              )}

              {/* Empty State */}
              {!searchResult && !scannerActive && !loading && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-12 text-center">
                  <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-slate-600 font-semibold mb-1">Ready for Check-In</p>
                  <p className="text-slate-500 text-sm">Activate scanner or search manually to begin</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
