/**
 * Public Event Registration Login
 * Returning users can login with FCS Code + Password
 */

"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LogIn, Key, IdCard, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api/client';
import Link from 'next/link';

export default function EventLoginPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [formData, setFormData] = useState({
        fcsCode: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.fcsCode.trim()) {
            setError('FCS Code is required');
            return;
        }

        if (!formData.password.trim()) {
            setError('Password is required');
            return;
        }

        try {
            setLoading(true);

            const response = await api.post<{ data: { registrationId: string; token: string } }>(
                `/events/${eventId}/login`,
                {
                    fcsCode: formData.fcsCode,
                    password: formData.password,
                }
            );

            // Redirect to their registration dashboard
            router.push(`/events/registration/${response.data.registrationId}?token=${response.data.token}`);
        } catch (error: any) {
            setError(error.message || 'Invalid FCS Code or Password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                        <LogIn className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#010030] mb-2">Welcome Back!</h2>
                    <p className="text-gray-600">Login to manage your event registration</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                FCS Code <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={formData.fcsCode}
                                    onChange={(e) => setFormData({ ...formData, fcsCode: e.target.value.toUpperCase() })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                    placeholder="FCS123456"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Login
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-600 mb-3">
                            First time registering?
                        </p>
                        <Link
                            href={`/events/register/${eventId}`}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors border-2 border-green-200"
                        >
                            <UserPlus className="w-5 h-5" />
                            Create New Registration
                        </Link>
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Lost your FCS Code?</h4>
                    <p className="text-xs text-blue-700">
                        Your FCS Code was sent to your email after registration. Check your inbox or spam folder.
                    </p>
                </div>
            </div>
        </div>
    );
}
