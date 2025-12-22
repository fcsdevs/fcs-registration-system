"use client";

import { ProtectedRoute } from "@/components/common/route-guards";
import { DashboardWidgets } from "@/components/admin/DashboardWidgets";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <DashboardWidgets />
    </ProtectedRoute>
  );
}
