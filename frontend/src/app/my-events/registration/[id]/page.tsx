/**
 * Registration Details Page
 * View registration details, QR code, and badge
 * Enhanced with World Class Design System
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { QRCodeDisplay } from '@/components/ui/qr-code-display';
import { Registration } from '@/types/api';
import { api } from '@/lib/api/client';
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2, Sparkles, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useModal } from '@/components/common/modal-provider';

// Decoration Component
const AmbientBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
    </div>
);

export default function RegistrationDetailsPage() {
    const params = useParams();
    const registrationId = params.id as string;
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const { confirm, alert: modalAlert } = useModal();

    useEffect(() => {
        fetchRegistration();
    }, [registrationId]);

    const fetchRegistration = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ data: Registration }>(`/registrations/${registrationId}`);
            setRegistration(response.data);
        } catch (error) {
            console.error('Failed to fetch registration:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async () => {
        const confirmed = await confirm(
            'Are you sure you want to cancel this registration? This action cannot be undone.',
            'Cancel Registration',
            'danger'
        );
        if (!confirmed) return;

        try {
            await api.delete(`/registrations/${registrationId}`);
            window.location.href = '/my-events?tab=registered';
        } catch (error: any) {
            console.error('Failed to cancel registration:', error);
            modalAlert(error.message || 'Failed to cancel registration. Please check your network and try again.', 'Error', 'danger');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!registration) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Not Found</h2>
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to My Events
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Generate QR code using public API
    const qrValue = registration.id;
    const mockQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}`;
    const mockSAC = registration.id.substring(0, 8).toUpperCase();

    return (
        <ProtectedRoute>
            <div className="relative min-h-screen bg-gray-50/50 pb-12">
                <AmbientBackground />

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link
                            href="/my-events?tab=registered"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group font-medium"
                        >
                            <div className="p-2 bg-white/80 backdrop-blur-sm shadow-sm rounded-full group-hover:shadow-md transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span>Back to My Registrations</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* LEFT COLUMN: Details (Span 7) */}
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Registration Details</h1>
                                <p className="text-gray-500 text-lg">Manage your registration and view status information.</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-6 md:p-10 relative overflow-hidden">
                                {/* Decorative top border */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                                {/* Event Header */}
                                <div className="border-b border-gray-100 pb-8 mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-4">{registration.event?.title || 'Event'}</h2>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${registration.status === 'CONFIRMED'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : registration.status === 'PENDING'
                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                : 'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}>
                                            {registration.status === 'CONFIRMED' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {registration.status}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium">
                                            Refs: {registration.id.substring(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Participant</p>
                                        <p className="font-bold text-gray-900 text-lg">{registration.member?.firstName} {registration.member?.lastName}</p>
                                        <p className="text-sm text-blue-600 font-mono bg-blue-50 inline-block px-2 py-0.5 rounded">
                                            {registration.member?.fcsCode}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mode</p>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${registration.participationMode === 'ONLINE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {registration.participationMode === 'ONLINE' ? '💻 Online' : registration.participationMode === 'HYBRID' ? '🌐 Hybrid' : '🏛️ On-site'}
                                        </div>
                                    </div>

                                    {registration.center && (
                                        <div className="space-y-1 col-span-full">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Event Center</p>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <MapPin className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{registration.center.name}</p>
                                                    <p className="text-sm text-gray-500">Designated Center</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {registration.group && (
                                        <div className="space-y-1 col-span-full">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned Group</p>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Users className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{registration.group.name}</p>
                                                    <p className="text-sm text-gray-500">Bible Study Group</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-span-full pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            Registered on {new Date(registration.registeredAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100">
                                    {/* <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                                          <Edit className="w-4 h-4" />
                                          Edit Details
                                      </button> */}
                                    <button
                                        onClick={handleCancelRegistration}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors border border-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Cancel Registration
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Badge (Span 5) */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-4 md:p-6 border border-white/50 shadow-lg relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-blue-600" />
                                        Official Badge
                                    </h2>
                                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">PRINTABLE</span>
                                </div>

                                <div className="flex justify-center">
                                    <QRCodeDisplay
                                        qrCode={mockQRCode}
                                        sac={mockSAC}
                                        eventName={registration.event?.title || 'Event'}
                                        participantName={`${registration.member?.firstName} ${registration.member?.lastName}` || 'Participant'}
                                        centerName={registration.participation?.center?.centerName || registration.center?.centerName}
                                        groupName={registration.groupAssignments?.[0]?.group?.name || registration.group?.name}
                                        category={registration.participation?.participationMode || registration.event?.participationMode || 'Delegate'}
                                        fcsCode={registration.member?.fcsCode}
                                        profilePhotoUrl={registration.member?.profilePhotoUrl}
                                        dates={registration.event?.startDate ? `${new Date(registration.event.startDate).toLocaleDateString()}` : undefined}
                                        showDownload={true}
                                        showPrint={true}
                                    />
                                </div>
                            </div>

                            {/* Instructions Card */}
                            <div className="bg-gradient-to-br from-[#060CCD] to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <div className="p-1 bg-white/20 rounded-lg">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    Event Day Guide
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-blue-50/90 leading-relaxed">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                                        Please present this badge ensuring the QR code is clearly visible for scanning at the entrance.
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-50/90 leading-relaxed">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                                        Only one person can be admitted per badge.
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-50/90 leading-relaxed">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                                        If you have any issues with scanning, provide the 8-character SAC code shown on the badge.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
