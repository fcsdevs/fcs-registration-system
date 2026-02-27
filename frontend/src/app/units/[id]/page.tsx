"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    Building,
    Users,
    Calendar,
    CheckCircle,
    XCircle,
    Edit,
    Network,
    FileText,
    TrendingUp,
    MapPin,
    Mail,
    Phone
} from "lucide-react";
import Link from "next/link";
import { Unit } from "@/types/api";

export default function UnitDetailPage() {
    const params = useParams();
    const unitId = params.id as string;

    const [unit, setUnit] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUnit();
    }, [unitId]);

    const fetchUnit = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get<any>(`/units/${unitId}`);
            const unitData = response.data || response;
            setUnit(unitData);
        } catch (err: any) {
            console.error("Failed to fetch unit:", err);
            setError(err.message || "Failed to load unit details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading unit details...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !unit) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Link
                            href="/units"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Units
                        </Link>
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Unit Not Found
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error || "The unit you're looking for doesn't exist."}
                            </p>
                            <Link
                                href="/units"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Return to Units
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Back Button */}
                    <Link
                        href="/units"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors font-medium group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Units
                    </Link>

                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    {/* Icon */}
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white shadow-md">
                                        <Building className="w-8 h-8" />
                                    </div>
                                    {/* Name & Status */}
                                    <div className="text-white">
                                        <h1 className="text-2xl font-bold mb-1">
                                            {unit.name}
                                        </h1>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-mono text-sm bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md">
                                                {unit.code}
                                            </p>
                                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-md text-sm font-medium">
                                                {unit.type}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${unit.isActive
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-500 text-white"
                                                    }`}
                                            >
                                                {unit.isActive ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link
                                    href={`/units/${unit.id}/edit`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold text-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Unit
                                </Link>
                            </div>
                        </div>

                        {/* Description */}
                        {unit.description && (
                            <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                <p className="text-gray-700 text-sm leading-relaxed">{unit.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Total Members</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {unit.memberCount || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Total Events</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        {unit.eventCount || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Child Units</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        {unit.childUnitCount || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm">
                                    <Network className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-md">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                Basic Information
                            </h2>
                            <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                        Unit Name
                                    </label>
                                    <p className="text-gray-800 font-semibold text-base">{unit.name}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                        Unit Code
                                    </label>
                                    <p className="text-gray-800 font-mono font-semibold text-base">{unit.code}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                        Unit Type
                                    </label>
                                    <p className="text-gray-800 font-semibold text-base">{unit.type}</p>
                                </div>
                            </div>
                        </div>

                        {/* Hierarchy Information */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 rounded-md">
                                    <Network className="w-5 h-5 text-purple-600" />
                                </div>
                                Hierarchy
                            </h2>
                            <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                        Parent Unit
                                    </label>
                                    {unit.parentUnit ? (
                                        <Link
                                            href={`/units/${unit.parentUnit.id}`}
                                            className="text-blue-600 hover:text-blue-700 font-semibold text-base flex items-center gap-2 group"
                                        >
                                            {unit.parentUnit.name}
                                            <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">No parent unit</p>
                                    )}
                                </div>

                                {unit.childUnits && unit.childUnits.length > 0 ? (
                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                            Child Units ({unit.childUnits.length})
                                        </label>
                                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                                            {unit.childUnits.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={`/units/${child.id}`}
                                                    className="block text-blue-600 hover:text-blue-700 hover:bg-white px-3 py-1.5 rounded-md transition-all font-semibold text-sm group"
                                                >
                                                    <span className="flex items-center justify-between">
                                                        {child.name}
                                                        <ArrowLeft className="w-3 h-3 rotate-180 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            Child Units
                                        </label>
                                        <p className="text-gray-400 italic text-sm">No child units</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Leadership Information */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 rounded-md">
                                    <Users className="w-5 h-5 text-green-600" />
                                </div>
                                Leadership
                            </h2>
                            <div className="space-y-3">
                                {unit.leader ? (
                                    <>
                                        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                                Unit Leader
                                            </label>
                                            <p className="text-gray-800 font-semibold text-base">{unit.leader.name}</p>
                                        </div>
                                        {unit.leader.email && (
                                            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                                    Email
                                                </label>
                                                <a
                                                    href={`mailto:${unit.leader.email}`}
                                                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2"
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {unit.leader.email}
                                                </a>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                        <p className="text-gray-400 italic text-sm">No leader assigned</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Overview Section */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="p-1.5 bg-orange-100 rounded-md">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                </div>
                                Overview
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <span className="text-gray-600 font-semibold text-sm">Registration Status</span>
                                    <span className="text-sm font-bold text-blue-600">Active</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <span className="text-gray-600 font-semibold text-sm">Last Event Date</span>
                                    <span className="text-sm font-bold text-green-600">N/A</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                    <span className="text-gray-600 font-semibold text-sm">Unit Status</span>
                                    <span className="text-sm font-bold text-emerald-600">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mt-4 hover:shadow-lg transition-shadow">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            System Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                    Created
                                </label>
                                <p className="text-gray-800 font-semibold text-sm">
                                    {new Date(unit.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                    Last Updated
                                </label>
                                <p className="text-gray-800 font-semibold text-sm">
                                    {new Date(unit.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                    Internal ID
                                </label>
                                <p className="text-gray-800 font-mono text-xs break-all">
                                    {unit.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
