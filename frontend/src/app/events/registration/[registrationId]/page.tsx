/**
 * Public Registration Dashboard
 * After registration, users land here with their unique access token
 * NO LOGIN REQUIRED - token-based access
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Calendar, User, Mail, Phone, MapPin, Users, Edit2, Printer, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { QRCodeDisplay } from '@/components/ui/qr-code-display';
import { api } from '@/lib/api/client';

interface Registration {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    participationMode: string;
    qrCode?: string;
    sac?: string;
    event: {
        id: string;
        title: string;
        description: string;
        startDate: string;
        endDate: string;
        participationMode: string;
    };
    center?: {
        id: string;
        name: string;
        address: string;
    };
    group?: {
        id: string;
        name: string;
    };
}

export default function PublicRegistrationDashboard() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const registrationId = params.registrationId as string;
    const token = searchParams.get('token');

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'badge' | 'profile'>('badge');
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
    });

    useEffect(() => {
        if (!token) {
            // No token - can't access
            return;
        }
        fetchRegistration();
    }, [registrationId, token]);

    const fetchRegistration = async () => {
        try {
            setLoading(true);
            // Public endpoint with token authentication
            const response = await api.get<{ data: Registration }>(
                `/registrations/public/${registrationId}?token=${token}`
            );
            setRegistration(response.data);
            setEditData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
            });
        } catch (error) {
            console.error('Failed to fetch registration:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            await api.put(`/registrations/public/${registrationId}?token=${token}`, {
                firstName: editData.firstName,
                lastName: editData.lastName,
            });

            // Update local state
            if (registration) {
                setRegistration({
                    ...registration,
                    firstName: editData.firstName,
                    lastName: editData.lastName,
                });
            }

            setEditMode(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            alert(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleRegisterOthers = () => {
        // Navigate to public register others page
        router.push(`/events/register/${registration?.event.id}/others?primaryToken=${token}`);
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600">This page requires a valid access token. Please use the link sent to your email.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Not Found</h2>
                    <p className="text-gray-600">This registration may have been cancelled or the link is invalid.</p>
                </div>
            </div>
        );
    }

    // Generate mock QR and SAC (will come from backend in production)
    const qrCode = registration.qrCode || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' width='200' height='200'/%3E%3Cg fill='%23000000'%3E%3Crect x='20' y='20' width='20' height='20'/%3E%3Crect x='60' y='20' width='20' height='20'/%3E%3C/g%3E%3C/svg%3E`;
    const sac = registration.sac || registration.id.substring(0, 8).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-green-900 mb-2">Registration Successful!</h2>
                            <p className="text-green-700 mb-3">
                                You're registered for <strong>{registration.event.title}</strong>.
                            </p>
                            {searchParams.get('fcsCode') && (
                                <div className="bg-white border-2 border-green-300 rounded-lg p-4 mt-3">
                                    <p className="text-sm text-green-800 font-semibold mb-1">Your FCS Code (Required for future login)</p>
                                    <div className="flex items-center gap-3">
                                        <code className="text-2xl font-bold text-[#010030] bg-gray-100 px-4 py-2 rounded border-2 border-gray-300">
                                            {searchParams.get('fcsCode')}
                                        </code>
                                        <div className="text-xs text-gray-600">
                                            <p>• Save this code</p>
                                            <p>• Use it to login next time</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-700">{successMessage}</p>
                    </div>
                )}

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <button
                        onClick={() => setActiveTab('badge')}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${activeTab === 'badge'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${activeTab === 'badge' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                                }`}>
                                <Printer className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Print Your Badge</h3>
                                <p className="text-sm text-gray-600">View and print your registration tag</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${activeTab === 'profile'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-600'
                                }`}>
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">My Profile</h3>
                                <p className="text-sm text-gray-600">View and edit your details</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Register Others Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-600 rounded-lg">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Register Others</h3>
                                <p className="text-sm text-gray-600">Register your family members or friends for this event</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRegisterOthers}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Register Others
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'badge' && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Registration Badge</h2>

                                <div className="mb-6">
                                    <QRCodeDisplay
                                        qrCode={qrCode}
                                        sac={sac}
                                        eventName={registration.event.title}
                                        participantName={`${registration.firstName} ${registration.lastName}`}
                                        showDownload={true}
                                        showPrint={true}
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Event Day Instructions</h3>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Bring your printed badge or show the QR code on your phone</li>
                                        <li>• Arrive 15 minutes early for check-in</li>
                                        <li>• Have your SAC ready as a backup</li>
                                        {registration.center && <li>• Report to {registration.center.name}</li>}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                                    {!editMode ? (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditMode(false);
                                                    setEditData({
                                                        firstName: registration.firstName,
                                                        lastName: registration.lastName,
                                                    });
                                                }}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={editData.firstName}
                                                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-900">{registration.firstName}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={editData.lastName}
                                                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-900">{registration.lastName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                            <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                                        </label>
                                        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{registration.email}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                            <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
                                        </label>
                                        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">{registration.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Event Info Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Event</p>
                                    <p className="font-semibold text-gray-900">{registration.event.title}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900">
                                            {new Date(registration.event.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
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
                                        <p className="text-sm text-gray-600">Center</p>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{registration.center.name}</p>
                                                <p className="text-xs text-gray-600">{registration.center.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {registration.group && (
                                    <div>
                                        <p className="text-sm text-gray-600">Bible Study Group</p>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{registration.group.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="font-semibold text-amber-900 mb-2">Save This Link!</h4>
                            <p className="text-sm text-amber-700">
                                Bookmark this page or save the link from your email. You'll need it to access your badge and registration details.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
