"use client";

import React, { useEffect, useState } from "react";
import { useAdmin } from "@/context/admin-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { unitsApi } from "@/lib/api/units";
import { UnitStatistics, Unit } from "@/types/api";
import { OrganizationalLevel } from "@/types";
import { Loader2, Users, Calendar, MapPin, TrendingUp } from "lucide-react";

export function DashboardWidgets() {
    const { currentScope, isLoading: isScopeLoading } = useAdmin();
    const [stats, setStats] = useState<UnitStatistics | null>(null);
    const [subUnits, setSubUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentScope) return;

            setIsLoading(true);
            try {
                const [statsRes, subUnitsRes] = await Promise.all([
                    unitsApi.getStatistics(currentScope.unitId),
                    unitsApi.getChildren(currentScope.unitId)
                ]);

                if (statsRes.data) setStats(statsRes.data);
                if (subUnitsRes.data) setSubUnits(subUnitsRes.data);

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentScope]);

    if (isScopeLoading || isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentScope) {
        return <div>Access Denied</div>;
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview for {currentScope.name} ({currentScope.level})
                </p>
            </div>

            {/* Stats Grid - "My Level Events" logic usually implies seeing your own stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Members"
                    value={stats?.statistics.members || 0}
                    icon={Users}
                    description="Registered members"
                />
                <StatsCard
                    title="Active Events"
                    value={stats?.statistics.events || 0}
                    icon={Calendar}
                    description="Upcoming & ongoing"
                />
                <StatsCard
                    title="Total Registrations"
                    value={stats?.statistics.registrations || 0}
                    icon={TrendingUp}
                    description="Across all events"
                />
                <StatsCard
                    title={getSubUnitLabel(currentScope.level)}
                    value={stats?.statistics.childUnits || 0}
                    icon={MapPin}
                    description={`Directly under ${currentScope.name}`}
                />
            </div>

            {/* Sub-Level List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{getSubUnitLabel(currentScope.level)} Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subUnits.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sub-units found.</p>
                        ) : (
                            <div className="space-y-4">
                                {subUnits.map((unit) => (
                                    <div key={unit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{unit.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{unit.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{unit.memberCount || 0}</div>
                                            <div className="text-xs text-muted-foreground">Members</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, description }: { title: string; value: number | string; icon: any; description: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function getSubUnitLabel(level: string): string {
    switch (level.toLowerCase()) {
        case 'national': return 'Regions / States';
        case 'region': return 'State Chapters';
        case 'state': return 'Zones / Areas';
        case 'zone': return 'Branches';
        case 'area': return 'Branches';
        case 'branch': return 'Units'; // Or 'Members'
        default: return 'Sub-Units';
    }
}
