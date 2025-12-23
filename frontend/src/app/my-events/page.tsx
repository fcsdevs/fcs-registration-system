/**
 * My Events Page
 * Event discovery and registration management for members
 */

"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/route-guards';
import { Calendar, MapPin, Users, Clock, Plus, CheckCircle, ArrowRight } from 'lucide-react';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import Link from 'next/link';

function MyEventsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'available' | 'registered' | 'past'>('available');
    const [events, setEvents] = useState<Event[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        // Show success message if redirected after registration
        if (searchParams.get('registered') === 'true') {
            // Could show a toast notification here
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'available') {
                const response = await api.get<any>('/events?isPublished=true');
                // Extract data from response { data: { docs: [] } } or { data: [] }
                const eventsData = response.data?.docs || response.data || [];
                setEvents(Array.isArray(eventsData) ? eventsData : []);
            } else if (activeTab === 'registered' || activeTab === 'past') {
                // Fetch ALL registrations for both tabs
                const response = await api.get<any>('/registrations');
                const regsData = response.data?.docs || response.data || [];
                const allRegs = Array.isArray(regsData) ? regsData : [];

                const now = new Date();

                if (activeTab === 'registered') {
                    // Filter for upcoming/current events (endDate >= now)
                    // If no date is available, we assume it's upcoming/current
                    const upcoming = allRegs.filter((reg: any) => {
                        if (!reg.event?.endDate) return true;
                        return new Date(reg.event.endDate) >= now;
                    });
                    setRegistrations(upcoming);
                } else {
                    // Filter for past events (endDate < now)
                    const past = allRegs.filter((reg: any) => {
                        if (!reg.event?.endDate) return false;
                        return new Date(reg.event.endDate) < now;
                    });
                    setRegistrations(past);
                }
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getParticipationModeColor = (mode: string) => {
        switch (mode) {
            case 'ONLINE':
                return 'bg-blue-100 text-blue-700';
            case 'ONSITE':
                return 'bg-amber-100 text-amber-700';
            case 'HYBRID':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#010030]">My Events</h1>
                            <p className="text-gray-600 mt-1">Discover and register for upcoming events</p>
                        </div>
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            Register Others
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-8">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'available'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Available Events
                            </button>
                            <button
                                onClick={() => setActiveTab('registered')}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'registered'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                My Registrations
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'past'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Past Events
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : activeTab === 'available' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {events.length === 0 ? (
                                <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
                                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Available</h3>
                                    <p className="text-gray-600">Check back soon for upcoming events</p>
                                </div>
                            ) : (
                                events.map((event) => (
                                    <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-[#010030] mb-2">{event.title}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getParticipationModeColor(event.participationMode)}`}>
                                                {event.participationMode}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    Registration: {new Date(event.registrationStart).toLocaleDateString()} - {new Date(event.registrationEnd).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {event.capacity && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span>Capacity: {event.capacity}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                                            <Link
                                                href={`/my-events/${event.id}/register`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Register Now
                                            </Link>
                                            <Link
                                                href={`/my-events/${event.id}/register-others`}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1F7A63] text-white rounded-lg hover:opacity-90 transition-opacity"
                                            >
                                                <Users className="w-4 h-4" />
                                                Register for Others
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : activeTab === 'registered' || activeTab === 'past' ? (
                        <div className="space-y-4">
                            {registrations.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg shadow">
                                    {activeTab === 'registered' ? (
                                        <>
                                            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registrations Yet</h3>
                                            <p className="text-gray-600 mb-6">You haven't registered for any events</p>
                                            <button
                                                onClick={() => setActiveTab('available')}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Browse Events
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Events</h3>
                                            <p className="text-gray-600">Your past event attendance will appear here</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                registrations.map((registration) => (
                                    <div key={registration.id} className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-[#010030] mb-1">
                                                    {registration.event?.title || registration.event?.name || 'Event'}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getParticipationModeColor(registration.participationMode)}`}>
                                                        {registration.participationMode}
                                                    </span>
                                                    {registration.center && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{registration.center.name}</span>
                                                        </div>
                                                    )}
                                                    {registration.event?.startDate && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{new Date(registration.event.startDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                href={`/my-events/registration/${registration.id}`}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default function MyEventsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <MyEventsContent />
        </Suspense>
    );
}
