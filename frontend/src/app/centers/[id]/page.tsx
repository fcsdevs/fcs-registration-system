"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { centersApi } from "@/lib/api/centers";
import { MapPin, ArrowLeft, Edit, Users, Calendar, Building2, Shield, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { EventCenter, CenterStatistics } from "@/types/api";

export default function CenterDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [center, setCenter] = useState<EventCenter | null>(null);
    const [stats, setStats] = useState<CenterStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Admin Management State
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [adminSearch, setAdminSearch] = useState("");
    const [addingAdmin, setAddingAdmin] = useState(false);
    const [adminSearchError, setAdminSearchError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCenterDetails();
        }
    }, [id]);

    const fetchCenterDetails = async () => {
        try {
            setLoading(true);
            const [centerRes, statsRes] = await Promise.all([
                centersApi.getById(id as string),
                centersApi.getStatistics(id as string)
            ]);

            if (centerRes.data) setCenter(centerRes.data);
            if (statsRes.data) setStats(statsRes.data);
        } catch (err: any) {
            console.error("Failed to fetch center details:", err);
            setError(err.message || "Failed to load center details");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to deactivate this center? It will no longer be available for new registrations.")) {
            return;
        }

        try {
            await centersApi.deactivate(id as string);
            router.push("/centers");
        } catch (err: any) {
            alert(err.message || "Failed to deactivate center");
        }
    };

    const handleAddAdmin = async () => {
        if (!adminSearch) return;

        try {
            setAddingAdmin(true);
            setAdminSearchError(null);

            // Note: In a real app, you might search for a user first to get their ID.
            // Here we assume the input is the user ID or we have an endpoint that takes email.
            // The current centersApi.addAdmin takes a userId.
            // For simplicity, let's assume the user has to provide a valid userId if we don't have a search API.
            // Better: we should have a search endpoint for users.

            await centersApi.addAdmin(id as string, adminSearch);

            setAdminSearch("");
            setShowAddAdmin(false);
            fetchCenterDetails(); // Refresh
        } catch (err: any) {
            setAdminSearchError(err.message || "Failed to add admin. Make sure you provided a valid User ID.");
        } finally {
            setAddingAdmin(false);
        }
    };

    const handleRemoveAdmin = async (userId: string) => {
        if (!window.confirm("Are you sure you want to remove this admin?")) return;

        try {
            await centersApi.removeAdmin(id as string, userId);
            fetchCenterDetails(); // Refresh
        } catch (err: any) {
            alert(err.message || "Failed to remove admin");
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !center) {
        return (
            <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center">
                        <h2 className="text-xl font-bold mb-2">Error Loading Center</h2>
                        <p>{error || "Center not found"}</p>
                        <Link href="/centers" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Centers
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Link href="/centers" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors mb-4">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Centers
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                {center.centerName}
                                {center.isActive ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Inactive
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-500 mt-1 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" /> {center.address}, {typeof center.state === 'object' ? center.state?.name : center.state}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/centers/${id}/edit`}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <Edit className="w-4 h-4 mr-2 text-primary" /> Edit Center
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all shadow-sm"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Deactivate
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatBox
                            title="Registrations"
                            value={stats?.registrations || 0}
                            icon={Users}
                            color="blue"
                        />
                        <StatBox
                            title="Attendance"
                            value={stats?.attendance || 0}
                            icon={CheckCircle2}
                            color="green"
                        />
                        <StatBox
                            title="Groups"
                            value={stats?.groups || 0}
                            icon={Building2}
                            color="purple"
                        />
                        <StatBox
                            title="Admins"
                            value={center.admins?.length || 0}
                            icon={Shield}
                            color="amber"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Center Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">{center.event?.title || "Event Title"}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Participation Mode: <span className="font-medium text-gray-900">{center.event?.participationMode}</span>
                                            </p>
                                            <Link
                                                href={`/events/${center.eventId}`}
                                                className="text-sm text-blue-600 font-medium hover:underline mt-2 inline-block"
                                            >
                                                View Event Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Map Placeholder or more info */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Location Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Address</p>
                                            <p className="text-sm text-gray-600">{center.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">State / Unit</p>
                                            <p className="text-sm text-gray-600">{typeof center.state === 'object' ? center.state?.name : center.state}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admins Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">Admins</h2>
                                    <button
                                        onClick={() => setShowAddAdmin(!showAddAdmin)}
                                        className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                                    >
                                        {showAddAdmin ? "Cancel" : "Add"}
                                    </button>
                                </div>

                                {showAddAdmin && (
                                    <div className="p-4 bg-primary/5 border-b border-primary/10 animate-in slide-in-from-top-2">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Assign by User ID</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={adminSearch}
                                                onChange={(e) => setAdminSearch(e.target.value)}
                                                placeholder="Paste User ID here..."
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary"
                                            />
                                            <button
                                                onClick={handleAddAdmin}
                                                disabled={addingAdmin || !adminSearch}
                                                className="px-3 py-2 bg-primary text-white text-sm font-bold rounded-lg disabled:opacity-50"
                                            >
                                                {addingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                                            </button>
                                        </div>
                                        {adminSearchError && <p className="text-[10px] text-red-500 mt-1">{adminSearchError}</p>}
                                    </div>
                                )}

                                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                                    {center.admins && center.admins.length > 0 ? (
                                        center.admins.map((admin: any) => (
                                            <div key={admin.id} className="p-4 flex items-center gap-3 group">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary font-bold">
                                                    {admin.user?.email?.charAt(0).toUpperCase() || "A"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{admin.user?.email}</p>
                                                    <p className="text-xs text-gray-500 truncate">{admin.user?.phoneNumber}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveAdmin(admin.user?.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Remove Admin"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Shield className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">No admins assigned</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function StatBox({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: "blue" | "green" | "purple" | "amber" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        amber: "bg-amber-50 text-amber-600"
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
    );
}
