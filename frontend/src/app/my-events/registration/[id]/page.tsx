/**
 * Registration Details Page
 * View registration details, QR code, and badge
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { Header } from '@/components/layout/header';
import { QRCodeDisplay } from '@/components/ui/qr-code-display';
import { Registration } from '@/types/api';
import { api } from '@/lib/api/client';
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationDetailsPage() {
    const params = useParams();
    const registrationId = params.id as string;
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);

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
        if (!confirm('Are you sure you want to cancel this registration?')) return;

        try {
            await api.delete(`/registrations/${registrationId}`);
            window.location.href = '/my-events?tab=registered';
        } catch (error) {
            console.error('Failed to cancel registration:', error);
            alert('Failed to cancel registration. Please try again.');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!registration) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Not Found</h2>
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to My Events
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    // Generate mock QR code (in real implementation, this would come from backend)
    const mockQRCode = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' width='200' height='200'/%3E%3Cg fill='%23000000'%3E%3Crect x='20' y='20' width='20' height='20'/%3E%3Crect x='60' y='20' width='20' height='20'/%3E%3Crect x='100' y='20' width='20' height='20'/%3E%3Crect x='140' y='20' width='20' height='20'/%3E%3Crect x='20' y='60' width='20' height='20'/%3E%3Crect x='60' y='60' width='20' height='20'/%3E%3Crect x='100' y='60' width='20' height='20'/%3E%3Crect x='140' y='60' width='20' height='20'/%3E%3C/g%3E%3C/svg%3E`;
    const mockSAC = registration.id.substring(0, 8).toUpperCase();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link
                        href="/my-events"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Events
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Registration Details */}
                        <div>
                            <h1 className="text-3xl font-bold text-[#010030] mb-6">Registration Details</h1>

                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {registration.event?.name || 'Event'}
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Participant</p>
                                        <p className="font-semibold text-gray-900">{registration.member?.name}</p>
                                        <p className="text-sm text-gray-500">FCS Code: {registration.member?.fcsCode}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Participation Mode</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${registration.participationMode === 'ONLINE'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {registration.participationMode}
                                        </span>
                                    </div>

                                    {registration.center && (
                                        <div>
                                            <p className="text-sm text-gray-600">Event Center</p>
                                            <div className="flex items-start gap-2 mt-1">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{registration.center.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {registration.group && (
                                        <div>
                                            <p className="text-sm text-gray-600">Bible Study Group</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <p className="font-semibold text-gray-900">{registration.group.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${registration.status === 'CONFIRMED'
                                            ? 'bg-green-100 text-green-700'
                                            : registration.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {registration.status}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Registered On</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{new Date(registration.registeredAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Registration
                                </button>
                                <button
                                    onClick={handleCancelRegistration}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>

                        {/* QR Code and Badge */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Badge</h2>
                            <QRCodeDisplay
                                qrCode={mockQRCode}
                                sac={mockSAC}
                                eventName={registration.event?.name || 'Event'}
                                participantName={registration.member?.name || 'Participant'}
                                showDownload={true}
                                showPrint={true}
                            />

                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">Event Day Instructions</h3>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Bring your printed badge or show QR code on your phone</li>
                                    <li>• Arrive 15 minutes early for check-in</li>
                                    <li>• Have your SAC ready if QR scanning isn't available</li>
                                    {registration.center && <li>• Report to {registration.center.name}</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
