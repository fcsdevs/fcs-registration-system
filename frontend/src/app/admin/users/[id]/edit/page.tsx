"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAdmin } from "@/context/admin-context";
import { api } from "@/lib/api/client";
import { unitsApi } from "@/lib/api/units";
import { User } from "@/types";
import { Unit } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function EditAdminPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { currentScope } = useAdmin();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Assignment Logic Reuse
    const [states, setStates] = useState<Unit[]>([]);
    const [zones, setZones] = useState<Unit[]>([]);
    const [branches, setBranches] = useState<Unit[]>([]);

    const [selectedStateId, setSelectedStateId] = useState("");
    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState("");

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch User Data
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const res = await api.get<any>(`/users/${userId}`);
                const userData = res.data.data || res.data;
                setUser(userData);

                // Pre-fill logic would go here if we had unit hierarchy data attached to user
                // For now, we allow re-assignment/move
            } catch (err) {
                console.error("Failed to fetch user", err);
                setError("Failed to load user data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    // 2. Load Hierarchy (Same as Assign Page)
    useEffect(() => {
        if (!currentScope) return;
        const loadInitialUnits = async () => {
            if (currentScope.level === 'National') {
                const res = await unitsApi.list({ type: 'State' });
                if (res.data) setStates(res.data.data);
            } else if (currentScope.level === 'State') {
                const stateRes = await unitsApi.getById(currentScope.unitId);
                if (stateRes.data) {
                    setStates([stateRes.data]);
                    setSelectedStateId(currentScope.unitId);
                }
            }
        };
        loadInitialUnits();
    }, [currentScope]);

    // Zones
    useEffect(() => {
        const fetchZones = async () => {
            if (!selectedStateId) { setZones([]); return; }
            if (currentScope?.level === 'Zone' && currentScope.unitId) {
                const zoneRes = await unitsApi.getById(currentScope.unitId);
                if (zoneRes.data) { setZones([zoneRes.data]); setSelectedZoneId(currentScope.unitId); }
                return;
            }
            try {
                const res = await unitsApi.getChildren(selectedStateId);
                if (res.data) setZones(res.data);
            } catch (e) { }
        };
        fetchZones();
        if (currentScope?.level !== 'Zone') setSelectedZoneId("");
    }, [selectedStateId, currentScope]);

    // Branches
    useEffect(() => {
        const fetchBranches = async () => {
            if (!selectedZoneId) { setBranches([]); return; }
            try {
                const res = await unitsApi.getChildren(selectedZoneId);
                if (res.data) setBranches(res.data);
            } catch (e) { }
        };
        fetchBranches();
        setSelectedBranchId("");
    }, [selectedZoneId]);


    const handleSave = async () => {
        if (!user) return;

        let targetUnitId = selectedBranchId || selectedZoneId || selectedStateId;
        if (!targetUnitId) { setError("Please select a unit."); return; }

        let targetRole = "";
        if (selectedBranchId) targetRole = "Branch Admin";
        else if (selectedZoneId) targetRole = "Zone Admin";
        else if (selectedStateId) targetRole = "State Admin";
        else targetRole = "State Admin"; // Fallback default

        setIsSaving(true);
        setSuccessMessage(null);
        setError(null);
        try {
            await api.put(`/users/${user.id}/roles`, {
                role: targetRole,
                unitId: targetUnitId,
            });
            setSuccessMessage("Admin role updated successfully!");
            setTimeout(() => {
                router.push("/admin/users");
            }, 1000);
        } catch (err: any) {
            console.error(err);
            setError("Failed to update role: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
    if (!user) return <div className="p-8">User not found</div>;

    return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Admin Role</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Re-assign Jurisdiction for {user.firstName}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {successMessage && <div className="p-3 bg-green-50 text-green-700 rounded">{successMessage}</div>}
                        {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">State</label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={selectedStateId}
                                    onChange={e => setSelectedStateId(e.target.value)}
                                    disabled={currentScope?.level !== 'National'}
                                >
                                    <option value="">Select State</option>
                                    {states.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Zone</label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={selectedZoneId}
                                    onChange={e => setSelectedZoneId(e.target.value)}
                                    disabled={!selectedStateId || (currentScope?.level === 'Zone')}
                                >
                                    <option value="">Select Zone</option>
                                    {zones.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Branch</label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={selectedBranchId}
                                    onChange={e => setSelectedBranchId(e.target.value)}
                                    disabled={!selectedZoneId}
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-white">
                                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                                Update Role
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
