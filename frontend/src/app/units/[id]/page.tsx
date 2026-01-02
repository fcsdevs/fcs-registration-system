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
    Trash2,
    Network,
    FileText,
    TrendingUp
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
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !unit) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Link
                            href="/units"
                            className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Units
                        </Link>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Unit Not Found
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error || "The unit you're looking for doesn't exist."}
                            </p>
                            <Link
                                href="/units"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <div className="min-h-screen bg-gray-50 pb-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link
                        href="/units"
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Units
                    </Link>

                    {/* Header Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="px-6 py-8">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                        <Building className="w-10 h-10" />
                                    </div>
                                    {/* Name & Status */}
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                            {unit.name}
                                        </h1>
                                        <div className="flex items-center gap-3">
                                            <p className="text-gray-600 font-mono text-sm">
                                                {unit.code}
                                            </p>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-sm text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                                {unit.type}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${unit.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
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

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/units/${unit.id}/edit`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Unit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Members</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {unit.memberCount || 0}
                                    </p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Events</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {unit.eventCount || 0}
                                    </p>
                                </div>
                                <Calendar className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Child Units</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {unit.childUnitCount || 0}
                                    </p>
                                </div>
                                <Network className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Basic Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Unit Name
                                    </label>
                                    <p className="text-gray-900 mt-1">{unit.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Unit Code
                                    </label>
                                    <p className="text-gray-900 mt-1 font-mono">{unit.code}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Unit Type
                                    </label>
                                    <p className="text-gray-900 mt-1">{unit.type}</p>
                                </div>
                                {unit.description && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Description
                                        </label>
                                        <p className="text-gray-900 mt-1">{unit.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hierarchy Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Network className="w-5 h-5 text-blue-600" />
                                Hierarchy
                            </h2>
                            <div className="space-y-4">
                                {unit.parentUnit ? (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Parent Unit
                                        </label>
                                        <Link
                                            href={`/units/${unit.parentUnit.id}`}
                                            className="text-blue-600 hover:text-blue-700 mt-1 block"
                                        >
                                            {unit.parentUnit.name}
                                        </Link>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Parent Unit
                                        </label>
                                        <p className="text-gray-500 italic mt-1">No parent unit</p>
                                    </div>
                                )}

                                {unit.childUnits && unit.childUnits.length > 0 ? (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                                            Child Units ({unit.childUnits.length})
                                        </label>
                                        <div className="space-y-2">
                                            {unit.childUnits.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={`/units/${child.id}`}
                                                    className="block text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Child Units
                                        </label>
                                        <p className="text-gray-500 italic mt-1">No child units</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Leadership Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Leadership
                            </h2>
                            <div className="space-y-4">
                                {unit.leader ? (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Unit Leader
                                            </label>
                                            <p className="text-gray-900 mt-1">{unit.leader.name}</p>
                                        </div>
                                        {unit.leader.email && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    Email
                                                </label>
                                                <p className="text-gray-900 mt-1">{unit.leader.email}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 italic">No leader assigned</p>
                                )}
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Statistics
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Members</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {unit.memberCount || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Events</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {unit.eventCount || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Child Units</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {unit.childUnitCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            System Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Created
                                </label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(unit.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Last Updated
                                </label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(unit.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Unit ID
                                </label>
                                <p className="text-gray-900 mt-1 font-mono text-xs">
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
