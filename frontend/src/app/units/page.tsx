"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { Building, Plus, Users, Search, RotateCw, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useModal } from "@/components/common/modal-provider";

export default function UnitPage() {
  const { confirm, alert } = useModal();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const UNIT_TYPES = ["All", "National", "Area", "State", "Zone", "Branch"];

  useEffect(() => {
    fetchUnits();

    // Also refetch when the page becomes visible (user returns from another page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnits();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>("/units");
      const data = response.data?.data || response.data || response || [];
      setUnits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = await confirm(
      `Are you sure you want to deactivate the unit "${name}"? This action can be undone by an administrator.`,
      "Deactivate Unit",
      "danger"
    );

    if (!isConfirmed) return;

    try {
      await api.delete(`/units/${id}`);
      await alert(`Unit "${name}" has been deactivated successfully.`, "Success", "success");
      fetchUnits(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to deactivate unit:", error);
      await alert(error.message || "Failed to deactivate unit. Please try again.", "Error", "danger");
    }
  };

  const filteredUnits = Array.isArray(units) ? units.filter((unit) => {
    const matchesSearch = unit.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || unit.type === typeFilter;
    const isActive = unit.isActive !== false; // Only show active units
    return matchesSearch && matchesType && isActive;
  }) : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Units</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage organizational units</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchUnits}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                  title="Refresh units list"
                >
                  <RotateCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  href="/units/new"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Unit
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Units</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{units.filter(u => u.isActive !== false).length}</p>
                </div>
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
                    {units.filter(u => u.isActive !== false).reduce((sum, u) => sum + (u.memberCount || 0), 0)}
                  </p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Units List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No units found</h3>
              <p className="text-gray-600 mb-6">Create your first organizational unit</p>
              <Link
                href="/units/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Unit
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnits.map((unit) => (
                <div key={unit.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${unit.type === 'National' ? 'bg-purple-100 text-purple-700' :
                          unit.type === 'State' ? 'bg-blue-100 text-blue-700' :
                            unit.type === 'Zone' ? 'bg-orange-100 text-orange-700' :
                              unit.type === 'Area' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {unit.type}
                        </span>
                        {unit.parent?.name && (
                          <span className="text-[10px] text-gray-400 font-medium italic">
                            under {unit.parent.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{unit.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{unit.description || "No description provided."}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{unit.memberCount || 0} members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/units/${unit.id}`}
                        className="flex-1 text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/units/${unit.id}/edit`}
                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit Unit"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(unit.id, unit.name)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Deactivate Unit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
