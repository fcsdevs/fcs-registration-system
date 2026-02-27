"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAdmin } from "@/context/admin-context";
import { api } from "@/lib/api/client";
import { unitsApi } from "@/lib/api/units";
import { User, OrganizationalLevel } from "@/types";
import { Unit } from "@/types/api"; // Ensure mapped correctly
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserPlus, Check, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AssignAdminContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedUserId = searchParams.get('userId');
    const roleParam = searchParams.get('role'); // Get the role parameter
    const isRegistrarMode = roleParam === 'Registrar';
    const { currentScope } = useAdmin();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Effect to handle pre-selected user
    useEffect(() => {
        if (preselectedUserId) {
            const fetchUser = async () => {
                try {
                    const response = await api.get<any>(`/users/${preselectedUserId}`);
                    if (response.data) {
                        setSelectedUser(response.data);
                        setSearchQuery(response.data.email || response.data.firstName);
                    }
                } catch (error) {
                    console.error("Failed to fetch preselected user:", error);
                }
            };
            fetchUser();
        }
    }, [preselectedUserId]);

    // Assignment State
    const [nationalUnits, setNationalUnits] = useState<Unit[]>([]);
    const [areas, setAreas] = useState<Unit[]>([]);
    const [states, setStates] = useState<Unit[]>([]);
    const [zones, setZones] = useState<Unit[]>([]);
    const [branches, setBranches] = useState<Unit[]>([]);

    const [selectedNationalId, setSelectedNationalId] = useState("");
    const [selectedAreaId, setSelectedAreaId] = useState("");
    const [selectedStateId, setSelectedStateId] = useState("");
    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [selectedBranchId, setSelectedBranchId] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Search Handler
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSuccessMessage(null);
        setError(null);
        try {
            const response = await api.get<any>(`/users?search=${encodeURIComponent(searchQuery)}`);
            setSearchResults(Array.isArray(response) ? response : (response.data || []));
        } catch (err) {
            console.error("Search failed", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Helper to get target role name for display
    const getTargetRoleMessage = () => {
        if (isRegistrarMode) return "Registrar";
        if (selectedBranchId) return "Branch Admin";
        if (selectedZoneId) return "Zone Admin";
        if (selectedStateId) return "State Admin";
        if (selectedAreaId) return "Area Admin";
        if (selectedNationalId) return "National Admin";
        return null;
    };

    // Unit Fetching Logic (Matched to Signup Page logic but scoped)
    useEffect(() => {
        if (!currentScope) return;

        const loadInitialUnits = async () => {
            try {
                // If National, load National units and top-level children (Areas)
                if (currentScope.level === 'National') {
                    const natRes = await unitsApi.list({ type: 'National', limit: 10 });
                    if (natRes.data) {
                        const natList = (Array.isArray(natRes.data) ? natRes.data : natRes.data.data) || [];
                        setNationalUnits(natList as Unit[]);
                        if (natList.length === 1) {
                            setSelectedNationalId(natList[0].id);
                        }
                    }

                    // Load Areas as level 2
                    const areaRes = await unitsApi.list({ type: 'Area', limit: 100 });
                    if (areaRes.data) {
                        setAreas((Array.isArray(areaRes.data) ? areaRes.data : areaRes.data.data) || []);
                    }
                }
                // If Area, lock Area and fetch States
                else if (currentScope.level === 'Area' && currentScope.unitId) {
                    const areaRes = await unitsApi.getById(currentScope.unitId);
                    if (areaRes.data) {
                        setAreas([areaRes.data]);
                        setSelectedAreaId(currentScope.unitId);
                    }
                }
                // If State, lock State and fetch Zones
                else if (currentScope.level === 'State' && currentScope.unitId) {
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

    // Load States when Area changes
    useEffect(() => {
        const fetchStates = async () => {
            if (!selectedAreaId) {
                // If we have selected National but no Area, maybe load all states? 
                // Typically follow hierarchy: Nat -> Area -> State
                setStates([]);
                return;
            }
            try {
                const res = await unitsApi.getChildren(selectedAreaId);
                if (res.data) setStates(res.data);
            } catch (e) { console.error(e) }
        };
        fetchStates();
        setSelectedStateId("");
        setSelectedZoneId("");
        setSelectedBranchId("");
    }, [selectedAreaId]);

    // Load Zones when State changes
    useEffect(() => {
        const fetchZones = async () => {
            if (!selectedStateId) {
                setZones([]);
                return;
            }
            try {
                const res = await unitsApi.getChildren(selectedStateId);
                if (res.data) setZones(res.data);
            } catch (e) { console.error(e) }
        };
        fetchZones();
        setSelectedZoneId("");
        setSelectedBranchId("");
    }, [selectedStateId]);

    // Load Branches when Zone changes
    useEffect(() => {
        const fetchBranches = async () => {
            if (!selectedZoneId) {
                setBranches([]);
                return;
            }
            try {
                const res = await unitsApi.getChildren(selectedZoneId);
                if (res.data) setBranches(res.data);
            } catch (e) { console.error(e) }
        };
        fetchBranches();
        setSelectedBranchId("");
    }, [selectedZoneId]);


    const handleAssign = async () => {
        if (!selectedUser) return;

        // Determine target unit
        let targetUnitId = selectedBranchId || selectedZoneId || selectedStateId || selectedAreaId || selectedNationalId;

        if (!targetUnitId) {
            setError("Please select the organizational unit (National, Area, State, etc.)");
            return;
        }

        const targetRole = getTargetRoleMessage();
        if (!targetRole) return;

        setIsSaving(true);
        setSuccessMessage(null);
        setError(null);
        try {
            await api.put(`/users/${selectedUser.id}/roles`, {
                role: targetRole,
                unitId: targetUnitId,
            });
            setSuccessMessage(isRegistrarMode ? "Registrar assigned successfully!" : "Admin assigned successfully!");
            setTimeout(() => {
                router.push(isRegistrarMode ? "/admin/registrars" : "/admin/users");
            }, 1500);
        } catch (err: any) {
            console.error("Assignment failed:", err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
            setError("Failed to assign role: " + errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isRegistrarMode ? 'Assign New Registrar' : 'Assign New Admin'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isRegistrarMode
                            ? 'Search for a member and assign them the Registrar role.'
                            : 'Search for a member and assign them an administrative role.'}
                    </p>
                    {successMessage && (
                        <div className="mt-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                {/* Step 1: Search */}
                <Card>
                    <CardHeader><CardTitle>Select Member</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search by name, email, or FCS code..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <Button type="submit" disabled={isSearching}>
                                {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                            </Button>
                        </form>

                        {searchResults.length > 0 && (
                            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                                {searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <div>
                                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                                            <p className="text-sm text-gray-500">{user.email} • {user.memberCode || "No Code"}</p>
                                        </div>
                                        {selectedUser?.id === user.id && <Check className="text-blue-500 w-5 h-5" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Step 2: Assign Scope */}
                {selectedUser && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Assign Jurisdiction</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                Select the organizational unit this user will administer. The depth of your selection determines the specific role.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {/* National Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">National</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white"
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
                                        <option value="">Select National</option>
                                        {(nationalUnits || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Area Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white"
                                        value={selectedAreaId}
                                        onChange={e => {
                                            setSelectedAreaId(e.target.value);
                                            setSelectedStateId("");
                                            setSelectedZoneId("");
                                            setSelectedBranchId("");
                                        }}
                                        disabled={!selectedNationalId || (currentScope?.level !== 'National' && currentScope?.level !== 'Area')}
                                    >
                                        <option value="">Select Area</option>
                                        {(areas || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* State Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white"
                                        value={selectedStateId}
                                        onChange={e => {
                                            setSelectedStateId(e.target.value);
                                            setSelectedZoneId("");
                                            setSelectedBranchId("");
                                        }}
                                        disabled={!selectedAreaId || (!!currentScope && !['National', 'Area', 'State'].includes(currentScope.level))}
                                    >
                                        <option value="">Select State</option>
                                        {(states || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Zone Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Zone</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white"
                                        value={selectedZoneId}
                                        onChange={e => {
                                            setSelectedZoneId(e.target.value);
                                            setSelectedBranchId("");
                                        }}
                                        disabled={!selectedStateId}
                                    >
                                        <option value="">Select Zone</option>
                                        {(zones || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Branch Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Branch</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm bg-white"
                                        value={selectedBranchId}
                                        onChange={e => setSelectedBranchId(e.target.value)}
                                        disabled={!selectedZoneId}
                                    >
                                        <option value="">Select Branch</option>
                                        {(branches || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Status Message */}
                            {getTargetRoleMessage() && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-blue-900">
                                            Role to be assigned: <span className="text-blue-600 px-2 py-0.5 bg-white rounded-md shadow-sm ml-1">{getTargetRoleMessage()}</span>
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Assigning to: <span className="font-bold">
                                                {selectedBranchId ? branches.find(b => b.id === selectedBranchId)?.name :
                                                    selectedZoneId ? zones.find(z => z.id === selectedZoneId)?.name :
                                                        selectedStateId ? states.find(s => s.id === selectedStateId)?.name :
                                                            selectedAreaId ? areas.find(a => a.id === selectedAreaId)?.name :
                                                                nationalUnits.find(n => n.id === selectedNationalId)?.name}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 mt-4 border-t flex justify-end">
                                <Button
                                    onClick={handleAssign}
                                    disabled={(!selectedStateId && !selectedNationalId && !selectedAreaId) || isSaving}
                                    className="px-8"
                                >
                                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 w-4 h-4" />}
                                    Confirm Assignment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProtectedRoute>

    );
}

export default function AssignAdminPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <AssignAdminContent />
        </Suspense>
    );
}
