"use client";

import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { BarChart3, Download, FileText, TrendingUp, Users, Calendar } from "lucide-react";

export default function ReportPage() {
  const reportTypes = [
    {
      title: "Attendance Report",
      description: "View attendance statistics and trends",
      icon: Users,
      color: "blue",
    },
    {
      title: "Event Analytics",
      description: "Analyze event performance and participation",
      icon: BarChart3,
      color: "green",
    },
    {
      title: "Member Statistics",
      description: "Member demographics and growth metrics",
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Registration Report",
      description: "Registration trends and conversion rates",
      icon: Calendar,
      color: "orange",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Generate and download various reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                green: "bg-green-100 text-green-600",
                purple: "bg-purple-100 text-purple-600",
                orange: "bg-orange-100 text-orange-600",
              };

              return (
                <div key={report.title} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colorClasses[report.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" />
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
