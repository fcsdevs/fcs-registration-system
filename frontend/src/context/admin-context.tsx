"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { unitsApi } from "@/lib/api/units";
import { OrganizationalLevel, OrganizationalUnit } from "@/types";
import { AdminScope, isGlobalAdmin, HIERARCHY_ORDER } from "@/lib/scope";

interface AdminContextType {
  scope: AdminScope | null;
  currentScope: AdminScope | null;
  currentUnit: OrganizationalUnit | null;
  isLoading: boolean;
  canAccessUnit: (targetLevel: OrganizationalLevel) => boolean;
  canManageUsers: (targetScope: AdminScope) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [scope, setScope] = useState<AdminScope | null>(null);
  const [currentUnit, setCurrentUnit] = useState<OrganizationalUnit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize admin scope from user roles and assignments
  useEffect(() => {
    const initializeScope = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is National/Super Admin
        const isNational = user.roles?.some(
          (r: string) => r.toLowerCase().includes('national') || r.toLowerCase().includes('super')
        );

        if (isNational) {
          setScope({
            unitId: null,
            isGlobal: true,
            level: 'National',
            unitName: 'FCS National',
            hierarchy: { national: true },
          });
          setIsLoading(false);
          return;
        }

        // For non-global admins, fetch their unit
        if (user.unitId) {
          try {
            const response = await unitsApi.getById(user.unitId);
            const unit = response.data;

            if (unit) {
              const userLevel = unit.type as OrganizationalLevel;
              
              setScope({
                unitId: unit.id,
                isGlobal: false,
                level: userLevel,
                unitName: unit.name,
                hierarchy: { [userLevel.toLowerCase()]: true },
              });

              setCurrentUnit({
                id: unit.id,
                name: unit.name,
                level: userLevel,
                parentId: unit.parentId,
                code: unit.code || '',
              });
            }
          } catch (err) {
            console.error("Failed to fetch admin unit:", err);
            // Fallback to basic scope from user data
            setScope({
              unitId: user.unitId,
              isGlobal: false,
              level: 'Branch' as OrganizationalLevel,
              unitName: user.unitName || 'Unknown Unit',
            });
          }
        } else {
          // No admin scope
          setScope({
            unitId: null,
            isGlobal: false,
            level: 'None',
            unitName: undefined,
          });
        }
      } catch (err) {
        console.error("Failed to initialize admin scope:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeScope();
  }, [user]);

  // Provide helper methods for scope checking
  const canAccessUnit = (targetLevel: OrganizationalLevel): boolean => {
    if (!scope) return false;
    if (scope.isGlobal) return true;

    const scopeLevelIndex = HIERARCHY_ORDER.indexOf(scope.level as OrganizationalLevel);
    const targetLevelIndex = HIERARCHY_ORDER.indexOf(targetLevel);

    // Can access if target is same level or descendant (higher index)
    return targetLevelIndex >= scopeLevelIndex;
  };

  const canManageUsers = (targetScope: AdminScope): boolean => {
    if (!scope) return false;
    if (scope.isGlobal) return true;

    // Can manage if target is within own scope
    return canAccessUnit(targetScope.level as OrganizationalLevel);
  };

  return (
    <AdminContext.Provider
      value={{
        scope,
        currentScope: scope,
        currentUnit,
        isLoading,
        canAccessUnit,
        canManageUsers,
      }}
    >
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
