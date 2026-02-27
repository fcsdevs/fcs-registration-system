"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAdmin } from "@/context/admin-context";
import { api } from "@/lib/api/client";
import { unitsApi } from "@/lib/api/units";
import { User } from "@/types";
import { Unit } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";


function EditAdminContent() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { currentScope } = useAdmin();
    const searchParams = useSearchParams();

    const roleMode = searchParams?.get('role') || 'Admin';
    const isRegistrarMode = roleMode === 'Registrar';

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // The 5 hierarchical unit lists
    const [nationalUnits, setNationalUnits] = useState<Unit[]>([]);
    const [areas, setAreas] = useState<Unit[]>([]);
    const [states, setStates] = useState<Unit[]>([]);
    const [zones, setZones] = useState<Unit[]>([]);
    const [branches, setBranches] = useState<Unit[]>([]);

    // Selected IDs at each level
    const [selectedNationalId, setSelectedNationalId] = useState("");
    const [selectedAreaId, setSelectedAreaId] = useState("");
    const [selectedStateId, setSelectedStateId] = useState("");
    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // Helper: derive the role name from the current selection depth
    const getTargetRoleMessage = () => {
        if (isRegistrarMode) return "Registrar";
        if (selectedBranchId) return "Branch Admin";
        if (selectedZoneId) return "Zone Admin";
        if (selectedStateId) return "State Admin";
        if (selectedAreaId) return "Area Admin";
        if (selectedNationalId) return "National Admin";
        return null;
    };

    // Helper: human-readable unit name for the selected deepest unit
    const getSelectedUnitName = () => {
        if (selectedBranchId) return branches.find(b => b.id === selectedBranchId)?.name;
        if (selectedZoneId) return zones.find(z => z.id === selectedZoneId)?.name;
        if (selectedStateId) return states.find(s => s.id === selectedStateId)?.name;
        if (selectedAreaId) return areas.find(a => a.id === selectedAreaId)?.name;
        if (selectedNationalId) return nationalUnits.find(n => n.id === selectedNationalId)?.name;
        return null;
    };

    // ── Step 1: Fetch the user ──────────────────────────────────────────────────
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const res = await api.get<any>(`/users/${userId}`);
                // The API client may wrap in .data or return directly
                const userData = res?.data ?? res;
                if (!userData || !userData.id) throw new Error("Invalid user response");

                setUser(userData);
                setFormData({
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    email: userData.email || "",
                    phone: userData.phoneNumber || userData.phone || "",
                });

                // Pre-select the current assignment
                if (userData.assignments?.length > 0) {
                    const relevantRole = isRegistrarMode ? "Registrar" : "Admin";
                    const assignment =
                        userData.assignments.find((a: any) =>
                            a.role === relevantRole || a.role?.includes(relevantRole)
                        ) || userData.assignments[0];

                    if (assignment?.unitId) {
                        const level = assignment.level;
                        if (level === 'National') setSelectedNationalId(assignment.unitId);
                        else if (level === 'Area') setSelectedAreaId(assignment.unitId);
                        else if (level === 'State') setSelectedStateId(assignment.unitId);
                        else if (level === 'Zone') setSelectedZoneId(assignment.unitId);
                        else if (level === 'Branch') setSelectedBranchId(assignment.unitId);
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

    // ── Step 2: Load initial units based on scope ──────────────────────────────
    useEffect(() => {
        if (!currentScope) return;
        const loadInitialUnits = async () => {
            try {
                if (currentScope.level === 'National') {
                    const natRes = await unitsApi.list({ type: 'National', limit: 10 });
                    if (natRes.data) {
                        const natList = (Array.isArray(natRes.data) ? natRes.data : natRes.data.data) || [];
                        setNationalUnits(natList as Unit[]);
                        if (natList.length === 1 && !selectedNationalId) {
                            setSelectedNationalId(natList[0].id);
                        }
                    }
                    const areaRes = await unitsApi.list({ type: 'Area', limit: 100 });
                    if (areaRes.data) {
                        setAreas((Array.isArray(areaRes.data) ? areaRes.data : areaRes.data.data) || []);
                    }
                } else if (currentScope.level === 'Area' && currentScope.unitId) {
                    const areaRes = await unitsApi.getById(currentScope.unitId);
                    if (areaRes.data) {
                        setAreas([areaRes.data]);
                        setSelectedAreaId(currentScope.unitId);
                    }
                } else if (currentScope.level === 'State' && currentScope.unitId) {
                    const stateRes = await unitsApi.getById(currentScope.unitId);
                    if (stateRes.data) {
                        setStates([stateRes.data]);
                        setSelectedStateId(currentScope.unitId);
                    }
                }
            } catch (e) {
                console.error("Failed to load initial units", e);
            }
        };
        loadInitialUnits();
    }, [currentScope]);

    // ── Load States when Area changes ──────────────────────────────────────────
    useEffect(() => {
        const fetchStates = async () => {
            if (!selectedAreaId) { setStates([]); return; }
            try {
                const res = await unitsApi.getChildren(selectedAreaId);
                if (res.data) setStates(res.data);
            } catch (e) { console.error(e); }
        };
        fetchStates();
        setSelectedStateId("");
        setSelectedZoneId("");
        setSelectedBranchId("");
    }, [selectedAreaId]);

    // ── Load Zones when State changes ──────────────────────────────────────────
    useEffect(() => {
        const fetchZones = async () => {
            if (!selectedStateId) { setZones([]); return; }
            try {
                const res = await unitsApi.getChildren(selectedStateId);
                if (res.data) setZones(res.data);
            } catch (e) { console.error(e); }
        };
        fetchZones();
        setSelectedZoneId("");
        setSelectedBranchId("");
    }, [selectedStateId]);

    // ── Load Branches when Zone changes ──────────────────────────────────────────
    useEffect(() => {
        const fetchBranches = async () => {
            if (!selectedZoneId) { setBranches([]); return; }
            try {
                const res = await unitsApi.getChildren(selectedZoneId);
                if (res.data) setBranches(res.data);
            } catch (e) { console.error(e); }
        };
        fetchBranches();
        setSelectedBranchId("");
    }, [selectedZoneId]);

    // ── Save Handler ───────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!user) return;

        const targetUnitId = selectedBranchId || selectedZoneId || selectedStateId || selectedAreaId || selectedNationalId;
        if (!targetUnitId) { setError("Please select a unit."); return; }

        const targetRole = getTargetRoleMessage();
        if (!targetRole) { setError("Could not determine the role. Please make a selection."); return; }

        setIsSaving(true);
        setSuccessMessage(null);
        setError(null);
        try {
            // Update profile details
            await api.put(`/users/${user.id}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phone,
            });

            // Update role assignment (replace existing)
            await api.put(`/users/${user.id}/roles`, {
                role: targetRole,
                unitId: targetUnitId,
                replaceExisting: true,
            });

            setSuccessMessage(`${roleMode} updated successfully!`);
            setTimeout(() => {
                router.push(isRegistrarMode ? "/admin/registrars" : "/admin/users");
            }, 1200);
        } catch (err: any) {
            console.error(err);
            setError(`Failed to update ${roleMode.toLowerCase()}: ` + (err.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
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

    if (!user && !isLoading) return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto p-8 text-center text-red-600">
                User not found or access denied.
                <br />
                <Link href="/admin/users" className="text-blue-500 underline mt-4 block">Go back</Link>
            </div>
        </ProtectedRoute>
    );

    return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={isRegistrarMode ? "/admin/registrars" : "/admin/users"}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Edit {roleMode}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isRegistrarMode ? 'Registrar Details' : `Jurisdiction for ${user?.firstName}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* ── Profile Fields ──────────────────────────────── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <input type="text" className="w-full border rounded-md p-2 text-sm"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <input type="text" className="w-full border rounded-md p-2 text-sm"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input type="email" className="w-full border rounded-md p-2 text-sm"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input type="tel" className="w-full border rounded-md p-2 text-sm"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>

                        {/* ── Caution Banner ───────────────────────────────── */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
                            <div className="flex">
                                <svg className="h-5 w-5 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800">Caution: Administrative Access</h3>
                                    <p className="mt-1 text-sm text-amber-700">
                                        Modifying these settings will immediately update the user's administrative privileges and access to sensitive data. Please verify the jurisdiction before saving.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Current Assignments Display ───────────────────── */}
                        {user?.assignments && user.assignments.length > 0 ? (
                            <div className="bg-gray-50 p-4 rounded-md border text-sm">
                                <h3 className="font-semibold text-gray-900 mb-2">Current Jurisdictions:</h3>
                                <div className="space-y-2">
                                    {user.assignments.map((assignment: any) => (
                                        <div key={assignment.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                                            <div>
                                                <span className="font-medium text-blue-700 block">{assignment.role}</span>
                                                <span className="text-gray-500 text-xs">{assignment.unitName || 'Unknown Unit'}</span>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded capitalize">
                                                {assignment.level || 'Unknown'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-md border text-sm text-gray-500 italic">
                                No active administrative roles found.
                            </div>
                        )}

                        {/* ── Success / Error Messages ─────────────────────── */}
                        {successMessage && <div className="p-3 bg-green-50 text-green-700 rounded border border-green-200">{successMessage}</div>}
                        {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

                        {/* ── 5-Level Hierarchy Dropdowns ──────────────────── */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Select the organizational unit. The level you stop at determines the assigned role.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

                                {/* National */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">National</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white disabled:opacity-50 disabled:bg-gray-50"
                                        value={selectedNationalId}
                                        onChange={e => {
                                            setSelectedNationalId(e.target.value);
                                            setSelectedAreaId("");
                                            setSelectedStateId("");
                                            setSelectedZoneId("");
                                            setSelectedBranchId("");
                                        }}
                                        disabled={currentScope?.level !== 'National'}
                                    >
                                        <option value="">Select</option>
                                        {nationalUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Area */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Area</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white disabled:opacity-50 disabled:bg-gray-50"
                                        value={selectedAreaId}
                                        onChange={e => {
                                            setSelectedAreaId(e.target.value);
                                            setSelectedStateId("");
                                            setSelectedZoneId("");
                                            setSelectedBranchId("");
                                        }}
                                        disabled={!selectedNationalId || (currentScope?.level !== 'National' && currentScope?.level !== 'Area')}
                                    >
                                        <option value="">Select</option>
                                        {areas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">State</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white disabled:opacity-50 disabled:bg-gray-50"
                                        value={selectedStateId}
                                        onChange={e => {
                                            setSelectedStateId(e.target.value);
                                            setSelectedZoneId("");
                                            setSelectedBranchId("");
                                        }}
                                        disabled={!selectedAreaId || (currentScope !== null && !['National', 'Area', 'State'].includes(currentScope.level))}
                                    >
                                        <option value="">Select</option>
                                        {states.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Zone */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Zone</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white disabled:opacity-50 disabled:bg-gray-50"
                                        value={selectedZoneId}
                                        onChange={e => {
                                            setSelectedZoneId(e.target.value);
                                            setSelectedBranchId("");
                                        }}
                                        disabled={!selectedStateId}
                                    >
                                        <option value="">Select</option>
                                        {zones.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Branch</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white disabled:opacity-50 disabled:bg-gray-50"
                                        value={selectedBranchId}
                                        onChange={e => setSelectedBranchId(e.target.value)}
                                        disabled={!selectedZoneId}
                                    >
                                        <option value="">Select</option>
                                        {branches.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ── Dynamic Role Status Banner ───────────────────── */}
                        {getTargetRoleMessage() && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg text-white flex-shrink-0">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-blue-900">
                                        Role to be assigned:{" "}
                                        <span className="text-blue-600 px-2 py-0.5 bg-white rounded-md shadow-sm ml-1">
                                            {getTargetRoleMessage()}
                                        </span>
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Assigning to: <span className="font-bold">{getSelectedUnitName()}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Save Button ──────────────────────────────────── */}
                        <div className="pt-2 flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !getTargetRoleMessage()}
                                className="bg-primary text-white px-8"
                            >
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

// Suspense wrapper required by Next.js app router for useSearchParams
export default function EditAdminPage() {
    return (
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <EditAdminContent />
        </React.Suspense>
    );
}
