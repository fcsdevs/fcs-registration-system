"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { Users, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const GROUP_TYPES = [
    { value: "BIBLE_STUDY", label: "Bible Study" },
    { value: "WORKSHOP", label: "Workshop" },
    { value: "BREAKOUT", label: "Breakout Session" },
];

export default function EditGroupPage() {
    const router = useRouter();
    const params = useParams();
    const groupId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        type: "BIBLE_STUDY" as string,
        description: "",
        capacity: "",
        eventName: "",
    });

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const response = await api.get<any>(`/groups/${groupId}`);
                const group = response.data || response;
                if (group) {
                    setFormData({
                        name: group.name || "",
                        type: group.type || "BIBLE_STUDY",
                        description: group.description || "",
                        capacity: group.capacity ? group.capacity.toString() : "",
                        eventName: group.event?.title || "Unknown Event",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch group:", err);
                setError("Failed to load group details");
            } finally {
                setLoadingData(false);
            }
        };
        if (groupId) fetchGroup();
    }, [groupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.put(`/groups/${groupId}`, {
                name: formData.name,
                description: formData.description || undefined,
                capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
            });
            router.push(`/groups/${groupId}`);
        } catch (err: any) {
            setError(err.message || "Failed to update group");
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href={`/groups/${groupId}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Group Details
                </Link>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Edit Group</h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event (Read Only)
                            </label>
                            <input
                                type="text"
                                disabled
                                value={formData.eventName}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Group Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Group Type (Cannot be changed)
                                </label>
                                <select
                                    disabled
                                    value={formData.type}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                >
                                    {GROUP_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Maximum members"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Update Group
                                    </>
                                )}
                            </button>
                            <Link
                                href={`/groups/${groupId}`}
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
