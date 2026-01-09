/**
 * Dashboard - Main Application Hub
 * KPIs, recent activity, and quick actions for authenticated users
 */

"use client";

import { ProtectedRoute } from "@/components/common/route-guards";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api/client";
import {
  StatCard,
  EventCard,
  AttendanceBadge,
} from "@/components/ui/professional-components";
import {
  Plus,
  Bell,
  Settings,
  Shield,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Redirect non-admin users to member dashboard
    if (user) {
      const isAdmin = user.roles?.some((r: any) => {
        const role = r.toLowerCase();
        return role.includes('admin') || role === 'leader';
      });

      if (!isAdmin) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [user, router]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, eventsRes] = await Promise.all([
        api.get("/reports/dashboard"),
        api.get("/events"),
      ]);

      const dashboardData = (dashboardRes as any).data?.data || (dashboardRes as any).data;
      setDashboardData(dashboardData);

      const eventsData = (eventsRes as any).data?.data || (eventsRes as any).data || [];
      setUpcomingEvents(Array.isArray(eventsData) ? eventsData.slice(0, 3) : []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stats derived from API data
  const stats = dashboardData ? [
    {
      title: "Total Members",
      value: dashboardData.overview?.totalMembers?.toLocaleString() || "0",
      metric: "members",
      icon: Users,
      trend: {
        value: Math.abs(dashboardData.overview?.memberGrowth || 0),
        isPositive: (dashboardData.overview?.memberGrowth || 0) >= 0
      },
      color: "primary" as const,
    },
    {
      title: "Active Events",
      value: dashboardData.overview?.activeEvents?.toString() || "0",
      metric: "total events",
      icon: Calendar,
      trend: {
        value: Math.abs(dashboardData.overview?.eventGrowth || 0),
        isPositive: (dashboardData.overview?.eventGrowth || 0) >= 0
      },
      color: "info" as const,
    },
    {
      title: "Checked-in Today",
      value: dashboardData.overview?.checkedInToday?.toLocaleString() || "0",
      metric: "check-ins",
      icon: CheckCircle2,
      trend: { value: 100, isPositive: true }, // Placeholder for 'all-time' or similar
      color: "success" as const,
    },
    {
      title: "Registrations",
      value: dashboardData.overview?.thisMonthRegistrations?.toLocaleString() || "0",
      metric: "this month",
      icon: TrendingUp,
      trend: {
        value: Math.abs(dashboardData.overview?.registrationGrowth || 0),
        isPositive: (dashboardData.overview?.registrationGrowth || 0) >= 0
      },
      color: "warning" as const,
    },
  ] : [];

  // Format events for display
  const formattedEvents = upcomingEvents.map(event => {
    // Use endDate to judge if the event is past, fallback to startDate if endDate is missing
    const statusDate = event.endDate ? new Date(event.endDate) : (event.startDate ? new Date(event.startDate) : null);
    const isPast = statusDate && statusDate < new Date();

    return {
      title: event.title || event.name,
      date: event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD',
      endDate: event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
      location: event.location || 'Location TBD',
      registrations: event._count?.registrations || 0,
      capacity: event.capacity || 0,
      participationMode: event.participationMode || 'HYBRID' as const,
      status: isPast ? 'completed' as const : (event.isPublished ? 'active' as const : 'draft' as const),
    };
  });

  const recentSession = dashboardData?.recentSession;

  return (
    <ProtectedRoute>
      {/* DASHBOARD HEADER */}
      <div className="border-b border-[#CBD5E1] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Dashboard</h1>
              <p className="text-sm text-[#475569] mt-1">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/events" className="px-4 py-2 bg-[#010030] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KEY PERFORMANCE INDICATORS */}
        <section className="mb-12">
          <h2 className="text-tertiary-heading mb-6">Key Metrics</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          )}
        </section>

        {/* UPCOMING EVENTS */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-tertiary-heading">Events Overview</h2>
            <Link href="/events" className="flex items-center gap-2 font-medium" style={{ color: "var(--color-primary)" }}>
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : formattedEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {formattedEvents.map((event, i) => (
                <EventCard key={i} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No upcoming events</p>
            </div>
          )}
        </section>

        {/* RECENT SESSION SUMMARY */}
        <section>
          <h2 className="text-tertiary-heading mb-6">Recent Session Summary</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : recentSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Attendance Overview */}
              <div className="card lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                  {recentSession.title}
                </h3>
                <AttendanceBadge
                  attended={recentSession.totalAttended}
                  registered={recentSession.totalRegistered}
                />

                <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
                  <h4 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                    Attendance by Center
                  </h4>
                  <div className="space-y-3">
                    {recentSession.centers?.length > 0 ? recentSession.centers.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: "var(--color-background)" }}
                      >
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {item.name}
                        </span>
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                          {item.attended}/{item.registered} ({item.registered > 0 ? Math.round((item.attended / item.registered) * 100) : 0}%)
                        </span>
                      </div>
                    )) : (
                      <p className="text-sm text-center py-4 text-gray-400">No centers defined for this event</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="card">
                  <p className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Total Capacity
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {recentSession.capacity?.toLocaleString() || "N/A"}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
                    Available across all centers
                  </p>
                </div>

                <div className="card">
                  <p className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Check-in Methods
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>QR Code / Scan</span>
                      <span className="font-medium">{recentSession.checkInMethods?.qr || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>SAC Lookup / Code</span>
                      <span className="font-medium">{recentSession.checkInMethods?.sac || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Manual Confirm</span>
                      <span className="font-medium">{recentSession.checkInMethods?.manual || 0}</span>
                    </li>
                  </ul>
                </div>

                <div className="card" style={{ backgroundColor: "var(--color-online-light)", border: "1px solid var(--color-online)" }}>
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--color-online)" }}>
                    💡 Pro Tip
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                    Enable offline mode for uninterrupted check-ins at your center.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-400">
              <p>No recent session data available.</p>
            </div>
          )}
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-12 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
          <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Register Members", href: "/members", icon: "👥" },
              { label: "Create Event", href: "/events", icon: "📅" },
              { label: "Check Attendance", href: "/kiosk", icon: "✅" },
              { label: "View Reports", href: "/reports", icon: "📊" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center justify-center p-4 rounded-lg border transition-colors group"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className="text-sm font-medium text-center" style={{ color: "var(--color-text-primary)" }}>
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
