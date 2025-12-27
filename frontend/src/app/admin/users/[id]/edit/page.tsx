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
                // API client returns the parsed JSON directly. 
                // If the response is the user object, we use it directly.
                const userData = res.data ? res.data : res;
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
                // res is { data: Unit[], pagination: ... } so res.data is the array
                const data = (res as any).data;
                if (Array.isArray(data)) {
                    setStates(data);
                } else if (data && Array.isArray(data.data)) {
                    setStates(data.data);
                }
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
                replaceExisting: true, // Force replace of existing assignments
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

    if (isLoading) return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" disabled><ArrowLeft className="h-4 w-4" /></Button>
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <Card>
                    <CardContent className="p-12 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground text-sm">Loading user details...</p>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
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
                    <CardContent className="space-y-6">
                        {/* Caution Warning */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm leading-5 font-medium text-amber-800">
                                        Caution: Administrative Access
                                    </h3>
                                    <div className="mt-2 text-sm leading-5 text-amber-700">
                                        <p>
                                            Modifying these settings will immediately update the user's administrative privileges and access to sensitive data. Please verify the jurisdiction before saving.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Assignments Display */}
                        {user.assignments && user.assignments.length > 0 ? (
                            <div className="bg-gray-50 p-4 rounded-md border text-sm">
                                <h3 className="font-semibold text-gray-900 mb-2">Current Jurisdictions:</h3>
                                <div className="space-y-2">
                                    {user.assignments.map((assignment: any) => (
                                        <div key={assignment.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                                            <div>
                                                <span className="font-medium text-blue-700 block">{assignment.role}</span>
                                                <span className="text-gray-500 text-xs">{assignment.unitName || 'Unknown Unit'}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                {assignment.level || 'Level Unknown'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-md border text-sm text-gray-500 italic">
                                No active administrative roles found.
                            </div>
                        )}

                        <div className="border-t pt-2"></div>

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
