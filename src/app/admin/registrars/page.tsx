"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAdmin } from "@/context/admin-context";
import { api } from "@/lib/api/client";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Users, Search, MoreVertical, Edit, UserPlus } from "lucide-react";
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

export default function RegistrarsPage() {
    const { currentScope, isLoading: isContextLoading } = useAdmin();
    const [registrars, setRegistrars] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrars = async () => {
            if (isContextLoading) return;

            if (!currentScope) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch users with the Registrar role
                const query = new URLSearchParams({
                    role: 'Registrar',
                    unitId: currentScope.unitId
                }).toString();

                const response = await api.get<any>(`/users?${query}`);

                const data = Array.isArray(response) ? response : (response.data || []);
                setRegistrars(data);
            } catch (err) {
                console.error("Failed to fetch registrars", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistrars();
    }, [currentScope, isContextLoading]);

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Registrar Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage users authorized to register members at {currentScope?.name}.
                        </p>
                    </div>
                    <Link href="/admin/users/new?role=Registrar">
                        <Button className="bg-primary text-white">
                            <UserPlus className="mr-2 h-4 w-4" /> Add New Registrar
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Authorized Registrars</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : registrars.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No registrars found for this unit.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registrars.map((registrar) => (
                                        <TableRow key={registrar.id}>
                                            <TableCell className="font-medium">
                                                {registrar.firstName} {registrar.lastName}
                                            </TableCell>
                                            <TableCell>{registrar.email || registrar.phone}</TableCell>
                                            <TableCell>
                                                {registrar.roles.map(role => (
                                                    <span key={role} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1">
                                                        {role}
                                                    </span>
                                                ))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                        Remove
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
