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
import { useRouter } from "next/navigation";

export default function UserDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Redirect admin users to admin dashboard
    useEffect(() => {
        if (user) {
            const isAdmin = user.roles?.some((r: any) => {
                const role = r.toLowerCase();
                return role.includes('admin') || role === 'leader';
            });

            if (isAdmin) {
                router.replace('/home');
                return;
            }
        }
    }, [user, router]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // Fetch events with hierarchical visibility:
                // - If user has unitId: fetch events for their unit + ancestors (national, regional, state) + descendants
                // - If no unitId: fetch all published events
                // The backend already handles hierarchical logic when unitId is provided

                let fetchedEvents: Event[] = [];

                if (user.unitId) {
                    // Fetch hierarchical events (own + ancestors + descendants)
                    // Backend will automatically include:
                    // - Events from user's unit
                    // - Events from ancestor units (National, Regional, State, etc.)
                    // - Events from descendant units
                    const response = await api.get<any>(`/events?unitId=${user.unitId}&isPublished=true`);
                    if (response.data) {
                        fetchedEvents = response.data || [];
                    }
                } else {
                    // No unitId assigned - show all published events
                    const response = await api.get<any>(`/events?isPublished=true`);
                    if (response.data) {
                        fetchedEvents = response.data || [];
                    }
                }

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
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Welcome Section */}
                    <div className="mb-10 bg-gradient-to-r from-[#010030] to-blue-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl md:text-4xl font-black mb-2">Welcome, {user?.firstName} {user?.lastName}!</h1>
                            <p className="text-blue-100/80 text-lg font-medium">Manage your membership and event registrations.</p>
                        </div>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
                        <DashboardCard
                            title="Edit Profile"
                            description="Keep your information current"
                            icon={User}
                            href="/profile"
                            color="blue"
                        />
                        <DashboardCard
                            title="My Tickets"
                            description="View and print your badges"
                            icon={Ticket}
                            href="/my-events"
                            color="purple"
                        />
                        <DashboardCard
                            title="Explore Events"
                            description="Join upcoming programs"
                            icon={Calendar}
                            href="/my-events"
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
                                <h3 className="text-lg font-medium text-gray-900">No events found for your branch / school</h3>
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
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };

    return (
        <Link href={href} className="block group">
            <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-100 group-hover:border-blue-100">
                <CardContent className="p-5 flex items-center space-x-4">
                    <div className={`p-3.5 rounded-2xl border ${colorClasses[color] || "bg-gray-100"}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{description}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function EventCard({ event }: { event: Event }) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden group">
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-blue-200" />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-blue-700 border border-blue-100 shadow-sm uppercase tracking-wider">
                        {event.participationMode}
                    </span>
                </div>
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1" title={event.title}>
                    {event.title}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
                    {new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
                <p className="text-sm text-gray-600 line-clamp-2 mb-6 min-h-[2.5rem]">
                    {event.description || "Join us for this amazing spiritual gathering."}
                </p>
                <div className="mt-auto">
                    {new Date(event.endDate) > new Date() ? (
                        <Link href={`/events/${event.id}/register`}>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-semibold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5">
                                Register Now
                            </Button>
                        </Link>
                    ) : (
                        <Button disabled className="w-full bg-gray-100 text-gray-400 cursor-not-allowed rounded-xl py-6">
                            Registration Closed
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

