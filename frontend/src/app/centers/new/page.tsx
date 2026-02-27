"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { centersApi } from "@/lib/api/centers";
import { unitsApi } from "@/lib/api/units";
import { eventsApi } from "@/lib/api/events";
import { MapPin, ArrowLeft, Save, Loader2, Sparkles, Building2, Globe2 } from "lucide-react";
import Link from "next/link";
import { Unit, Event } from "@/types/api";

export default function NewCenterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [formData, setFormData] = useState({
    eventId: "",
    centerName: "",
    country: "Nigeria",
    stateId: "",
    zoneId: "",
    address: "",
  });

  const [zones, setZones] = useState<Unit[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      if (!formData.stateId) {
        setZones([]);
        return;
      }
      setLoadingZones(true);
      try {
        const res = await unitsApi.getChildren(formData.stateId);
        const data = res.data || (res as any).data || [];
        setZones(data);
      } catch (err) {
        console.error("Failed to fetch zones:", err);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
    setFormData(prev => ({ ...prev, zoneId: "" }));
  }, [formData.stateId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingInitialData(true);
        const [eventsRes, unitsRes] = await Promise.all([
          eventsApi.list({ limit: 100 }),
          unitsApi.list({ type: 'State', limit: 300 }),
        ]);

        const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : ((eventsRes as any).data?.data || []);
        const unitsData = Array.isArray(unitsRes.data) ? unitsRes.data : ((unitsRes as any).data?.data || []);

        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setUnits(Array.isArray(unitsData) ? unitsData : []);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setLoadingInitialData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.eventId) throw new Error("Please select an event");
      if (!formData.stateId) throw new Error("Please select a state");

      await centersApi.create({
        eventId: formData.eventId,
        centerName: formData.centerName,
        country: formData.country,
        stateId: formData.stateId,
        zoneId: formData.zoneId || undefined,
        address: formData.address,
      });
      router.push("/centers");
    } catch (err: any) {
      setError(err.message || "Failed to create center");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/centers"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-all mb-8 group"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">Back to Directory</span>
          </Link>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Header Content */}
            <div className="relative px-10 py-12 bg-slate-900 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10 flex items-center gap-5">
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Create New Center</h1>
                  <p className="text-slate-400 mt-1 font-medium">Define a new physical location for event registrations.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-10 mt-10 p-5 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                <div className="p-2 bg-white rounded-full">
                  <Loader2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-sm">Action Failed</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-10 space-y-10">

              {/* Event Selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Primary Event Mapping
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <select
                    required
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700"
                    disabled={loadingInitialData}
                  >
                    <option value="">Select the target event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Center Identification
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.centerName}
                    onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700"
                    placeholder="e.g., Lagos State Poly Hub"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    State Assignment
                  </label>
                  <select
                    required
                    value={formData.stateId}
                    onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700"
                    disabled={loadingInitialData}
                  >
                    <option value="">Select a state</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Zone Assignment (Optional)
                  </label>
                  <select
                    value={formData.zoneId}
                    onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 disabled:opacity-50"
                    disabled={!formData.stateId || loadingZones}
                  >
                    <option value="">{loadingZones ? "Loading..." : "Select a zone"}</option>
                    {zones.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country and Address */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Country
                  </label>
                  <div className="relative">
                    <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Physical Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-5 w-5 h-5 text-slate-300" />
                    <textarea
                      rows={1}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-700 resize-none"
                      placeholder="Complete street address..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-5 pt-10 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading || loadingInitialData}
                  className="flex-[2] py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      Create Event Center
                    </>
                  )}
                </button>
                <Link
                  href="/centers"
                  className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-lg text-center hover:bg-slate-200 transition-all active:scale-[0.98]"
                >
                  Discard
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
