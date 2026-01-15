"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notificationsApi } from "@/lib/api/notifications";
import { eventsApi } from "@/lib/api/events";
import { NotificationTrigger, Event } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Bell,
    ArrowLeft,
    Plus,
    Trash2,
    Mail,
    Smartphone,
    User,
    CheckCircle2,
    XCircle,
    Loader2,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
    MailCheck,
    Send
} from "lucide-react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAuth } from "@/context/auth-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function EventNotificationsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;
    const { user } = useAuth();

    const [event, setEvent] = useState<Event | null>(null);
    const [triggers, setTriggers] = useState<NotificationTrigger[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state
    const [newTrigger, setNewTrigger] = useState({
        triggerType: 'REGISTRATION' as any,
        deliveryMethod: 'EMAIL' as any,
        recipientType: 'MEMBER' as any,
    });

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventRes, triggersRes] = await Promise.all([
                eventsApi.getById(eventId),
                notificationsApi.listTriggers(eventId)
            ]);

            if (eventRes.data) setEvent(eventRes.data);
            if (triggersRes.data) setTriggers(triggersRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTrigger = async (triggerId: string, currentStatus: boolean) => {
        try {
            setActionLoading(true);
            await notificationsApi.updateTrigger(triggerId, { isActive: !currentStatus });
            setTriggers(triggers.map(t => t.id === triggerId ? { ...t, isActive: !currentStatus } : t));
        } catch (error) {
            console.error("Failed to update trigger:", error);
            alert("Failed to update trigger");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateTrigger = async () => {
        try {
            setActionLoading(true);
            const response = await notificationsApi.createTrigger({
                eventId,
                ...newTrigger
            });

            if (response.data) {
                setTriggers([...triggers, response.data]);
                setIsCreateModalOpen(false);
            }
        } catch (error: any) {
            console.error("Failed to create trigger:", error);
            alert(error.response?.data?.message || "Failed to create trigger");
        } finally {
            setActionLoading(false);
        }
    };

    const handleTriggerReminder = async () => {
        if (!confirm("This will send reminder notifications to all registered members. Continue?")) {
            return;
        }

        try {
            setActionLoading(true);
            const response = await notificationsApi.triggerEventReminder(eventId);
            alert(`Reminder sent: ${response.data?.totalSent} delivered, ${response.data?.totalFailed} failed.`);
        } catch (error: any) {
            console.error("Failed to trigger reminder:", error);
            alert(error.response?.data?.message || "Failed to send reminders");
        } finally {
            setActionLoading(false);
        }
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.push(`/events/${eventId}`)}
                            className="mb-4 hover:bg-white"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Event
                        </Button>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <Bell className="h-8 w-8 text-blue-600" />
                                    Notification Management
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    Automated triggers and manual alerts for <span className="font-semibold text-gray-700">{event?.title}</span>
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleTriggerReminder}
                                    disabled={actionLoading}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Bulk Reminder
                                </Button>
                                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Trigger
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Configure New Trigger</DialogTitle>
                                            <DialogDescription>
                                                Define when and how automated notifications should be sent.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Event Action (Trigger)</Label>
                                                <Select
                                                    value={newTrigger.triggerType}
                                                    onValueChange={(v) => setNewTrigger({ ...newTrigger, triggerType: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="REGISTRATION">On Successful Registration</SelectItem>
                                                        <SelectItem value="CENTER_ASSIGNMENT">On Center Assignment</SelectItem>
                                                        <SelectItem value="GROUP_ASSIGNMENT">On Group Assignment</SelectItem>
                                                        <SelectItem value="EVENT_REMINDER">Scheduled Reminder (Bulk)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Delivery Channel</Label>
                                                <Select
                                                    value={newTrigger.deliveryMethod}
                                                    onValueChange={(v) => setNewTrigger({ ...newTrigger, deliveryMethod: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="EMAIL">Email (Preferred)</SelectItem>
                                                        <SelectItem value="SMS">SMS (Global)</SelectItem>
                                                        <SelectItem value="PUSH">Push Notification</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Recipient Audience</Label>
                                                <Select
                                                    value={newTrigger.recipientType}
                                                    onValueChange={(v) => setNewTrigger({ ...newTrigger, recipientType: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MEMBER">The Registered Member</SelectItem>
                                                        <SelectItem value="GUARDIAN">Parent / Guardian</SelectItem>
                                                        <SelectItem value="ADMIN">System Administrator</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                            <Button onClick={handleCreateTrigger} disabled={actionLoading}>
                                                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                Save Trigger
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 gap-6">
                        {triggers.length === 0 ? (
                            <Card className="border-dashed h-64 flex flex-col items-center justify-center text-center p-8 bg-white/50">
                                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No active triggers</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    You haven't configured any automated notifications for this event yet.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    Get Started
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {triggers.map((trigger) => (
                                    <TriggerCard
                                        key={trigger.id}
                                        trigger={trigger}
                                        onToggle={handleToggleTrigger}
                                        loading={actionLoading}
                                    />
                                ))}
                            </div>
                        )}

                        {/* History Summary Card */}
                        <Card className="mt-8 border-none shadow-sm overflow-hidden bg-gradient-to-br from-gray-900 to-slate-800 text-white">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <MailCheck className="h-6 w-6 text-blue-400" />
                                            Transmission History
                                        </h3>
                                        <p className="text-gray-400 mt-2 max-w-md">
                                            Track the delivery status of all notifications sent for this event.
                                            View logs, delivery failures, and recipient engagements.
                                        </p>
                                        <Button
                                            className="mt-6 bg-white/10 hover:bg-white/20 border-white/10"
                                            onClick={() => router.push('/admin/notifications/history')}
                                        >
                                            View Global Logs
                                        </Button>
                                    </div>
                                    <div className="hidden md:block opacity-20">
                                        <Globe className="h-32 w-32" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

function TriggerCard({ trigger, onToggle, loading }: { trigger: NotificationTrigger, onToggle: (id: string, s: boolean) => void, loading: boolean }) {
    const getIcon = () => {
        switch (trigger.deliveryMethod) {
            case 'EMAIL': return <Mail className="h-5 w-5" />;
            case 'SMS': return <Smartphone className="h-5 w-5" />;
            default: return <Bell className="h-5 w-5" />;
        }
    };

    const getTypeLabel = () => {
        return trigger.triggerType.replace(/_/g, ' ').toLowerCase();
    };

    return (
        <Card className={`transition-all hover:shadow-md border-gray-100 ${!trigger.isActive ? 'bg-gray-50/50 grayscale-[0.5]' : 'bg-white'}`}>
            <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${trigger.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                        {getIcon()}
                    </div>
                    <Switch
                        checked={trigger.isActive}
                        onCheckedChange={() => onToggle(trigger.id, trigger.isActive)}
                        disabled={loading}
                    />
                </div>
                <div className="mt-4">
                    <CardTitle className="text-lg capitalize">{getTypeLabel()}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3" />
                        Target: {trigger.recipientType.toLowerCase()}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-gray-500 mt-2">
                    <span>Channel: {trigger.deliveryMethod}</span>
                    <span className={`flex items-center gap-1 ${trigger.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {trigger.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {trigger.isActive ? 'Active' : 'Disabled'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function Globe({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}
