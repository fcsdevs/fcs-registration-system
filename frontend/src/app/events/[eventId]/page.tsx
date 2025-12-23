"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Clock,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/common/route-guards";

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>(`/events/${eventId}`);

            if (response.data) {
                setEvent(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch event details:", error);
            alert("Failed to load event details");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        router.push(`/events/register/${eventId}`);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </ProtectedRoute>
        );
    }

    if (!event) {
        return (
            <ProtectedRoute>
                <div className="p-8 text-center">
                    <p className="text-muted-foreground">Event not found</p>
                    <Button onClick={() => router.push("/events")} className="mt-4">
                        Back to Events
                    </Button>
                </div>
            </ProtectedRoute>
        );
    }

    const getStatusColor = (status: string) => {
        const colors = {
            draft: "bg-gray-100 text-gray-800",
            published: "bg-blue-100 text-blue-800",
            active: "bg-green-100 text-green-800",
            completed: "bg-purple-100 text-purple-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
    };

    const isRegistrationOpen = () => {
        const now = new Date();
        const regStart = new Date(event.registrationStart);
        const regEnd = new Date(event.registrationEnd);
        return now >= regStart && now <= regEnd;
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/events")}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Events
                        </Button>

                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                            {event.status}
                                        </span>
                                        {isRegistrationOpen() && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Registration Open
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {event.description && (
                                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                    {event.description}
                                </p>
                            )}

                            {/* Quick Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Event Dates</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Registration Period</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(event.registrationStart).toLocaleDateString()} - {new Date(event.registrationEnd).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {event.maxCapacity && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Capacity</p>
                                            <p className="font-semibold text-gray-900">{event.maxCapacity} participants</p>
                                        </div>
                                    </div>
                                )}

                                {event.participationMode && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Mode</p>
                                            <p className="font-semibold text-gray-900">{event.participationMode}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Registration Button */}
                            {isRegistrationOpen() && event.status === 'published' && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <Button
                                        onClick={handleRegister}
                                        className="w-full md:w-auto px-8 py-3 text-lg"
                                        size="lg"
                                    >
                                        Register for this Event
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Registration closes on {new Date(event.registrationEnd).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {!isRegistrationOpen() && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800 font-medium">
                                            Registration is currently closed
                                        </p>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            {new Date() < new Date(event.registrationStart)
                                                ? `Registration opens on ${new Date(event.registrationStart).toLocaleDateString()}`
                                                : `Registration closed on ${new Date(event.registrationEnd).toLocaleDateString()}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Event Type</label>
                                    <p className="text-gray-900 mt-1">{event.participationMode || 'Not specified'}</p>
                                </div>
                                {event.unit && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Organized By</label>
                                        <p className="text-gray-900 mt-1">{event.unit.name}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Important Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Event Duration</label>
                                    <p className="text-gray-900 mt-1">
                                        {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Registration Window</label>
                                    <p className="text-gray-900 mt-1">
                                        {Math.ceil((new Date(event.registrationEnd).getTime() - new Date(event.registrationStart).getTime()) / (1000 * 60 * 60 * 24))} days
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
