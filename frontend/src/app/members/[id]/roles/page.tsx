"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Shield,
    ArrowLeft,
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import Link from "next/link";

interface RoleAssignment {
    id: string;
    role: {
        id: string;
        name: string;
        description: string;
    };
    unit?: {
        id: string;
        name: string;
        type: string;
    };
    assignedAt: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
    unitScope: boolean;
}

interface Unit {
    id: string;
    name: string;
    type?: string;
}

export default function MemberRolesPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const memberId = params.id as string;
    const initialAction = searchParams.get('action');

    const [member, setMember] = useState<any>(null);
    const [roles, setRoles] = useState<RoleAssignment[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [memberId]);

    // Pre-select role if action is registrar
    useEffect(() => {
        if (initialAction === 'registrar' && availableRoles.length > 0) {
            // Find a role that looks like "Registrar" or "Admin"
            const registrarRole = availableRoles.find(r => r.name.toLowerCase().includes('registrar')) ||
                availableRoles.find(r => r.name.toLowerCase().includes('admin'));
            if (registrarRole) {
                setSelectedRoleId(registrarRole.id);
            }
        }
    }, [initialAction, availableRoles]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Get Member Details to find AuthUser ID
            const memberRes = await api.get<any>(`/members/${memberId}`);
            const memberData = memberRes.data || memberRes;
            setMember(memberData);

            if (!memberData.authUserId) {
                // If member has no auth user, they can't have roles usually.
                // We might need to create an auth user for them first?
                // For now, just show error or handle gracefully.
                setMessage({ type: 'error', text: "This member does not have a linked user account. They cannot be assigned admin roles." });
                setLoading(false);
                return;
            }

            // 2. Get Current Roles
            try {
                const rolesRes = await api.get<any>(`/roles/users/${memberData.authUserId}`);
                setRoles(rolesRes.roles || []);
            } catch (err) {
                console.warn("Failed to fetch roles", err);
                // Likely 404 if no roles or user not found in auth system?
            }

            // 3. Get Available Roles & Units
            const [allRolesRes, allUnitsRes] = await Promise.all([
                api.get<any>('/roles'),
                api.get<any>('/units')
            ]);

            const rolesList = allRolesRes.data || allRolesRes;
            // It might be paginated { data: [] }
            setAvailableRoles(Array.isArray(rolesList) ? rolesList : (rolesList.data || []));

            const unitsList = allUnitsRes.data || allUnitsRes;
            // It might be paginated
            setAvailableUnits(Array.isArray(unitsList) ? unitsList : (unitsList.data || []));

        } catch (error) {
            console.error("Failed to load data:", error);
            setMessage({ type: 'error', text: "Failed to load member data." });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoleId || !member?.authUserId) return;

        // Check if role requires unit
        const roleDef = availableRoles.find(r => r.id === selectedRoleId);
        if (roleDef?.unitScope && !selectedUnitId) {
            setMessage({ type: 'error', text: "This role requires a Unit to be selected." });
            return;
        }

        try {
            setAssigning(true);
            setMessage(null);

            // POST /api/roles/:roleId/users/:userId
            // Body usually { unitId: ... }
            await api.post(`/roles/${selectedRoleId}/users/${member.authUserId}`, {
                unitId: selectedUnitId || undefined
            });

            setMessage({ type: 'success', text: "Role assigned successfully!" });

            // Refresh list
            const rolesRes = await api.get<any>(`/roles/users/${member.authUserId}`);
            setRoles(rolesRes.roles || []);

            // Reset form
            setSelectedRoleId("");
            setSelectedUnitId("");

        } catch (error: any) {
            console.error("Failed to assign role:", error);
            setMessage({ type: 'error', text: error.message || "Failed to assign role" });
        } finally {
            setAssigning(false);
        }
    };

    const handleRevokeRole = async (roleId: string) => {
        if (!confirm("Are you sure you want to revoke this role?")) return;
        if (!member?.authUserId) return;

        try {
            // DELETE /api/roles/:roleId/users/:userId
            await api.delete(`/roles/${roleId}/users/${member.authUserId}`);

            setMessage({ type: 'success', text: "Role revoked successfully!" });
            // Refresh list
            const rolesRes = await api.get<any>(`/roles/users/${member.authUserId}`);
            setRoles(rolesRes.roles || []);
        } catch (error: any) {
            console.error("Failed to revoke role:", error);
            setMessage({ type: 'error', text: error.message || "Failed to revoke role" });
        }
    };

    if (loading && !member) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Back Button */}
                    <Link href="/members" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Members
                    </Link>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Manage Roles</h1>
                                    <p className="text-sm text-gray-500">
                                        for {member?.firstName} {member?.lastName} <span className="text-gray-400">({member?.fcsCode})</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">

                            {message && (
                                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                    <p className="text-sm font-medium pt-0.5">{message.text}</p>
                                </div>
                            )}

                            {/* Current Roles */}
                            <div className="mb-8">
                                <h2 className="text-base font-semibold text-gray-900 mb-4">Assigned Roles</h2>
                                {roles.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-gray-500 mb-1">No roles assigned</p>
                                        <p className="text-xs text-gray-400">This user has member-only access</p>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium text-gray-700">Role</th>
                                                    <th className="px-4 py-3 font-medium text-gray-700">Scope / Unit</th>
                                                    <th className="px-4 py-3 font-medium text-gray-700 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {roles.map((assignment) => (
                                                    <tr key={assignment.id} className="bg-white">
                                                        <td className="px-4 py-3 text-gray-900 font-medium">{assignment.role.name}</td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            {assignment.unit ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 text-xs">
                                                                    {assignment.unit.name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Global</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleRevokeRole(assignment.role.id)}
                                                                className="text-red-600 hover:text-red-700 font-medium text-xs inline-flex items-center gap-1"
                                                            >
                                                                Revoke
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Assign New Role */}
                            <div className="pt-6 border-t border-gray-100">
                                <h2 className="text-base font-semibold text-gray-900 mb-4">Assign New Role</h2>
                                <form onSubmit={handleAssignRole} className="space-y-4 max-w-lg">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                                        <select
                                            value={selectedRoleId}
                                            onChange={(e) => setSelectedRoleId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">-- Select a Role --</option>
                                            {availableRoles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                        {selectedRoleId && availableRoles.find(r => r.id === selectedRoleId)?.description && (
                                            <p className="mt-1 text-xs text-gray-500">{availableRoles.find(r => r.id === selectedRoleId)?.description}</p>
                                        )}
                                    </div>

                                    {/* Show Unit Selector only if role is scoped (or assumed to be scoped for now if we don't know) 
                            Actually the availableRoles fetched usually have a `unitScope` field.
                        */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Scope / Unit <span className="text-gray-400 font-normal">(Optional for global roles)</span>
                                        </label>
                                        <select
                                            value={selectedUnitId}
                                            onChange={(e) => setSelectedUnitId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={selectedRoleId && availableRoles.find(r => r.id === selectedRoleId)?.unitScope === false}
                                        >
                                            <option value="">-- Global / No Unit --</option>
                                            {availableUnits.map(unit => (
                                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={assigning || !selectedRoleId}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {assigning ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Assigning...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Assign Role
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
