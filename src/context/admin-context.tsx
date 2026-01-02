"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { unitsApi } from "@/lib/api/units";
import { OrganizationalLevel } from "@/types";

interface AdminContextType {
    currentScope: {
        unitId: string;
        level: OrganizationalLevel;
        name: string;
    } | null;
    isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [currentScope, setCurrentScope] = useState<AdminContextType['currentScope']>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchScope = async () => {
            if (!user || !user.unitId) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await unitsApi.getById(user.unitId);
                const unit = response.data;

                if (unit) {
                    setCurrentScope({
                        unitId: unit.id,
                        level: unit.type as OrganizationalLevel,
                        name: unit.name
                    });
                }
            } catch (err) {
                console.error("Failed to fetch admin scope", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchScope();
    }, [user]);

    return (
        <AdminContext.Provider value={{ currentScope, isLoading }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error("useAdmin must be used within AdminProvider");
    }
    return context;
}
