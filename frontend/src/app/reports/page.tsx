"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  Calendar,
  ClipboardCheck,
  PieChart,
  FileSpreadsheet
} from "lucide-react";
import { ReportConfigModal } from "@/components/reports/report-config-modal";

export default function ReportPage() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalMembers: 0,
    totalRegistrations: 0,
    avgAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>("/reports/dashboard");
      const data = response.data?.data || response.data || response || {};
      const overview = data.overview || {};
      setStats({
        totalEvents: overview.activeEvents || 0,
        totalMembers: overview.totalMembers || 0,
        totalRegistrations: overview.thisMonthRegistrations || 0,
        avgAttendance: overview.attendanceRate || 0
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const reportTypes = [
    {
      title: "Attendance Report",
      description: "Detailed attendance logs including check-in times and member details.",
      icon: ClipboardCheck,
      color: "blue",
      requiresEvent: true,
      endpointGenerator: ({ eventId, format }: any) => `/reports/events/${eventId}/export?format=${format}&type=attendance`
    },
    {
      title: "Registration List",
      description: "Complete list of registered participants with payment and contact info.",
      icon: Users,
      color: "green",
      requiresEvent: true,
      endpointGenerator: ({ eventId, format }: any) => `/reports/events/${eventId}/export?format=${format}&type=registration`
    },
    {
      title: "Event Analytics",
      description: "Performance metrics, participation rates, and demographic breakdown.",
      icon: BarChart3,
      color: "purple",
      requiresEvent: true,
      endpointGenerator: ({ eventId, format }: any) => `/reports/events/${eventId}/export?format=${format}&type=analytics` // Reusing export for now
    },
    {
      title: "Financial Report",
      description: "Revenue summary, pending payments, and donation records.",
      icon: PieChart,
      color: "orange",
      requiresEvent: true,
      endpointGenerator: ({ eventId, format }: any) => `/reports/events/${eventId}/export?format=${format}&type=financial`
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-gray-500 mt-1 max-w-2xl">
              Generate comprehensive reports, analyze trends, and export data for external use.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Events", value: stats.totalEvents, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total Members", value: stats.totalMembers, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Registrations", value: stats.totalRegistrations, icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-50" },
              { label: "Avg Attendance", value: `${stats.avgAttendance}%`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? <span className="inline-block w-8 h-6 bg-gray-100 animate-pulse rounded" /> : stat.value}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-gray-400" />
            Available Reports
          </h2>

          {/* Report Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                green: "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white",
                purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
                orange: "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
              };

              return (
                <div key={report.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all group relative overflow-hidden">
                  <div className="flex items-start gap-5 relative z-10">
                    <div className={`p-4 rounded-xl transition-colors duration-300 ${colorClasses[report.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{report.title}</h3>
                      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{report.description}</p>
                      <button
                        onClick={() => handleOpenReport(report)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 border border-gray-200 transition-all hover:border-gray-300 active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        Configure & Download
                      </button>
                    </div>
                  </div>
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>

        <ReportConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reportType={selectedReport}
        />
      </div>
    </ProtectedRoute>
  );
}
