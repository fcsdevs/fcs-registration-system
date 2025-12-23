"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { ClipboardList, Search, Filter, Users, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function RegistrationPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Fetch all registrations to get accurate stats (without pagination)
      const params = new URLSearchParams();
      if (selectedEvent !== "all") {
        params.append("eventId", selectedEvent);
      }

      // Fetch without pagination to get all data for stats
      const response = await api.get<any>(`/registrations?${params.toString()}`);

      let allRegistrations = [];
      if (response.data && Array.isArray(response.data)) {
        allRegistrations = response.data;
      } else if (Array.isArray(response)) {
        allRegistrations = response;
      }

      // Calculate stats from all registrations
      setStats({
        total: allRegistrations.length,
        confirmed: allRegistrations.filter((r: any) => r.status?.toUpperCase() === "CONFIRMED").length,
        pending: allRegistrations.filter((r: any) => r.status?.toUpperCase() === "PENDING").length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
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

      const response = await api.get<any>(`/registrations?${params.toString()}`);

      // Handle both paginated and non-paginated responses
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

  const filteredRegistrations = Array.isArray(registrations) ? registrations.filter((reg) =>
    reg.member?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.member?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Event Registrations</h1>
            <p className="text-gray-600 mt-1">Manage event registrations and attendance</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <XCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by member name or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedEvent}
                  onChange={(e) => {
                    setSelectedEvent(e.target.value);
                    setPage(1); // Reset to first page
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Events</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Registrations List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No registrations found</h3>
              <p className="text-gray-600">
                {selectedEvent !== "all" ? "No registrations for this event" : "Registrations will appear here"}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reg.member?.firstName} {reg.member?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{reg.member?.fcsCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reg.event?.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${reg.status?.toLowerCase() === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(page * limit, total)}</span> of{" "}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
