/**
 * React Hooks for HRBAC-aware data fetching
 */

import { useEffect, useState } from "react";
import { useAdmin } from "@/context/admin-context";
import { OrganizationalLevel } from "@/types";
import { canAccessUnit as scopeCanAccessUnit } from "@/lib/scope";

/**
 * Hook to check if user can access a specific organizational level
 */
export const useCanAccess = (targetLevel: OrganizationalLevel): boolean => {
  const { scope } = useAdmin();

  if (!scope) return false;
  if (scope.isGlobal) return true;

  const scopeLevel = scope.level as OrganizationalLevel;
  
  // Map levels to numeric values
  const levelOrder = { National: 1, Area: 2, State: 3, Zone: 4, Branch: 5 };
  const scopeValue = levelOrder[scopeLevel] || 0;
  const targetValue = levelOrder[targetLevel] || 0;

  return targetValue >= scopeValue;
};

/**
 * Hook to check if user can manage other admins
 */
export const useCanManageAdmin = (targetLevel: OrganizationalLevel | "None"): boolean => {
  const { scope } = useAdmin();

  if (!scope) return false;
  if (scope.isGlobal) return true;
  if (targetLevel === "None") return false;

  const scopeLevel = scope.level as OrganizationalLevel;
  const levelOrder = { National: 1, Area: 2, State: 3, Zone: 4, Branch: 5, None: 0 };
  const scopeValue = levelOrder[scopeLevel] || 0;
  const targetValue = levelOrder[targetLevel as OrganizationalLevel] || 0;

  return targetValue >= scopeValue;
};

/**
 * Hook to get user's accessible scope info
 */
export const useScope = () => {
  const { scope, canAccessUnit, canManageUsers } = useAdmin();

  return {
    scope,
    isGlobalAdmin: scope?.isGlobal || false,
    level: scope?.level || "None",
    unitId: scope?.unitId,
    unitName: scope?.unitName,
    canAccessUnit,
    canManageUsers,
  };
};

/**
 * Hook to enforce scope access - hides content if user doesn't have access
 */
export const useScopeGuard = (requiredLevel: OrganizationalLevel): boolean => {
  const canAccess = useCanAccess(requiredLevel);
  return canAccess;
};

/**
 * Hook to filter data by user's scope
 */
export const useScopedData = <T extends { unitLevel?: OrganizationalLevel }>(
  data: T[]
): T[] => {
  const { scope } = useAdmin();
  const [filteredData, setFilteredData] = useState<T[]>(data);

  useEffect(() => {
    if (!scope) {
      setFilteredData([]);
      return;
    }

    if (scope.isGlobal) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      if (!item.unitLevel) return false;
      return scopeCanAccessUnit(scope, item.unitLevel);
    });

    setFilteredData(filtered);
  }, [data, scope, scopeCanAccessUnit]);

  return filteredData;
};
