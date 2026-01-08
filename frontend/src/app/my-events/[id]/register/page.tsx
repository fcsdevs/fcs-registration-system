/**
 * Event Registration Page
 * Self-registration for a specific event
 * Upgraded with World Class UI
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { EventRegistrationWizard } from '@/components/registrations/event-registration-wizard';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Decoration Component
const AmbientBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2" />
    </div>
);

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
                        <p className="text-gray-500 mb-6">The event you are looking for does not exist or has been removed.</p>
                        <Link
                            href="/my-events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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

                        {/* Event Hero Header */}
                        <div className="relative bg-[#010030] py-12 px-8 md:px-12 overflow-hidden text-center md:text-left">
                            {/* Decorative gradients */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-blue-900/50 to-transparent pointer-events-none" />
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="w-full">
                                    <div className="flex flex-col md:items-start items-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-100 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                                            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                            <span>Registration Open</span>
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                            {event.title}
                                        </h1>
                                        <p className="text-blue-100/80 text-lg max-w-2xl leading-relaxed">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registration Wizard Section */}
                        <div className="p-4 md:p-8 lg:p-12 bg-gradient-to-b from-gray-50/50 to-white">
                            <EventRegistrationWizard
                                event={event}
                                memberId={user.member?.id || user.id}
                                memberName={`${user.member?.firstName || user.firstName} ${user.member?.lastName || user.lastName}`}
                                onComplete={handleRegistrationComplete}
                            />
                        </div>

                    </div>

                    {/* Footer / Copyright */}
                    <p className="text-center text-gray-400 text-sm mt-8">
                        &copy; {new Date().getFullYear()} Fellowship of Christian Students
                    </p>
                </div>
            </div>
        </ProtectedRoute>
    );
}
