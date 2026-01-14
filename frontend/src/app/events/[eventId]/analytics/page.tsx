"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api/events";
import { Event, EventStatistics } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Globe,
    ArrowLeft,
    TrendingUp,
    Users,
    MapPin,
    BarChart3,
    PieChart,
    Loader2,
    Calendar,
    Download,
    CheckCircle2,
    Clock
} from "lucide-react";
import { ProtectedRoute } from "@/components/common/route-guards";

export default function EventAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [stats, setStats] = useState<EventStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventRes, statsRes] = await Promise.all([
                eventsApi.getById(eventId),
                eventsApi.getStatistics(eventId)
            ]);

            setEvent(eventRes.data || null);
            setStats(statsRes.data || null);
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/events/${eventId}`)}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Event
                        </Button>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                    <Globe className="h-8 w-8 text-purple-600" />
                                    Session Insights
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    Registration and attendance metrics for <span className="font-semibold">{event?.title}</span>
                                </p>
                            </div>
                            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <MetricCard
                            title="Total Registrations"
                            value={stats?.totalRegistrations || 0}
                            icon={Users}
                            description="Cumulative total"
                        />
                        <MetricCard
                            title="Total Attendance"
                            value={stats?.totalAttendance || 0}
                            icon={CheckCircle2}
                            description="Verified check-ins"
                            color="blue"
                        />
                        <MetricCard
                            title="Attendance Rate"
                            value={`${(stats?.attendanceRate || 0).toFixed(1)}%`}
                            icon={TrendingUp}
                            description="Engagement index"
                            color="green"
                        />
                        <MetricCard
                            title="Centers Active"
                            value={stats?.centerStatistics?.length || 0}
                            icon={MapPin}
                            description="Geographic reach"
                            color="purple"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Registration by Mode */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-gray-400" />
                                    Registration Breakdown
                                </CardTitle>
                                <CardDescription>Distribution by participation mode</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.registrationsByMode?.map((item: any) => (
                                        <div key={item.mode} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-700">{item.mode}</span>
                                                <span className="text-gray-500">{item.count} ({((item.count / (stats?.totalRegistrations || 1)) * 100).toFixed(0)}%)</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.mode === 'ONSITE' ? 'bg-blue-500' : 'bg-purple-500'}`}
                                                    style={{ width: `${(item.count / (stats?.totalRegistrations || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attendance by Mode */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-gray-400" />
                                    Attendance Conversion
                                </CardTitle>
                                <CardDescription>Check-ins vs Registrations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {stats?.attendanceByMode?.map((item: any) => {
                                        const regCount = stats.registrationsByMode.find((r: any) => r.mode === item.mode)?.count || 1;
                                        const rate = (item.count / regCount) * 100;
                                        return (
                                            <div key={item.mode} className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium">{item.mode}</span>
                                                        <span className="text-gray-500">{rate.toFixed(1)}% attendance</span>
                                                    </div>
                                                    <div className="h-4 w-full bg-gray-100 rounded-lg overflow-hidden flex">
                                                        <div
                                                            className={`h-full ${item.mode === 'ONSITE' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${rate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-right min-w-[60px]">
                                                    <div className="text-sm font-bold">{item.count}</div>
                                                    <div className="text-[10px] text-gray-400">Attended</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Center Performance */}
                    {stats?.centerStatistics && stats.centerStatistics.length > 0 && (
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Geographic Distribution (Centers)</CardTitle>
                                <CardDescription>Top performing centers by attendance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-gray-500">
                                                <th className="text-left py-3 font-medium">Center Name</th>
                                                <th className="text-left py-3 font-medium">State</th>
                                                <th className="text-center py-3 font-medium">Registrations</th>
                                                <th className="text-center py-3 font-medium">Attendance</th>
                                                <th className="text-right py-3 font-medium">Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.centerStatistics.map((center: any) => (
                                                <tr key={center.centerId} className="border-b last:border-0 hover:bg-gray-50/50">
                                                    <td className="py-4 font-semibold text-gray-900">{center.centerName}</td>
                                                    <td className="py-4 text-gray-500">{center.state || 'N/A'}</td>
                                                    <td className="py-4 text-center">{center.registrations}</td>
                                                    <td className="py-4 text-center font-medium text-blue-600">{center.attendance}</td>
                                                    <td className="py-4 text-right">
                                                        <span className="px-2 py-1 rounded bg-gray-100 text-xs font-bold">
                                                            {((center.attendance / (center.registrations || 1)) * 100).toFixed(0)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

function MetricCard({ title, value, icon: Icon, description, color = "gray" }: any) {
    const colorMap: any = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-emerald-600 bg-emerald-50",
        purple: "text-purple-600 bg-purple-50",
        gray: "text-gray-600 bg-gray-50",
    };

    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${colorMap[color]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                </div>
                <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
