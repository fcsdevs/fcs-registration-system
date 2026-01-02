"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { DashboardWidgets } from "@/components/admin/DashboardWidgets";
import { useAuth } from "@/context/auth-context";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const isAdmin = user.roles?.some((r: any) => {
        const role = r.toLowerCase();
        return role.includes('admin') || role === 'leader';
      });

      if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
      <DashboardWidgets />
    </ProtectedRoute>
  );
}
