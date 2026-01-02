"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { Building, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

const UNIT_TYPES = [
    { value: "National", label: "National" },
    { value: "Regional", label: "Regional" },
    { value: "State", label: "State" },
    { value: "Zone", label: "Zone" },
    { value: "Area", label: "Area" },
    { value: "Branch", label: "Branch" },
];

export default function EditUnitPage() {
    const router = useRouter();
    const params = useParams();
    const unitId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [units, setUnits] = useState<any[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        type: "Branch" as string,
        description: "",
        parentUnitId: "",
    });

    // Fetch the unit to edit
    useEffect(() => {
        const fetchUnit = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get<any>(`/units/${unitId}`);
                const unitData = response.data || response;

                setFormData({
                    name: unitData.name || "",
                    type: unitData.type || "Branch",
                    description: unitData.description || "",
                    parentUnitId: unitData.parentId || "",
                });
            } catch (err: any) {
                console.error("Failed to fetch unit:", err);
                setError(err.message || "Failed to load unit details");
            } finally {
                setLoading(false);
            }
        };
        fetchUnit();
    }, [unitId]);

    // Fetch all units for parent selection
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await api.get<any>("/units");
                const data = response.data?.data || response.data || [];
                // Filter out the current unit and its children to prevent circular references
                const filteredUnits = Array.isArray(data)
                    ? data.filter((unit: any) => unit.id !== unitId)
                    : [];
                setUnits(filteredUnits);
            } catch (err) {
                console.error("Failed to fetch units:", err);
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchUnits();
    }, [unitId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setSaving(true);

        try {
            await api.put(`/units/${unitId}`, {
                name: formData.name,
                description: formData.description || undefined,
                // Note: type and parentUnitId might not be editable depending on backend logic
            });

            setSuccessMessage("Unit updated successfully!");
            setTimeout(() => {
                router.push(`/units/${unitId}`);
            }, 1000);
        } catch (err: any) {
            setError(err.message || "Failed to update unit");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link
                        href={`/units/${unitId}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Unit Details
                    </Link>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Building className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Edit Unit</h1>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Lagos State Unit"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                        disabled
                                    >
                                        {UNIT_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-sm text-gray-500">Unit type cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parent Unit
                                    </label>
                                    <select
                                        value={formData.parentUnitId}
                                        onChange={(e) => setFormData({ ...formData, parentUnitId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                        disabled
                                    >
                                        <option value="">None (Root Unit)</option>
                                        {units.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name} ({unit.type})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-sm text-gray-500">Parent unit cannot be changed</p>
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
                                    placeholder="Describe this organizational unit..."
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={`/units/${unitId}`}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
