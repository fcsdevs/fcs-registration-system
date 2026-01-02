"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Users, CheckCircle, UserCheck } from 'lucide-react';

interface Stats {
    registeredByMe: number;
    centerStats: {
        totalRegistered: number;
        totalConfirmed: number;
        totalCheckedIn: number;
    };
}

export function OverviewTab({ eventId }: { eventId: string }) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    // TODO: Add Center Selection context if needed
    // const [centerId, setCenterId] = useState<string>(""); 

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // We're passing eventId. If we had a centerId context, we'd pass it too.
                // &centerId=${centerId}
                const response = await api.get<{ data: Stats }>(`/registrations/stats?eventId=${eventId}`);
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Registered by Me</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.registeredByMe || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Center Confirmed</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.centerStats?.totalConfirmed || 0}</h3>
                        <p className="text-xs text-gray-400">Total: {stats?.centerStats?.totalRegistered || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <UserCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Checked In</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.centerStats?.totalCheckedIn || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
