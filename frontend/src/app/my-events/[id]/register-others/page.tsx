/**
 * Register for Others Page
 * Allows users to register dependents for events
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { Header } from '@/components/layout/header';
import { RegisterForOthersWizard } from '@/components/registrations/register-for-others';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterForOthersPage() {
    const params = useParams();
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
            setUser(userResponse);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!event || !user) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <Header />
                    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <div className="min-h-screen bg-gray-50">
                <Header />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <Link
                        href="/my-events"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Events
                    </Link>

                    {/* Event Header */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h1 className="text-3xl font-bold text-[#010030] mb-2">Register for: {event.title}</h1>
                        <p className="text-gray-600">{event.description}</p>
                    </div>

                    {/* Register for Others Wizard */}
                    <RegisterForOthersWizard
                        event={event}
                        currentUserId={user.id}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
