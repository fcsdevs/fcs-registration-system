"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { Smartphone, QrCode, CheckCircle, XCircle, Search, Calendar, UserCheck } from "lucide-react";

export default function KioskPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

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
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);
    setSearchResult(null);
    setRegistration(null);

    try {
      // 1. Search for member
      const memberRes = await api.get<any>(`/members/search?q=${encodeURIComponent(searchQuery)}`);
      const members = memberRes.data?.data || memberRes.data || memberRes || [];

      if (Array.isArray(members) && members.length > 0) {
        const member = members[0];
        setSearchResult(member);

        // 2. If event is selected, check for registration
        if (selectedEventId) {
          const regRes = await api.get<any>(`/registrations/member/${member.id}?eventId=${selectedEventId}`);
          const registrations = regRes.data?.data || regRes.data || regRes || [];
          if (Array.isArray(registrations) && registrations.length > 0) {
            setRegistration(registrations[0]);
          } else {
            setMessage({ type: "error", text: "Member found but NO registration for this event." });
          }
        }
      } else {
        setMessage({ type: "error", text: "Member not found" });
      }
    } catch (error: any) {
      const errorMsg = error.response?.error?.message || error.message || "Search failed";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-6 transform rotate-3">
              <UserCheck className="w-8 h-8 text-white transform -rotate-3" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Check-In Kiosk</h1>
            <p className="text-slate-500 text-lg max-w-md mx-auto">Admin dashboard for rapid attendee check-in and membership lookup.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">

            {/* Event & Search Configuration */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Active Event</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={selectedEventId}
                      onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setSearchResult(null);
                        setRegistration(null);
                        setMessage(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 appearance-none"
                    >
                      <option value="">Select Event...</option>
                      {events.map((e) => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Search Identifier</label>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name, Phone, or FCS ID"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 placeholder:text-slate-400"
                    />
                  </form>
                </div>
              </div>

              <button
                onClick={handleSearch}
                type="button"
                disabled={loading || !searchQuery.trim() || !selectedEventId}
                className="w-full py-4 bg-slate-900 text-white text-lg font-bold rounded-2xl hover:bg-black transition-all transform active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
              >
                {loading && !searchResult ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Search className="w-5 h-5" />}
                {loading && !searchResult ? "Searching..." : "Lookup Member"}
              </button>

              {/* Messages */}
              {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                  {message.type === "success" ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-sm">{message.text}</span>
                </div>
              )}
            </div>

            {/* Results Display */}
            <div className={`transition-all duration-500 transform ${searchResult ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"}`}>
              {searchResult && (
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl transform rotate-3">
                        {searchResult.firstName?.[0]}{searchResult.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black">{searchResult.firstName} {searchResult.lastName}</h3>
                        <div className="flex items-center gap-2 mt-1 opacity-80">
                          <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold uppercase tracking-wider">{searchResult.fcsCode}</span>
                          <span className="text-sm font-medium">• {searchResult.gender}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Contact Detail</p>
                        <p className="text-slate-700 font-bold truncate">{searchResult.email || "No Email"}</p>
                        <p className="text-slate-500 text-sm font-medium">{searchResult.phoneNumber || "No Phone"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Registration Status</p>
                        {registration ? (
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${registration.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {registration.status}
                            </span>
                            <span className="text-slate-400 text-xs font-medium">Ref: {registration.id.slice(0, 8)}...</span>
                          </div>
                        ) : (
                          <span className="text-rose-500 text-sm font-bold">Unregistered</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleCheckIn}
                      disabled={loading || !registration}
                      className="w-full py-5 bg-emerald-500 text-white text-xl font-black rounded-2xl hover:bg-emerald-600 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-100 disabled:opacity-20 flex items-center justify-center gap-4"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : <CheckCircle className="w-6 h-6" />}
                      {loading ? "Confirming..." : "CONFIRM CHECK-IN"}
                    </button>

                    {!registration && (
                      <p className="text-center text-slate-400 text-xs mt-4 font-medium italic">
                        Registration is required before check-in can be processed.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Empty State / Instructional */}
            {!searchResult && !loading && (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for Scan or Search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
