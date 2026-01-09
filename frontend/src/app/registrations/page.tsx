"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Clock,
  Sparkles,
  LayoutGrid,
  Users,
  ArrowUpDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegistrationPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    checkedIn: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
    fetchStats();
  }, [page, limit, selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await api.get<any>("/events");
      const eventsData = response.data || response || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const params = new URLSearchParams();
      if (selectedEvent !== "all") {
        params.append("eventId", selectedEvent);
      }

      const response = await api.get<any>(`/registrations/stats/summary?${params.toString()}`);

      if (response && response.data) {
        setStats({
          total: response.data.total || 0,
          confirmed: response.data.confirmed || 0,
          pending: response.data.pending || 0,
          checkedIn: response.data.checkedIn || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (selectedEvent !== "all") {
        params.append("eventId", selectedEvent);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get<any>(`/registrations?${params.toString()}`);

      if (response.data) {
        setRegistrations(Array.isArray(response.data) ? response.data : []);
        if (response.pagination) {
          setTotal(response.pagination.total || 0);
          setTotalPages(response.pagination.pages || 1);
        }
      } else if (Array.isArray(response)) {
        setRegistrations(response);
        setTotal(response.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRegistrations();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Event Registrations
              </h1>
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Monitor and manage participant registrations across all events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-4 py-1.5 border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium">
                <Clock className="w-4 h-4 mr-2" />
                Live Updates
              </Badge>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Registrations</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                      {statsLoading ? "..." : stats.total.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                    <ClipboardList className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Confirmed</p>
                    <h3 className="text-3xl font-bold text-green-600 mt-2">
                      {statsLoading ? "..." : stats.confirmed.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-4 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
                    <h3 className="text-3xl font-bold text-amber-600 mt-2">
                      {statsLoading ? "..." : stats.pending.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl group-hover:bg-amber-100 transition-colors">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Checked In</p>
                    <h3 className="text-3xl font-bold text-purple-600 mt-2">
                      {statsLoading ? "..." : stats.checkedIn.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
                    <LayoutGrid className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Toolbar */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    Search Registrants
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Search by name, email, phone or FCS code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-4 pr-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="w-full lg:w-72 space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Filter by Event
                  </label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => {
                      setSelectedEvent(e.target.value);
                      setPage(1);
                    }}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="all">All Events</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={fetchRegistrations}
                  variant="outline"
                  className="h-12 px-6 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold"
                >
                  Apply Filters
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Table */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-lg font-medium animate-pulse">Loading registrations...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="py-24 text-center">
                <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
                  <ClipboardList className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No registrations found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {searchQuery || selectedEvent !== 'all'
                    ? "No registrations match your current search or filter criteria. Try adjusting them."
                    : "Registrations will appear here once participants start registering for events."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                      <th className="px-8 py-5 text-sm font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Member Details
                          <ArrowUpDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-600 uppercase tracking-wider">
                        Event Information
                      </th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-600 uppercase tracking-wider">
                        Registration Status
                      </th>
                      <th className="px-8 py-5 text-sm font-bold text-gray-600 uppercase tracking-wider">
                        Registration Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100">
                              {reg.member?.firstName?.[0]}{reg.member?.lastName?.[0]}
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {reg.member?.firstName} {reg.member?.lastName}
                              </div>
                              <div className="text-sm font-mono text-gray-500 mt-1 flex items-center gap-1">
                                <LayoutGrid className="w-3 h-3" />
                                {reg.member?.fcsCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-xs">
                            <div className="text-sm font-bold text-gray-800 line-clamp-2">{reg.event?.title}</div>
                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              {reg.event?.participationMode || 'Standard'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${reg.status?.toUpperCase() === "CONFIRMED"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : reg.status?.toUpperCase() === "CHECKED_IN"
                              ? "bg-purple-100 text-purple-700 border-purple-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}>
                            {reg.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {new Date(reg.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && registrations.length > 0 && (
              <div className="px-8 py-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                <div className="text-sm font-medium text-gray-500">
                  Showing <span className="text-gray-900">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="text-gray-900">{Math.min(page * limit, total)}</span> of{" "}
                  <span className="text-gray-900 font-bold">{total}</span> registrations
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 mr-4">
                    <p className="text-xs font-bold text-gray-500 uppercase">Rows:</p>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                  <nav className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-10 w-10 p-0 rounded-xl border-gray-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-10 px-4 flex items-center bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                      {page} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="h-10 w-10 p-0 rounded-xl border-gray-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
