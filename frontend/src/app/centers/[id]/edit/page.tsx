"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { centersApi } from "@/lib/api/centers";
import { unitsApi } from "@/lib/api/units";
import { eventsApi } from "@/lib/api/events";
import { MapPin, ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Unit } from "@/types/api";

export default function EditCenterPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [formData, setFormData] = useState({
        eventId: "",
        centerName: "",
        country: "Nigeria",
        stateId: "",
        address: "",
        isActive: true
    });

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setLoadingData(true);
            const [centerRes, eventsRes, unitsRes] = await Promise.all([
                centersApi.getById(id as string),
                eventsApi.list({ isPublished: true, limit: 100 }),
                unitsApi.list({ type: 'State', limit: 300 })
            ]);

            if (centerRes.data) {
                setFormData({
                    eventId: centerRes.data.eventId,
                    centerName: centerRes.data.centerName,
                    country: centerRes.data.country || "Nigeria",
                    stateId: centerRes.data.stateId || "",
                    address: centerRes.data.address,
                    isActive: centerRes.data.isActive
                });
            }

            const eventsData = eventsRes.data?.data || [];
            const unitsData = unitsRes.data?.data || [];

            setEvents(eventsData);
            setUnits(unitsData);

        } catch (err: any) {
            console.error("Failed to fetch initial data:", err);
            setError(err.message || "Failed to load center data");
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await centersApi.update(id as string, {
                centerName: formData.centerName,
                address: formData.address,
                isActive: formData.isActive
            });
            router.push(`/centers/${id}`);
        } catch (err: any) {
            setError(err.message || "Failed to update center");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link href={`/centers/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Center Details
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Event Center</h1>
                                <p className="text-sm text-gray-500">Update location and status for this center</p>
                            </div>
                        </div>

                        {error ? (
                            <div className="mx-8 mt-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Event (Read-only for now as changing event involves more complexity) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        Associated Event
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed">
                                        {events.find(e => e.id === formData.eventId)?.title || "Loading..."}
                                    </div>
                                    <p className="text-[10px] text-gray-400">Event cannot be changed after creation</p>
                                </div>

                                {/* State (Read-only for now) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        State / Unit
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed">
                                        {units.find(u => u.id === formData.stateId)?.name || "Loading..."}
                                    </div>
                                </div>
                            </div>

                            {/* Center Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Center Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.centerName}
                                    onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 transition-all outline-none"
                                    placeholder="e.g., Lagos Convention Center"
                                />
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Address *
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 transition-all outline-none resize-none"
                                    placeholder="Full address of the event center"
                                />
                            </div>

                            {/* Status Toggle */}
                            <div className="pt-4 flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-gray-900">Center Status</p>
                                    <p className="text-xs text-gray-500">Deactivated centers won't appear in registration flows</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${formData.isActive ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-10 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading || loadingData}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={`/centers/${id}`}
                                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
