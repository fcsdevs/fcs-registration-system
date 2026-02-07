"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { centersApi } from "@/lib/api/centers";
import { eventsApi } from "@/lib/api/events";
import { MapPin, Plus, Search, Building2, Users, Edit, Trash2, Filter, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { EventCenter, Event } from "@/types/api";

export default function CentersPage() {
  const [centers, setCenters] = useState<EventCenter[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchCenters(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const eventsRes = await eventsApi.list({ isPublished: true, limit: 100 });
      const eventsData = eventsRes.data?.data || [];
      setEvents(eventsData);

      if (eventsData.length > 0) {
        setSelectedEventId(eventsData[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setLoading(false);
    }
  };

  const fetchCenters = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await centersApi.list({ eventId, limit: 500 });
      const data = response.data?.data || [];
      setCenters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch centers:", error);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = Array.isArray(centers) ? centers.filter((center) => {
    const name = center.centerName || "";
    const state = typeof center.state === 'object' ? center.state?.name : (center.state || "");
    const search = searchQuery.toLowerCase();

    return name.toLowerCase().includes(search) || state.toLowerCase().includes(search);
  }) : [];

  const groupedByState = filteredCenters.reduce((acc, center) => {
    const state = typeof center.state === 'object' ? center.state?.name : (center.state || "National/Unassigned");
    if (!acc[state]) acc[state] = [];
    acc[state].push(center);
    return acc;
  }, {} as Record<string, EventCenter[]>);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Event Centers</h1>
              <p className="text-slate-500 font-medium">Configure and manage physical locations for registration and attendance.</p>
            </div>
            <Link
              href="/centers/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Center
            </Link>
          </div>

          {/* Filters & Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search centers by name or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:min-w-[240px]">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-medium"
                >
                  <option value="">Filter by Event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <QuickStat title="Total Centers" value={centers.length} icon={Building2} color="blue" />
            <QuickStat title="Active States" value={Object.keys(groupedByState).length} icon={MapPin} color="indigo" />
            <QuickStat title="Total Admins" value={centers.reduce((sum, c) => sum + (c.admins?.length || 0), 0)} icon={Users} color="purple" />
          </div>

          {/* Centers List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium animate-pulse">Synchronizing center data...</p>
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No centers found</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">We couldn't find any centers matching your filters. Try adjusting your search or create a new one.</p>
              <Link
                href="/centers/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Center
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedByState).map(([state, stateCenters]) => (
                <div key={state} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      {state} — {stateCenters.length} Locations
                    </h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stateCenters.map((center) => (
                      <CenterCard key={center.id} center={center} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function QuickStat({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function CenterCard({ center }: { center: EventCenter }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group overflow-hidden flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
              {center.centerName}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{typeof center.state === 'object' ? center.state?.name : center.state}</span>
            </div>
          </div>
          {center.isActive ? (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px] mb-6">
          {center.address}
        </p>

        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50 mb-4">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrations</p>
            <p className="text-sm font-bold text-slate-900">{center._count?.registrations || 0}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
            <p className="text-sm font-bold text-slate-900">{center._count?.attendances || 0}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
        <Link
          href={`/centers/${center.id}`}
          className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
        >
          Management <ChevronRight className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/centers/${center.id}/edit`}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit Center"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
