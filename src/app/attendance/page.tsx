"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import {
  ClipboardCheck,
  Calendar,
  Users,
  TrendingUp,
  Download,
  CalendarDays,
  Scan,
  LayoutDashboard
} from "lucide-react";
import { EventSelectorModal } from "@/components/events/event-selector-modal";
import { useAuth } from "@/context/auth-context";
import { RegistrarAttendanceView } from "@/components/attendance/registrar-attendance-view";
import { Button } from "@/components/ui/button";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // View Mode: 'dashboard' | 'kiosk'
  const [viewMode, setViewMode] = useState<'dashboard' | 'kiosk'>('dashboard');

  // Role Checks
  const isAdmin = user?.roles?.some((r: any) => r.toLowerCase().includes('admin') || r === 'leader');
  const isRegistrar = user?.roles?.some((r: any) => r.toLowerCase() === 'registrar');

  // Set default view based on role
  useEffect(() => {
    if (isRegistrar && !isAdmin) {
      setViewMode('kiosk');
    }
  }, [isRegistrar, isAdmin]);

  // Event State
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEventData, setSelectedEventData] = useState<any>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    if (selectedEventId && viewMode === 'dashboard') {
      fetchAttendance();
    }
  }, [selectedEventId, viewMode]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>(`/attendance?eventId=${selectedEventId}`);
      const data = response.data || response || [];
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event: any) => {
    setSelectedEventId(event.id);
    setSelectedEventData(event);
    setIsSelectorOpen(false);
  };

  const stats = {
    total: Array.isArray(attendance) ? attendance.length : 0,
    present: Array.isArray(attendance) ? attendance.filter(a => a.status === "present").length : 0,
    absent: Array.isArray(attendance) ? attendance.filter(a => a.status === "absent").length : 0,
    rate: Array.isArray(attendance) && attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === "present").length / attendance.length) * 100)
      : 0,
  };

  if (viewMode === 'kiosk') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Admin Back Link */}
          {isAdmin && (
            <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-sm">
              <span>Previewing as Registrar</span>
              <button onClick={() => setViewMode('dashboard')} className="hover:underline flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
              </button>
            </div>
          )}

          <div className="flex-1 p-6">
            <RegistrarAttendanceView onEventChange={(id) => setSelectedEventId(id)} />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-gray-600 mt-1">Track and manage event attendance</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Kiosk Toggle for Admins */}
                <Button variant="outline" onClick={() => setViewMode('kiosk')} className="gap-2">
                  <Scan className="w-4 h-4" />
                  Open Kiosk Mode
                </Button>

                {selectedEventId && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Export Report
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Event Selector Card */}
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-8 transition-all hover:shadow-md">
            {!selectedEventId ? (
              <div className="text-center py-6">
                <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Event to Manage</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Choose an event from the list to view attendance records, statistics, and manage check-ins.
                </p>
                <button
                  onClick={() => setIsSelectorOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
                >
                  <Calendar className="w-5 h-5" />
                  Select Event
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="h-14 w-14 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xs font-medium uppercase opacity-80">
                      {new Date(selectedEventData.startDate).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold leading-none">
                      {new Date(selectedEventData.startDate).getDate()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedEventData.title}</h2>
                    <div className="flex items-center gap-3 text-gray-500 text-sm mt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                          {new Date(selectedEventData.startDate).toLocaleDateString()}
                          {selectedEventData.endDate && ` - ${new Date(selectedEventData.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium 
                          ${selectedEventData.participationMode === 'ONSITE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {selectedEventData.participationMode}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsSelectorOpen(true)}
                  className="w-full md:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  Change Event
                </button>
              </div>
            )}
          </div>

          <EventSelectorModal
            isOpen={isSelectorOpen}
            onClose={() => setIsSelectorOpen(false)}
            onSelect={handleEventSelect}
            selectedEventId={selectedEventId}
          />

          {selectedEventId && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Registered</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Present</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{stats.present}</p>
                    </div>
                    <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Absent</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">{stats.absent}</p>
                    </div>
                    <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">{stats.rate}%</p>
                    </div>
                    <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance List */}
              {loading ? (
                <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : attendance.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center border border-dashed border-gray-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <ClipboardCheck className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No attendance records found</h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    There are no attendance records for this event yet. Mark attendance manually or via check-in.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
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
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendance.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3">
                                  {record.member?.firstName?.[0]}{record.member?.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {record.member?.firstName} {record.member?.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">{record.member?.fcsCode}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.checkInTime ? new Date(record.checkInTime).toLocaleString() : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "present"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 hover:underline">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
