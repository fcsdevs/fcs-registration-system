"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { Building, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const UNIT_TYPES = [
  { value: "National", label: "National" },
  { value: "Regional", label: "Regional" },
  { value: "State", label: "State" },
  { value: "Zone", label: "Zone" },
  { value: "Area", label: "Area" },
  { value: "Branch", label: "Branch" },
];

export default function NewUnitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    type: "Branch" as string,
    description: "",
    parentUnitId: "",
  });

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await api.get<any>("/units");
        const data = response.data?.data || response.data || [];
        setUnits(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch units:", err);
      } finally {
        setLoadingUnits(false);
      }
    };
    fetchUnits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/units", {
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined,
        parentUnitId: formData.parentUnitId || undefined,
      });
      router.push("/units");
    } catch (err: any) {
      setError(err.message || "Failed to create unit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/units" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Units
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Unit</h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                {error}
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
                    Unit Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {UNIT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Unit
                  </label>
                  <select
                    value={formData.parentUnitId}
                    onChange={(e) => setFormData({ ...formData, parentUnitId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingUnits}
                  >
                    <option value="">None (Root Unit)</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.type})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Optional: Select a parent unit for hierarchy</p>
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
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Unit
                    </>
                  )}
                </button>
                <Link
                  href="/units"
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
