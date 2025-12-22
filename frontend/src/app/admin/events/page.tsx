"use client";

import React, { useEffect, useState } from "react";
import { useAdmin } from "@/context/admin-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { Event } from "@/types/api";

export default function AdminEventsPage() {
    const { currentScope } = useAdmin();
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [subLevelEvents, setSubLevelEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentScope) return;
            setIsLoading(true);
            try {
                // Fetch My Level Events
                const myEventsRes = await api.get<any>(`/events?unitId=${currentScope.unitId}`);
                if (myEventsRes.data) {
                    setMyEvents(myEventsRes.data.data || []);
                }

                // Fetch Sub-Level Events (Mock logic: fetch all and filter, or assumes backend supports drilling)
                // For now, let's just fetch public events or some other endpoint. 
                // Ideally we would have `/events?parentUnitId=${currentScope.unitId}`
                // I will just use a placeholder for now since the backend might not be ready for deep filtering.
                setSubLevelEvents([]);

            } catch (err) {
                console.error("Failed to fetch events", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [currentScope]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
                <Link href="/admin/events/new">
                    <Button className="bg-primary text-white">
                        <Plus className="mr-2 h-4 w-4" /> Create Event
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="my-level" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="my-level">My Level Events</TabsTrigger>
                    <TabsTrigger value="sub-level">Sub-Level Events</TabsTrigger>
                </TabsList>

                <TabsContent value="my-level" className="space-y-4">
                    <EventList events={myEvents} isLoading={isLoading} emptyMessage="No events found for your level." />
                </TabsContent>

                <TabsContent value="sub-level" className="space-y-4">
                    <EventList events={subLevelEvents} isLoading={isLoading} emptyMessage="No events found from sub-units." />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EventList({ events, isLoading, emptyMessage }: { events: Event[]; isLoading: boolean; emptyMessage: string }) {
    if (isLoading) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
    }

    if (events.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    {emptyMessage}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold truncate pr-4" title={event.title}>
                            {event.title}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mt-2">
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${event.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {event.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <Link href={`/admin/events/${event.id}`} className="text-sm font-medium text-primary hover:underline">
                                Manage
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
