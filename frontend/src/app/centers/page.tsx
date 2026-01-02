"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { MapPin, Plus, Search, Building2, Users, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      // Centers API requires eventId, so we'll fetch all events first
      // In a real app, you'd have a filter to select which event's centers to view
      const eventsResponse = await api.get<any>("/events");
      const events = eventsResponse.data?.data || eventsResponse.data || [];

      if (events.length > 0) {
        // Fetch centers for the first event (or you could fetch for all events)
        const response = await api.get<any>(`/centers?eventId=${events[0].id}`);
        const data = response.data?.data || response.data || [];
        setCenters(Array.isArray(data) ? data : []);
      } else {
        setCenters([]);
      }
    } catch (error) {
      console.error("Failed to fetch centers:", error);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = Array.isArray(centers) ? centers.filter((center) => {
    const name = center.centerName || center.name || "";
    const state = typeof center.state === 'object' ? center.state?.name : (center.state || "");
    const search = searchQuery.toLowerCase();

    return name.toLowerCase().includes(search) ||
      state.toLowerCase().includes(search);
  }) : [];

  const groupedByState = filteredCenters.reduce((acc, center) => {
    const state = typeof center.state === 'object' ? center.state?.name : (center.state || "Unknown");
    if (!acc[state]) acc[state] = [];
    acc[state].push(center);
    return acc;
  }, {} as Record<string, any[]>);

  const handleDelete = async (centerId: string) => {
    if (!window.confirm("Are you sure you want to delete this center? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/centers/${centerId}`);
      // Refresh list
      fetchCenters();
    } catch (error) {
      console.error("Failed to delete center:", error);
      alert("Failed to delete center");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Event Centers</h1>
                <p className="text-gray-600 mt-1">Manage event centers and locations</p>
              </div>
              <Link
                href="/centers/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Center
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Centers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{centers.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">States Covered</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {Object.keys(groupedByState).length}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {centers.reduce((sum, c) => sum + (c.capacity || 0), 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by center name or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Centers List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No centers found</h3>
              <p className="text-gray-600 mb-6">Add your first event center</p>
              <Link
                href="/centers/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Center
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByState).map(([state, stateCenters]) => (
                <div key={state}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    {state} ({(stateCenters as any[]).length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(stateCenters as any[]).map((center: any) => (
                      <div key={center.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {center.centerName || center.name}
                            </h3>
                            <p className="text-gray-600 text-sm">{center.address}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {typeof center.state === 'object' ? center.state?.name : (center.state || "Unknown")}
                            </span>
                          </div>
                          {center.capacity && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Capacity: {center.capacity}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          <Link
                            href={`/centers/${center.id}`}
                            className="flex-1 text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/centers/${center.id}/edit`}
                            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                            title="Edit Center"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(center.id)}
                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                            title="Delete Center"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
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
