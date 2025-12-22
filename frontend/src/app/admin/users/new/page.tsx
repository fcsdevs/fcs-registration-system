"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    const { currentScope } = useAdmin();

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
            // Mock search endpoint or use list with filter
            const response = await api.get<any>(`/users/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(response.data.data || []);
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
                if (res.data) setStates(res.data.data);
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

        setIsSaving(true);
        setSuccessMessage(null);
        setError(null);
        try {
            await api.put(`/users/${selectedUser.id}/roles`, {
                role: targetRole,
                unitId: targetUnitId,
                // We might need to pass specific Unit Level too
            });
            setSuccessMessage("Admin assigned successfully!");
            setTimeout(() => {
                router.push("/admin/users");
            }, 1500);
        } catch (err: any) {
            console.error("Assignment failed", err);
            setError("Failed to assign role: " + err.message);
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
                    <CardHeader><CardTitle>1. Select Member</CardTitle></CardHeader>
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
                        <CardHeader><CardTitle>2. Assign Jurisdiction</CardTitle></CardHeader>
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
                                        {states.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
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
                                        {zones.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
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
                                        {branches.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t flex justify-end">
                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedStateId || isSaving}
                                    className="bg-primary text-white"
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
