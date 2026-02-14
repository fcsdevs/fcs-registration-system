"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { centersApi } from "@/lib/api/centers";
import { eventsApi } from "@/lib/api/events";
import { MapPin, Plus, Search, Building2, Users, Edit, Trash2, Filter, ChevronRight, Activity, Eye } from "lucide-react";
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
    fetchCenters(selectedEventId);
  }, [selectedEventId]);

  const fetchInitialData = async () => {
    try {
      const eventsRes = await eventsApi.list({ limit: 100 }); // Fetch all events
      // Handle backend response structure { data: [], pagination: {} }
      const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : ((eventsRes as any).data?.data || []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  const fetchCenters = async (eventId?: string) => {
    try {
      setLoading(true);
      const res = await centersApi.listAllForAdmin({
        eventId: eventId || undefined, // Only pass if selected
        limit: 500,
        search: searchQuery
      });

      // Handle backend response structure { data: { data: [] } } or { data: [] }
      const centersData = Array.isArray(res.data) ? res.data : ((res as any).data?.data || []);
      setCenters(Array.isArray(centersData) ? centersData : []);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Header Section */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Event Centers</h1>
              <p className="text-slate-500 text-sm">Manage physical locations for registration.</p>
            </div>
            <Link
              href="/centers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Center
            </Link>
          </div>

          {/* Filters & Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 mb-6 flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search centers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              />
            </div>

            <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics - Row-filling Grid (3 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <QuickStat title="Total Centers" value={centers.length} icon={Building2} color="blue" />
            <QuickStat title="Active States" value={Object.keys(groupedByState).length} icon={MapPin} color="indigo" />
            <QuickStat title="Total Admins" value={centers.reduce((sum, c) => sum + (c.admins?.length || 0), 0)} icon={Users} color="purple" />
          </div>

          {/* Centers List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-medium animate-pulse">Loading centers...</p>
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No centers found</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Try adjusting your filters or create a new center.</p>
              <Link
                href="/centers/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Center
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByState).map(([state, stateCenters]) => (
                <div key={state} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {state} <span className="text-slate-300 mx-2">•</span> {stateCenters.length}
                    </h2>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>

                  {/* Compact Grid for Centers - 4 columns on large screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stateCenters.map((center) => (
                      <CenterCard
                        key={center.id}
                        center={center}
                        onDelete={async () => {
                          if (window.confirm("Are you sure you want to delete this center? This action cannot be undone.")) {
                            try {
                              await centersApi.deactivate(center.id);
                              fetchCenters(selectedEventId); // Refresh list
                            } catch (err) {
                              console.error("Failed to delete center", err);
                              alert("Failed to delete center. Please try again.");
                            }
                          }
                        }}
                      />
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
    <div className="bg-white px-5 py-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function CenterCard({ center, onDelete }: { center: EventCenter; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden">
      {/* Active Status Indicator Line */}
      <div className={`h-1 w-full shrink-0 ${center.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">
            {center.centerName}
          </h3>
          <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${center.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} title={center.isActive ? "Active" : "Inactive"}></div>
        </div>

        {/* Meta Info */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <MapPin className="w-3 h-3" />
            <span className="font-medium truncate">{typeof center.state === 'object' ? center.state?.name : center.state}</span>
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-1 pl-4" title={center.address}>
            {center.address}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-50">
          <div className="flex-1 flex flex-col">
            <p className="text-[9px] uppercase text-slate-400 font-bold leading-none mb-1">Registrations</p>
            <p className="text-sm font-bold text-slate-700 leading-none">{center._count?.registrations || 0}</p>
          </div>
          <div className="h-6 w-px bg-slate-100"></div>
          <div className="flex-1 flex flex-col">
            <p className="text-[9px] uppercase text-slate-400 font-bold leading-none mb-1">Attendances</p>
            <p className="text-sm font-bold text-slate-700 leading-none">{center._count?.attendances || 0}</p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-50">
          <Link
            href={`/centers/${center.id}`}
            className="px-1 py-1.5 text-[9px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-md transition-all flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3" /> View
          </Link>
          <Link
            href={`/centers/${center.id}/edit`}
            className="px-1 py-1.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-md transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <Edit className="w-3 h-3" /> Edit
          </Link>
          <button
            onClick={onDelete}
            className="px-1 py-1.5 text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-50 rounded-md transition-all flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
