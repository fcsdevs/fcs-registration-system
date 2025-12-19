"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { ClipboardCheck, Calendar, Users, TrendingUp, Download, Filter } from "lucide-react";
import Link from "next/link";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendance();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await api.get<any>("/events");
      const data = response.data || response || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>(`/attendance?eventId=${selectedEvent}`);
      const data = response.data || response || [];
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: Array.isArray(attendance) ? attendance.length : 0,
    present: Array.isArray(attendance) ? attendance.filter(a => a.status === "present").length : 0,
    absent: Array.isArray(attendance) ? attendance.filter(a => a.status === "absent").length : 0,
    rate: Array.isArray(attendance) && attendance.length > 0 
      ? Math.round((attendance.filter(a => a.status === "present").length / attendance.length) * 100) 
      : 0,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-gray-600 mt-1">Track and manage event attendance</p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </div>

          {/* Event Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedEvent && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Registered</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Present</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{stats.present}</p>
                    </div>
                    <ClipboardCheck className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Absent</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">{stats.absent}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">{stats.rate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Attendance List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : attendance.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No attendance records</h3>
                  <p className="text-gray-600">Attendance records will appear here</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {record.member?.firstName} {record.member?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{record.member?.fcsCode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.checkInTime ? new Date(record.checkInTime).toLocaleString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === "present" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900">
                              Mark Present
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
