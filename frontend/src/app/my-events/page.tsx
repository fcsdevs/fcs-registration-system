/**
 * My Events Page
 * Event discovery and registration management for members
 * Enhanced with FCS World-Class Design System
 */

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { Calendar, MapPin, Users, Clock, Plus, CheckCircle, ArrowRight, LayoutDashboard, Search, Filter } from 'lucide-react';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import Link from 'next/link';

// Background Ambience Component
const AmbientBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2" />
    </div>
);

function MyEventsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'available' | 'registered'>('available');
    const [events, setEvents] = useState<Event[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        api.get<any>('/auth/me').then(res => setCurrentUser(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [activeTab, currentUser]);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            // Could show a toast notification here
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'available') {
                const response = await api.get<any>('/events?isPublished=true');
                const eventsData = response.data?.docs || response.data || [];
                setEvents(Array.isArray(eventsData) ? eventsData : []);
            } else if (activeTab === 'registered') {
                if (!currentUser?.member?.id) {
                    setRegistrations([]);
                    return;
                }
                // Fetch registrations where the current user is the participant (member)
                const response = await api.get<any>(`/registrations?memberId=${currentUser.member.id}`);
                const regsData = response.data?.docs || response.data?.data || response.data || [];
                setRegistrations(Array.isArray(regsData) ? regsData : []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getParticipationModeStyle = (mode: string) => {
        switch (mode) {
            case 'ONLINE':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'ONSITE':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'HYBRID':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <ProtectedRoute>
            <div className="relative min-h-screen bg-gray-50/50">
                <AmbientBackground />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Modern Hero Header */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">

                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
                                Discover Events
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl font-light">
                                Explore upcoming gatherings, conferences, and retreats designed for your spiritual growth.
                            </p>
                        </div>

                        <div className="hidden"></div>
                    </div>

                    {/* Modern Glass Tabs */}
                    <div className="mb-8 overflow-x-auto pb-4 md:pb-0">
                        <div className="inline-flex p-1.5 bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm">
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'available'
                                    ? 'bg-white text-blue-700 shadow-md transform scale-105'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                Available Events
                            </button>
                            <button
                                onClick={() => setActiveTab('registered')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'registered'
                                    ? 'bg-white text-blue-700 shadow-md transform scale-105'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                My Registrations
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Loading events...</p>
                        </div>
                    ) : activeTab === 'available' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.length === 0 ? (
                                <div className="col-span-full py-24 text-center">
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6">
                                        <Calendar className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Events</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        It seems there are no active events available for registration at the moment.
                                    </p>
                                </div>
                            ) : (
                                events.map((event) => (
                                    <div key={event.id} className="group relative bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full">
                                        {/* Top Image Section */}
                                        <div className="relative h-44 w-full overflow-hidden">
                                            {event.imageUrl ? (
                                                <img
                                                    src={event.imageUrl}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                                    <Calendar className="w-10 h-10 text-blue-300" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wide bg-white/90 backdrop-blur-sm shadow-sm ${getParticipationModeStyle(event.participationMode)}`}>
                                                    {event.participationMode}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col relative z-10">
                                            {/* Decorative Gradient Background on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1 relative z-10">
                                                {event.title}
                                            </h3>

                                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 relative z-10">
                                                {event.description || "Join us for a spiritual experience and build lasting connections within the FCS community."}
                                            </p>

                                            <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                                                <div className="flex flex-col gap-1 text-[10px] text-gray-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                                    <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-tight">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Event Date</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-800">
                                                        {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 text-[10px] text-gray-600 bg-purple-50/50 p-2 rounded-lg border border-purple-100">
                                                    <div className="flex items-center gap-1.5 text-purple-700 font-bold uppercase tracking-tight">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Reg Ends</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-800">
                                                        {new Date(event.registrationEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 mt-auto relative z-10">
                                                {new Date() >= new Date(event.registrationStart) && new Date() <= new Date(event.registrationEnd) ? (
                                                    <>
                                                        <Link
                                                            href={`/my-events/${event.id}/register`}
                                                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#060CCD] text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors shadow-md shadow-blue-900/10 text-xs"
                                                        >
                                                            <span>Register</span>
                                                            <ArrowRight className="w-3" />
                                                        </Link>

                                                        <Link
                                                            href={`/my-events/${event.id}/register-others`}
                                                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-xs"
                                                        >
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span>Others</span>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <div className="col-span-2 flex items-center justify-center px-3 py-2.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-not-allowed">
                                                        {new Date() > new Date(event.registrationEnd) ? "Registration Closed" : "Opens Soon"}
                                                    </div>
                                                )}

                                                {currentUser?.roles?.some((r: any) => r.name === 'Registrar') && (
                                                    <Link
                                                        href={`/my-events/${event.id}/registrar`}
                                                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl font-medium hover:bg-purple-100 transition-colors"
                                                        title="Registrar Dashboard"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                ))
                            )}
                        </div>
                    ) : (
                        // REGISTERED TAB CONTENT
                        <div className="space-y-4">
                            {registrations.length === 0 ? (
                                <div className="py-24 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-6">
                                        <CheckCircle className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No active registrations</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                        You haven't registered yourself or others for any upcoming events yet.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('available')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Browse Events
                                    </button>
                                </div>
                            ) : (
                                registrations.map((registration) => (
                                    <div key={registration.id} className="group flex bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden transition-all duration-300">
                                        {/* Status Strip - The "Green Stuff" */}
                                        <div className={`w-1.5 self-stretch flex-shrink-0
                                            ${registration.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-gray-300'}`}
                                        />

                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-4">

                                            {/* 1. Member Info */}
                                            <div className="sm:w-1/3 min-w-[200px] flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                    {registration.member?.firstName?.[0] || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {registration.member?.firstName} {registration.member?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate font-mono">
                                                        {registration.member?.fcsCode || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 2. Event Info */}
                                            <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                        {registration.event?.title || registration.event?.name || 'Event'}
                                                    </h4>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${registration.status === 'CONFIRMED'
                                                        ? 'bg-green-50 text-green-700 border border-green-100'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                                                        }`}>
                                                        {registration.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {registration.event?.startDate ? new Date(registration.event.startDate).toLocaleDateString() : 'TBD'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {registration.participation?.center?.centerName || registration.center?.centerName || registration.event?.participationMode}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 3. Action */}
                                            <div className="flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-l sm:pl-4">
                                                <div className="flex flex-col gap-2">
                                                    <Link
                                                        href={`/my-events/registration/${registration.id}`}
                                                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        View Badge
                                                        <ArrowRight className="w-3 h-3" />
                                                    </Link>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const { registrationsApi } = await import('@/lib/api/registrations');
                                                                const blob = await registrationsApi.downloadTag(registration.id);
                                                                const url = window.URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = `Tag_${registration.member?.fcsCode || 'Event'}.pdf`;
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                window.URL.revokeObjectURL(url);
                                                                document.body.removeChild(a);
                                                            } catch (err) {
                                                                console.error('Download failed', err);
                                                                alert('Failed to download tag');
                                                            }
                                                        }}
                                                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        Print Tag (PDF)
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default function MyEventsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        }>
            <MyEventsContent />
        </Suspense>
    );
}
