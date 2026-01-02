/**
 * Route Guards and Access Control
 */

"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

/**
 * Protects routes that require authentication
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles.some((role) =>
      requiredRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-error mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Renders content based on user role
 */
export function RoleBasedAccess({
  children,
  roles,
  fallback,
}: {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}) {
  const { user } = useAuth();

  const hasAccess = user?.roles.some((role) => roles.includes(role));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Renders content if user has specific role
 */
export function RequireRole({
  role,
  children,
  fallback,
}: {
  role: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user } = useAuth();

  if (!user?.roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
