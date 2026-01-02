"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAdmin } from "@/context/admin-context";
import { api } from "@/lib/api/client";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Shield, Search, MoreVertical, Edit } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function AdminUsersPage() {
    const { currentScope, isLoading: isContextLoading } = useAdmin();
    const [admins, setAdmins] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAdmins = async () => {
            if (isContextLoading) return;

            if (!currentScope) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch users for the current unit
                // We fetch all users in the unit/scope and filter for admins client-side
                // to avoid strict role matching issues with the API (e.g. 'State Admin' vs 'admin')
                const query = new URLSearchParams({
                    unitId: currentScope.unitId
                }).toString();

                const response = await api.get<any>(`/users?${query}`);

                if (response) {
                    console.log("Admin Data Received:", response);
                    const data = Array.isArray(response) ? response : (response.data || []);
                    setAdmins(data);
                }
            } catch (err) {
                console.error("Failed to fetch admins", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdmins();
    }, [currentScope, isContextLoading]);

    const handleRevoke = async (userId: string) => {
        if (!confirm("Are you sure you want to revoke admin access for this user?")) return;

        try {
            await api.delete(`/users/${userId}/roles/admin`);
            setAdmins(prev => prev.filter(a => a.id !== userId));
        } catch (err: any) {
            alert("Failed to revoke access: " + err.message);
        }
    };

    // Calculate Stats
    const totalAdmins = admins.length;
    const uniqueRoles = new Set(admins.flatMap(a => a.roles)).size;
    // Assuming admin.level or some unit info is available, else we count unique levels
    const uniqueLevels = new Set(admins.map(a => a.level || 'Unknown')).size;

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage administrators for {currentScope?.name} and sub-units.
                        </p>
                    </div>
                    <Link href="/admin/users/new">
                        <Button className="bg-primary text-white">
                            <Plus className="mr-2 h-4 w-4" /> Assign New Admin
                        </Button>
                    </Link>
                </div>

                {/* Stats Section */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Admins</p>
                                    <h3 className="text-3xl font-bold mt-2 text-gray-900">{totalAdmins}</h3>
                                </div>
                                <Shield className="h-8 w-8 text-blue-600" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Roles</p>
                                    <h3 className="text-3xl font-bold mt-2 text-green-600">{uniqueRoles}</h3>
                                </div>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Shield className="h-5 w-5 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Levels Managed</p>
                                    <h3 className="text-3xl font-bold mt-2 text-purple-600">{uniqueLevels}</h3>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <MoreVertical className="h-5 w-5 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Administrators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : admins.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No other administrators found in this scope.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {admins.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell className="font-medium">
                                                {admin.firstName} {admin.lastName}
                                            </TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell>
                                                {admin.roles.map(role => (
                                                    <span key={role} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                                        {role}
                                                    </span>
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">
                                                    {admin.level ? admin.level : 'Unknown Level'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/users/${admin.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(admin.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                        Revoke
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}
