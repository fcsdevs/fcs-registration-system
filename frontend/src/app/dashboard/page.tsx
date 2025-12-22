"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api/client";
import { Event } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Ticket, User, ArrowRight, Loader2, MapPin } from "lucide-react";
import Link from "next/link";

export default function UserDashboardPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // Fetch events relevant to user. 
                // Logic: 
                // 1. If user has unitId, fetch events for that unit.
                // 2. Fetch public events is also an option, but for now focusing on "Your Unit's Events"

                let fetchedEvents: Event[] = [];

                if (user.unitId) {
                    const unitEventsRes = await api.get<any>(`/events?unitId=${user.unitId}`);
                    if (unitEventsRes.data) {
                        fetchedEvents = [...fetchedEvents, ...(unitEventsRes.data.data || [])];
                    }
                }

                // TODO: Also fetch National/Regional events based on hierarchy if API supports it.

                setEvents(fetchedEvents);

            } catch (err) {
                console.error("Failed to fetch dashboard events", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [user]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
                        <p className="text-gray-600 mt-1">Manage your membership and registrations.</p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <DashboardCard
                            title="Edit Profile"
                            description="Update your personal information"
                            icon={User}
                            href="/profile"
                            color="blue"
                        />
                        <DashboardCard
                            title="My Registrations"
                            description="View your active tickets"
                            icon={Ticket}
                            href="/my-events" // Assuming this route exists based on file listings
                            color="purple"
                        />
                        <DashboardCard
                            title="Find Events"
                            description="Browse all available programs"
                            icon={Calendar}
                            href="/events"
                            color="green"
                        />
                    </div>

                    {/* Available Programs Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Available Programs</h2>
                            <Link href="/events" className="text-primary hover:underline font-medium flex items-center">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-dashed border-gray-300">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No events found for your branch</h3>
                                <p className="text-gray-500 mt-2">Check back later or browse all events.</p>
                                <Link href="/events" className="mt-4 inline-block">
                                    <Button variant="outline">Browse All Events</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}

function DashboardCard({ title, description, icon: Icon, href, color }: any) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        green: "bg-green-100 text-green-600",
    };

    return (
        <Link href={href} className="block group">
            <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-6 flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${colorClasses[color] || "bg-gray-100"}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function EventCard({ event }: { event: Event }) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1" title={event.title}>{event.title}</CardTitle>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap`}>
                        {event.participationMode}
                    </span>
                </div>
                <CardDescription className="flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(event.startDate).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {event.description || "No description provided."}
                </p>
                <Link href={`/events/${event.id}/register`} className="mt-auto">
                    <Button className="w-full bg-primary text-white hover:bg-primary/90">
                        Register Now
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
