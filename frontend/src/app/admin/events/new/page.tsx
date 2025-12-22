"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAdmin } from "@/context/admin-context";
import { api } from "@/lib/api/client";
import { Calendar, ArrowLeft, Save, Lock } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function NewAdminEventPage() {
    const router = useRouter();
    const { currentScope, isLoading: isScopeLoading } = useAdmin();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        registrationStart: "",
        registrationEnd: "",
        participationMode: "ONSITE" as "ONLINE" | "ONSITE" | "HYBRID",
        capacity: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentScope) return;

        setError(null);
        setLoading(true);

        try {
            await api.post("/events", {
                title: formData.title,
                description: formData.description || undefined,
                unitId: currentScope.unitId, // LOCKED to current scope
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                registrationStart: new Date(formData.registrationStart).toISOString(),
                registrationEnd: new Date(formData.registrationEnd).toISOString(),
                participationMode: formData.participationMode,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
            });
            router.push("/admin/events");
        } catch (err: any) {
            setError(err.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    if (isScopeLoading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
    }

    if (!currentScope) {
        return <div className="p-8 text-center text-red-600">Access Denied: No administrative scope found.</div>;
    }

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/events" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., Annual Conference 2025"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Describe your event..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organizational Unit (Locked)
                            </label>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                                <Lock className="w-4 h-4" />
                                <span>{currentScope.name} ({currentScope.level})</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">You can only create events for your assigned jurisdiction.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Registration Start *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.registrationStart}
                                    onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Registration End *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.registrationEnd}
                                    onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Start Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event End Date *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Participation Mode *
                                </label>
                                <select
                                    required
                                    value={formData.participationMode}
                                    onChange={(e) => setFormData({ ...formData, participationMode: e.target.value as "ONLINE" | "ONSITE" | "HYBRID" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="ONSITE">On-site</option>
                                    <option value="ONLINE">Online</option>
                                    <option value="HYBRID">Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Create Event
                                    </>
                                )}
                            </button>
                            <Link
                                href="/admin/events"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
