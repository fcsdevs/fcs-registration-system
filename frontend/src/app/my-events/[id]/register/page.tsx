"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { EventRegistrationForm } from '@/components/registrations/event-registration-form';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EventRegistrationPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchEventAndUser();
    }, [eventId]);

    const fetchEventAndUser = async () => {
        try {
            setLoading(true);
            const [eventResponse, userResponse] = await Promise.all([
                api.get<{ data: Event }>(`/events/${eventId}`),
                api.get<any>('/auth/me'),
            ]);
            setEvent(eventResponse.data);
            setUser(userResponse.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrationComplete = (registrationId: string) => {
        router.push(`/my-events/registration/${registrationId}`);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!event || !user) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                        <p className="text-gray-500 mb-6">The event you are looking for does not exist.</p>
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Events
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 pb-12">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Back Link */}
                    <div className="mb-6">
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Events</span>
                        </Link>
                    </div>

                    {/* Main Container */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                        {/* Header */}
                        <div className="bg-white border-b border-gray-100 p-6 md:p-8">
                            <div className="mb-2">
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                    REGISTRATION OPEN
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {event.title}
                            </h1>
                            <p className="text-gray-600">
                                {event.description}
                            </p>
                        </div>

                        {/* Form Section */}
                        <div className="p-6 md:p-8">
                            <EventRegistrationForm
                                event={event}
                                member={user.member || user}
                                isSelf={true}
                                onComplete={handleRegistrationComplete}
                            />
                        </div>

                    </div>

                    <div className="text-center text-gray-400 text-sm mt-8">
                        &copy; {new Date().getFullYear()} Fellowship of Christian Students
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
