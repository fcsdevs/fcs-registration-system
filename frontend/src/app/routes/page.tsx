/**
 * Debug/Routes Overview Page
 * Shows all available routes in the application
 */

"use client";

import { getAllRoutes, getPublicRoutes, getProtectedRoutes } from "@/config/routes";
import Link from "next/link";

export default function RoutesPage() {
  const allRoutes = getAllRoutes();
  const publicRoutes = getPublicRoutes();
  const protectedRoutes = getProtectedRoutes();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Application Routes</h1>
        <p className="text-gray-600 mb-8">Complete map of all pages and navigation</p>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary">{allRoutes.length}</div>
            <div className="text-gray-600">Total Routes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{publicRoutes.length}</div>
            <div className="text-gray-600">Public Routes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{protectedRoutes.length}</div>
            <div className="text-gray-600">Protected Routes</div>
          </div>
        </div>

        {/* Public Routes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">🌐 Public Routes</h2>
          <p className="text-gray-600 mb-4">Accessible without authentication</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicRoutes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4 group"
              >
                <div className="text-lg font-semibold text-primary group-hover:underline">
                  {route.label}
                </div>
                <div className="text-sm text-gray-600 mb-2">{route.path}</div>
                <div className="text-xs text-gray-500">{route.description}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Protected Routes */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🔒 Protected Routes</h2>
          <p className="text-gray-600 mb-4">Require authentication. You'll be redirected to login if not authenticated.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {protectedRoutes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4 group border-l-4 border-blue-500"
              >
                <div className="text-lg font-semibold text-blue-600 group-hover:underline">
                  {route.label}
                </div>
                <div className="text-sm text-gray-600 mb-2">{route.path}</div>
                <div className="text-xs text-gray-500">{route.description}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Quick Navigation</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>✅ Dashboard:</strong> Use <code className="bg-gray-100 px-2 py-1 rounded">/home</code> (not /dashboard)
            </p>
            <p className="text-sm text-gray-600">
              <strong>📍 Landing:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/landing</code> or <code className="bg-gray-100 px-2 py-1 rounded">/</code>
            </p>
            <p className="text-sm text-gray-600">
              <strong>🔑 Login:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/auth/login</code>
            </p>
            <p className="text-sm text-gray-600">
              <strong>📝 Sign Up:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/auth/signup</code>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
