"use client";

import React from "react";
import { AdminProvider } from "@/context/admin-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            {children}
        </AdminProvider>
    );
}
