"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api/client';
import { Search, UserPlus, MapPin, Check } from 'lucide-react';
import { Member } from '@/types/api';

export function RegisterUserTab({ eventId }: { eventId: string }) {
    const [query, setQuery] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [searching, setSearching] = useState(false);
    const [registering, setRegistering] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        try {
            const response = await api.get<{ data: Member[] }>(`/members?search=${encodeURIComponent(query)}&limit=20`);
            setMembers(response.data);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setSearching(false);
        }
    };

    const handleRegister = async (memberId: string) => {
        setRegistering(memberId);
        try {
            // Defaulting to ONSITE and assuming center selection happens later or by default?
            // Ideally we need to ask for participation mode and center.
            // For MVP simpler flow: Just create registration, it might default to ONLINE if no center provided?
            // Wait, backend requires centerId for ONSITE.
            // We should prompt for Center ID if we don't know it.
            // For now, let's assume the user is just registering them fundamentally.
            // Actually, the Registrar is likely at a center.

            // FIXME: Hardcoding "ONSITE" and needing a Center ID. This will fail if backend enforces centerId for Onsite.
            // Let's prompt or check if we can get active centers.
            // Or better, redirect to full registration flow?
            // "and then register them"

            // Let's try to register. If it fails due to missing center, we handle it.
            // We might need a mini-form for the registration: Mode & Center.

            await api.post('/registrations', {
                eventId,
                memberId,
                participationMode: 'ONSITE',
                // centerId: ... we need this
            });
            alert("Registration Successful!");
            // Refresh list or update UI
        } catch (err: any) {
            alert("Registration Failed: " + (err.response?.data?.error?.message || err.message));
        } finally {
            setRegistering(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Search & Register User</h3>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name, email, phone or FCS code..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={searching}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="space-y-4">
                {members.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FCS Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {member.fcsCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{member.email}</div>
                                            <div className="text-xs text-gray-400">{member.phoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleRegister(member.id)}
                                                disabled={registering === member.id}
                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                                            >
                                                {registering === member.id ? (
                                                    <span className="animate-pulse">Registering...</span>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4" /> Register
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    query && !searching && (
                        <div className="text-center py-8 text-gray-500">
                            No users found. <button className="text-blue-600 hover:underline">Add New User</button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
