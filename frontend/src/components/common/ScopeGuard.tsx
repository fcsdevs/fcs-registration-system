/**
 * HRBAC-aware UI Components
 */

"use client";

import React, { ReactNode } from "react";
import { useAdmin } from "@/context/admin-context";
import { OrganizationalLevel } from "@/types";

interface ScopeGuardProps {
  requiredLevel: OrganizationalLevel;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders if user has access to the required level
 */
export const ScopeGuard: React.FC<ScopeGuardProps> = ({
  requiredLevel,
  children,
  fallback = null,
}) => {
  const { scope } = useAdmin();

  if (!scope) return fallback;
  if (scope.isGlobal) return <>{children}</>;

  const levelOrder = { National: 1, Area: 2, State: 3, Zone: 4, Branch: 5, None: 0 };
  const scopeValue = levelOrder[scope.level as OrganizationalLevel] || 0;
  const requiredValue = levelOrder[requiredLevel] || 0;

  const canAccess = requiredValue >= scopeValue;

  return canAccess ? <>{children}</> : <>{fallback}</>;
};

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders for national admins
 */
export const NationalAdminOnly: React.FC<AdminOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const { scope } = useAdmin();

  if (!scope?.isGlobal) return fallback;

  return <>{children}</>;
};

interface AreaAdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders for area-level and above admins
 */
export const AreaAdminOnly: React.FC<AreaAdminOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const { scope } = useAdmin();

  if (!scope) return fallback;

  const levelOrder = { National: 1, Area: 2, State: 3, Zone: 4, Branch: 5, None: 0 };
  const scopeValue = levelOrder[scope.level as OrganizationalLevel] || 0;

  return scopeValue <= 2 ? <>{children}</> : <>{fallback}</>;
};

/**
 * Scope info badge showing current admin level
 */
export const ScopeBadge: React.FC = () => {
  const { scope } = useAdmin();

  if (!scope || scope.level === "None") return null;

  const badgeColor = {
    National: "bg-purple-600",
    Area: "bg-blue-600",
    State: "bg-green-600",
    Zone: "bg-yellow-600",
    Branch: "bg-gray-600",
  };

  const color = badgeColor[scope.level as OrganizationalLevel] || "bg-gray-400";

  return (
    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${color}`}>
      {scope.level} {scope.isGlobal ? "(Admin)" : `- ${scope.unitName}`}
    </span>
  );
};

/**
 * Display current admin's scope information
 */
export const ScopeInfo: React.FC = () => {
  const { scope, currentUnit } = useAdmin();

  if (!scope || scope.level === "None") {
    return <p className="text-gray-500">No administrative scope</p>;
  }

  if (scope.isGlobal) {
    return (
      <div className="p-4 bg-purple-50 border border-purple-200 rounded">
        <h3 className="font-semibold text-purple-900">National Administrator</h3>
        <p className="text-purple-700 text-sm">Full access to all units and operations</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h3 className="font-semibold text-blue-900">
        {scope.level} Administrator
      </h3>
      <p className="text-blue-700 text-sm">
        Unit: <strong>{scope.unitName}</strong>
      </p>
      {currentUnit && (
        <p className="text-blue-700 text-sm">
          Code: <code>{currentUnit.code}</code>
        </p>
      )}
    </div>
  );
};

/**
 * Hierarchical level selector with scope enforcement
 */
interface HierarchyLevelFilterProps {
  value: OrganizationalLevel | "all";
  onChange: (level: OrganizationalLevel | "all") => void;
}

export const HierarchyLevelFilter: React.FC<HierarchyLevelFilterProps> = ({
  value,
  onChange,
}) => {
  const { scope } = useAdmin();

  if (!scope) return null;

  const allLevels: OrganizationalLevel[] = ["National", "Area", "State", "Zone", "Branch"];
  
  let accessibleLevels = allLevels;
  if (!scope.isGlobal && scope.level !== "None") {
    const levelOrder = { National: 1, Area: 2, State: 3, Zone: 4, Branch: 5 };
    const scopeValue = levelOrder[scope.level as OrganizationalLevel] || 0;
    accessibleLevels = allLevels.filter(
      (level) => levelOrder[level] >= scopeValue
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange("all")}
        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
          value === "all"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        All Levels
      </button>
      {accessibleLevels.map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            value === level
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};
