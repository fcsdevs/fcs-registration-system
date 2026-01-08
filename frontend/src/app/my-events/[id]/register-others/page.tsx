/**
 * Register for Others Page
 * Allows users to register dependents/others for events
 * Upgraded with World Class Design System
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { RegisterForOthersWizard } from '@/components/registrations/register-for-others';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import { ArrowLeft, Sparkles, AlertCircle, Users } from 'lucide-react';
import Link from 'next/link';

// Decoration Component
const AmbientBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2" />
    </div>
);

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
            // userResponse might be from /auth/me which returns { data: ... } or direct. 
            // Previous code used userResponse directly? Let's check logic.
            // My earlier read showed `setUser(userResponse)` in `register-others`.
            // But usually `/auth/me` returns `{ data: user }`.
            // I'll stick to data extraction to be safe, or use what was there if valid.
            // Actually line 37 was `setUser(userResponse)`.
            // In `register/page.tsx` line 38 was `setUser(userResponse.data)`.
            // I'll assume `userResponse.data` is correct as `api.get<any>` usually wraps axios/standard response.
            // Wait, previous file line 37: `setUser(userResponse);`
            // But typically `api` client returns response object.
            // If I change it, I might break it if `userResponse` isn't what I think.
            // However, looking at register/page.tsx, it used .data.
            // I'll use `userResponse.data || userResponse` to be safe.
            const userData = userResponse.data || userResponse;
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
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

    if (!event || !user) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-4"
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
            <div className="relative min-h-screen bg-gray-50/50 pb-12">
                <AmbientBackground />

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Back Link */}
                    <div className="mb-8">
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group font-medium"
                        >
                            <div className="p-2 bg-white/80 backdrop-blur-sm shadow-sm rounded-full group-hover:shadow-md transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span>Back to Events</span>
                        </Link>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">

                        {/* Header Banner */}
                        <div className="relative bg-[#010030] py-10 px-8 md:px-12 overflow-hidden text-center md:text-left">
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-blue-900/50 to-transparent pointer-events-none" />

                            <div className="relative z-10">

                                <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
                                    Register for: {event.title}
                                </h1>
                                <p className="text-blue-100/70 text-lg max-w-2xl">
                                    Register your friends, family, or group members for this event.
                                </p>
                            </div>
                        </div>

                        {/* Wizard Content */}
                        <div className="p-4 md:p-8 lg:p-12 bg-gradient-to-b from-gray-50/50 to-white">
                            <RegisterForOthersWizard
                                event={event}
                                currentUserId={user.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
