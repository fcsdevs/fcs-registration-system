"use client";

import React, { useState, useEffect } from "react";
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

export default function AssignAdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedUserId = searchParams.get('userId');
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
    const [states, setStates] = useState<Unit[]>([]);
    const [zones, setZones] = useState<Unit[]>([]);
    const [branches, setBranches] = useState<Unit[]>([]);

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
            // Use the list endpoint with search filter
            const response = await api.get<any>(`/users?search=${encodeURIComponent(searchQuery)}`);
            // The backend returns a flat array of users
            setSearchResults(Array.isArray(response) ? response : (response.data || []));
        } catch (err) {
            console.error("Search failed", err);
            // Fallback for demo if API endpoint doesn't exist
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Unit Fetching Logic (Matched to Signup Page logic but scoped)
    useEffect(() => {
        if (!currentScope) return;

        const loadInitialUnits = async () => {
            // If National, load States
            if (currentScope.level === 'National') {
                const res = await unitsApi.list({ type: 'State' });
                // Handle both paginated and non-paginated responses
                if (res.data) {
                    const statesList = Array.isArray(res.data)
                        ? res.data
                        : (Array.isArray(res.data.data) ? res.data.data : []);
                    setStates(statesList as Unit[]);
                }
            }
            // If State, set States to [currentUnit] and load Zones
            else if (currentScope.level === 'State') {
                // Locking State selection effectively
                const stateRes = await unitsApi.getById(currentScope.unitId);
                if (stateRes.data) {
                    setStates([stateRes.data]);
                    setSelectedStateId(currentScope.unitId);
                }
            }
            // Similar logic for lower levels could apply
        };
        loadInitialUnits();
    }, [currentScope]);

    // Load Zones
    useEffect(() => {
        const fetchZones = async () => {
            if (!selectedStateId) {
                setZones([]);
                return;
            }
            // If current scope is Zone level, lock it
            if (currentScope?.level === 'Zone' && currentScope.unitId) {
                const zoneRes = await unitsApi.getById(currentScope.unitId);
                if (zoneRes.data) {
                    setZones([zoneRes.data]);
                    setSelectedZoneId(currentScope.unitId);
                }
                return;
            }

            // Otherwise fetch children
            try {
                const res = await unitsApi.getChildren(selectedStateId);
                if (res.data) setZones(res.data);
            } catch (e) { console.error(e) }
        };
        fetchZones();
        setSelectedZoneId("");
        setBranches([]);
        setSelectedBranchId("");
    }, [selectedStateId, currentScope]);

    // Load Branches
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
        let targetUnitId = selectedBranchId || selectedZoneId || selectedStateId;

        if (!targetUnitId) {
            setError("Please select the organizational unit (State, Zone, etc.)");
            return;
        }

        // Determine Role based on Type of target unit
        // This requires knowing the type of the selected unit. 
        // Simplified Logic: 
        let targetRole = "";
        if (selectedBranchId) targetRole = "Branch Admin";
        else if (selectedZoneId) targetRole = "Zone Admin";
        else if (selectedStateId) targetRole = "State Admin";
        else if (currentScope?.level === 'National') targetRole = "National Admin";
        else targetRole = "State Admin"; // Fallback

        // Note: Actual mapping depends on your Roles definition. 
        // 'admin' might be generic, 'leader' might be branch. 
        // Let's assume user wants "Admin" of that level.

        console.log("🔍 [DEBUG] Assignment Details:", {
            selectedUser: selectedUser.id,
            targetRole,
            targetUnitId,
            selectedStateId,
            selectedZoneId,
            selectedBranchId
        });

        setIsSaving(true);
        setSuccessMessage(null);
        setError(null);
        try {
            const response = await api.put(`/users/${selectedUser.id}/roles`, {
                role: targetRole,
                unitId: targetUnitId,
                // We might need to pass specific Unit Level too
            });
            console.log("✅ [DEBUG] Assignment Response:", response);
            setSuccessMessage("Admin assigned successfully!");
            setTimeout(() => {
                router.push("/admin/users");
            }, 1500);
        } catch (err: any) {
            console.error("❌ [DEBUG] Assignment failed:", err);
            console.error("❌ [DEBUG] Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            const errorMessage = err.response?.data?.message || err.message || "Unknown error occurred";
            setError("Failed to assign role: " + errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assign New Admin</h1>
                    <p className="text-muted-foreground">Search for a member and assign them an administrative role.</p>
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
                        <CardHeader><CardTitle>Assign Jurisdiction</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Select the organizational unit this user will administer.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* State Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm"
                                        value={selectedStateId}
                                        onChange={e => setSelectedStateId(e.target.value)}
                                        disabled={currentScope?.level !== 'National'} // Lock if not National
                                    >
                                        <option value="">Select State</option>
                                        {(states || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Zone Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Zone / Area</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm"
                                        value={selectedZoneId}
                                        onChange={e => setSelectedZoneId(e.target.value)}
                                        disabled={!selectedStateId || (currentScope?.level === 'Zone')}
                                    >
                                        <option value="">Select Zone</option>
                                        {(zones || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>

                                {/* Branch Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Branch</label>
                                    <select
                                        className="w-full border rounded-md p-2 text-sm"
                                        value={selectedBranchId}
                                        onChange={e => setSelectedBranchId(e.target.value)}
                                        disabled={!selectedZoneId}
                                    >
                                        <option value="">Select Branch</option>
                                        {(branches || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t flex justify-end">
                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedStateId || isSaving}
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
