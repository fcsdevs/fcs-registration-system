"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    User,
    Shield,
    CheckCircle,
    XCircle,
    Building2,
    Users,
    UserCheck
} from "lucide-react";
import Link from "next/link";

interface Member {
    id: string;
    firstName: string;
    lastName: string;
    fcsCode: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    authUserId?: string;
    unit?: {
        id: string;
        name: string;
        type: string;
    };
    center?: {
        id: string;
        name: string;
    };
    group?: {
        id: string;
        name: string;
    };
}

export default function MemberDetailPage() {
    const params = useParams();
    const memberId = params.id as string;

    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMember();
    }, [memberId]);

    const fetchMember = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get<any>(`/members/${memberId}`);
            const memberData = response.data || response;
            setMember(memberData);
        } catch (err: any) {
            console.error("Failed to fetch member:", err);
            setError(err.message || "Failed to load member details");
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

    if (error || !member) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Link
                            href="/members"
                            className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Members
                        </Link>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Member Not Found
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error || "The member you're looking for doesn't exist."}
                            </p>
                            <Link
                                href="/members"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Return to Members
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 pb-12 w-full overflow-x-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link
                        href="/members"
                        className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Members
                    </Link>

                    {/* Header Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="p-4 sm:p-6 sm:py-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                        {member.firstName?.[0]}
                                        {member.lastName?.[0]}
                                    </div>
                                    {/* Name & Status */}
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                            {member.firstName} {member.lastName}
                                        </h1>
                                        <div className="flex items-center gap-3">
                                            <p className="text-gray-600 font-mono text-sm">
                                                {member.fcsCode}
                                            </p>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {member.isActive ? (
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
                                        href={`/members/${member.id}/roles`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Manage Roles
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-600" />
                                Contact Information
                            </h2>
                            <div className="space-y-4">
                                {member.email && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Email
                                        </label>
                                        <p className="text-gray-900 mt-1 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {member.email}
                                        </p>
                                    </div>
                                )}
                                {member.phoneNumber && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Phone Number
                                        </label>
                                        <p className="text-gray-900 mt-1 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            {member.phoneNumber}
                                        </p>
                                    </div>
                                )}
                                {!member.email && !member.phoneNumber && (
                                    <p className="text-gray-500 italic">No contact information available</p>
                                )}
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Personal Information
                            </h2>
                            <div className="space-y-4">
                                {member.dateOfBirth && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Date of Birth
                                        </label>
                                        <p className="text-gray-900 mt-1 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {new Date(member.dateOfBirth).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {member.gender && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Gender
                                        </label>
                                        <p className="text-gray-900 mt-1">{member.gender}</p>
                                    </div>
                                )}
                                {!member.dateOfBirth && !member.gender && (
                                    <p className="text-gray-500 italic">No personal information available</p>
                                )}
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Location
                            </h2>
                            <div className="space-y-4">
                                {member.address && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Address
                                        </label>
                                        <p className="text-gray-900 mt-1">{member.address}</p>
                                    </div>
                                )}
                                {member.city && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            City
                                        </label>
                                        <p className="text-gray-900 mt-1">{member.city}</p>
                                    </div>
                                )}
                                {member.state && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            State
                                        </label>
                                        <p className="text-gray-900 mt-1">{member.state}</p>
                                    </div>
                                )}
                                {member.country && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Country
                                        </label>
                                        <p className="text-gray-900 mt-1">{member.country}</p>
                                    </div>
                                )}
                                {!member.address && !member.city && !member.state && !member.country && (
                                    <p className="text-gray-500 italic">No location information available</p>
                                )}
                            </div>
                        </div>

                        {/* Organization Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                Organization
                            </h2>
                            <div className="space-y-4">
                                {member.unit && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Unit
                                        </label>
                                        <p className="text-gray-900 mt-1">
                                            {member.unit.name}
                                            {member.unit.type && (
                                                <span className="text-gray-500 text-sm ml-2">
                                                    ({member.unit.type})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                                {member.center && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Center
                                        </label>
                                        <p className="text-gray-900 mt-1">{member.center.name}</p>
                                    </div>
                                )}
                                {member.group && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Group
                                        </label>
                                        <p className="text-gray-900 mt-1">{member.group.name}</p>
                                    </div>
                                )}
                                {!member.unit && !member.center && !member.group && (
                                    <p className="text-gray-500 italic">No organization information available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mt-6 w-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            System Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Member Since
                                </label>
                                <p className="text-gray-900 mt-1">
                                    {new Date(member.createdAt).toLocaleDateString("en-US", {
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
                                    {new Date(member.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            {member.authUserId && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Auth User ID
                                    </label>
                                    <p className="text-gray-900 mt-1 font-mono text-xs">
                                        {member.authUserId}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
