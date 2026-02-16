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

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const roleMode = searchParams?.get('role') || 'Admin';
    const isRegistrarMode = roleMode === 'Registrar';

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
                setFormData({
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    email: userData.email || "",
                    phone: userData.phoneNumber || userData.phone || "",
                });

                if (userData.assignments && userData.assignments.length > 0) {
                    // Try to find the relevant assignment for the current mode
                    const relevantRole = isRegistrarMode ? "Registrar" : "Admin";
                    const assignment = userData.assignments.find((a: any) =>
                        a.role === relevantRole || a.role.includes(relevantRole)
                    ) || userData.assignments[0];

                    if (assignment && assignment.unitId) {
                        const level = assignment.level;
                        if (level === 'State') {
                            setSelectedStateId(assignment.unitId);
                        } else if (level === 'Zone') {
                            // We need to know the parent State ID to pre-fill it.
                            // For simplicity, we just set the target ID, 
                            // though full pre-fill of State -> Zone would require fetching parents.
                            setSelectedZoneId(assignment.unitId);
                        } else if (level === 'Branch') {
                            setSelectedBranchId(assignment.unitId);
                        }
                    }
                }
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
                const res = await unitsApi.list({ type: 'State', limit: 100 });
                // res is { data: Unit[], pagination: ... } so res.data is the array
                const data = (res as any).data;
                if (Array.isArray(data)) {
                    setStates(data);
                } else if (data && Array.isArray(data.data)) {
                    setStates(data.data);
                }
            } else if (currentScope.level === 'Area' && currentScope.unitId) {
                const res = await unitsApi.getChildren(currentScope.unitId);
                if (res.data) setStates(res.data);
            } else if (currentScope.level === 'State' && currentScope.unitId) {
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
            // 1. Check Scope Lock First
            if (currentScope?.level === 'Zone' && currentScope.unitId) {
                const zoneRes = await unitsApi.getById(currentScope.unitId);
                if (zoneRes.data) { setZones([zoneRes.data]); setSelectedZoneId(currentScope.unitId); }
                return;
            }

            // 2. Normal Cascade
            if (!selectedStateId) { setZones([]); return; }

            try {
                const res = await unitsApi.getChildren(selectedStateId);
                if (res.data) setZones(res.data);
            } catch (e) { }
        };
        fetchZones();

        // Reset only if not scoped
        if (currentScope?.level !== 'Zone' && currentScope?.level !== 'Branch') {
            // If we are strictly Zone or Branch scoped, we don't want to clear this if state changes (state won't change though)
            // Actually, if we are Branch scoped, Zone might be irrelevant or hidden.
            // If we are Zone scoped, we keep it.
            // If we are National/State, we reset when state changes.
            if (!selectedStateId) setSelectedZoneId("");
        }
    }, [selectedStateId, currentScope]);

    // Branches
    useEffect(() => {
        const fetchBranches = async () => {
            // 1. Check Scope Lock First
            if (currentScope?.level === 'Branch' && currentScope.unitId) {
                const res = await unitsApi.getById(currentScope.unitId);
                if (res.data) {
                    setBranches([res.data]);
                    setSelectedBranchId(currentScope.unitId);
                }
                return;
            }

            // 2. Normal Cascade
            if (!selectedZoneId) { setBranches([]); return; }
            try {
                const res = await unitsApi.getChildren(selectedZoneId);
                if (res.data) setBranches(res.data);
            } catch (e) { }
        };
        fetchBranches();

        if (currentScope?.level !== 'Branch') {
            if (!selectedZoneId) setSelectedBranchId("");
        }
    }, [selectedZoneId, currentScope]);


    const handleSave = async () => {
        if (!user) return;

        let targetUnitId = selectedBranchId || selectedZoneId || selectedStateId;
        if (!targetUnitId) { setError("Please select a unit."); return; }

        let targetRole = "";
        if (isRegistrarMode) {
            targetRole = "Registrar";
        } else {
            if (selectedBranchId) targetRole = "Branch Admin";
            else if (selectedZoneId) targetRole = "Zone Admin";
            else if (selectedStateId) targetRole = "State Admin";
            else targetRole = "State Admin";
        }

        setIsSaving(true);
        setSuccessMessage(null);
        setError(null);
        try {
            // 1. Update Profile Details
            await api.put(`/users/${user.id}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phone,
            });

            // 2. Update Role Assignment
            await api.put(`/users/${user.id}/roles`, {
                role: targetRole,
                unitId: targetUnitId,
                replaceExisting: true,
            });

            setSuccessMessage(`${roleMode} updated successfully!`);
            setTimeout(() => {
                router.push(isRegistrarMode ? "/admin/registrars" : "/admin/users");
            }, 1000);
        } catch (err: any) {
            console.error(err);
            setError(`Failed to update ${roleMode.toLowerCase()}: ` + (err.response?.data?.message || err.message));
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

    // Helper to determine if we should disable headers
    const isStrictBranch = currentScope?.level === 'Branch';
    const isStrictZone = currentScope?.level === 'Zone';

    return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={isRegistrarMode ? "/admin/registrars" : "/admin/users"}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Edit {roleMode}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isRegistrarMode ? 'Registrar Details' : `Jurisdiction for ${user.firstName}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Profile Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
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
                                    className="w-full border rounded-md p-2 text-sm disabled:opacity-50 disabled:bg-gray-100"
                                    value={selectedStateId}
                                    onChange={e => setSelectedStateId(e.target.value)}
                                    disabled={currentScope?.level !== 'National' || isStrictBranch || isStrictZone}
                                >
                                    <option value="">Select State</option>
                                    {states.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Zone</label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm disabled:opacity-50 disabled:bg-gray-100"
                                    value={selectedZoneId}
                                    onChange={e => setSelectedZoneId(e.target.value)}
                                    disabled={(!selectedStateId && !isStrictZone && !isStrictBranch) || (currentScope?.level === 'Zone') || isStrictBranch}
                                >
                                    <option value="">Select Zone</option>
                                    {zones.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Branch</label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm disabled:opacity-50 disabled:bg-gray-100"
                                    value={selectedBranchId}
                                    onChange={e => setSelectedBranchId(e.target.value)}
                                    disabled={(!selectedZoneId && !isStrictBranch)}
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
