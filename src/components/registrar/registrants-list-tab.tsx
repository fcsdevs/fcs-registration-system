"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';
import { Search, Printer, Download, Filter, Ticket, CheckSquare, Square } from 'lucide-react';
import { Registration } from '@/types/api';

export function RegistrantsListTab({ eventId }: { eventId: string }) {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Fetch current user to know ID for "mine" filter
        api.get<any>('/auth/profile').then(res => setCurrentUser(res.data)).catch(console.error);
    }, []);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            let url = `/registrations?eventId=${eventId}&page=${page}&limit=20`;

            if (filterMode === 'mine' && currentUser?.id) {
                url += `&registeredBy=${currentUser.id}`;
            }

            const response = await api.get<{ data: Registration[], meta: any }>(url);
            setRegistrations(response.data);
            setTotalPages(response.meta?.totalPages || 1);
            // Clear selection on page change or refetch to avoid confusion
            setSelectedIds(new Set());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser || filterMode === 'all') {
            fetchRegistrations();
        }
    }, [eventId, page, filterMode, currentUser]);

    const handlePrintList = () => {
        window.print();
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const toggleAll = () => {
        if (selectedIds.size === registrations.length && registrations.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(registrations.map(r => r.id)));
        }
    };

    const handlePrintTags = () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds).join(',');
        window.open(`/my-events/${eventId}/registrar/tags?ids=${ids}`, '_blank');
    };

    const handlePrintAllTags = () => {
        // Open with filter params to print all matching criteria
        let url = `/my-events/${eventId}/registrar/tags?`;
        if (filterMode === 'mine' && currentUser?.id) {
            url += `registeredBy=${currentUser.id}`;
        }
        window.open(url, '_blank');
    };

    const handleDownloadCSV = () => {
        if (registrations.length === 0) return;

        // Simple CSV generation of current view
        const headers = ['First Name', 'Last Name', 'FCS Code', 'Status', 'Center', 'Mode'];
        const rows = registrations.map(reg => [
            reg.member?.firstName,
            reg.member?.lastName,
            reg.member?.fcsCode,
            reg.status,
            reg.center?.name || reg.center?.centerName || '',
            reg.participationMode
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `registrations_${eventId}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start overflow-x-auto max-w-full">
                    <button
                        onClick={() => setFilterMode('all')}
                        className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterMode === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        All Center Registrants
                    </button>
                    <button
                        onClick={() => setFilterMode('mine')}
                        className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterMode === 'mine' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Registered by Me
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handlePrintTags}
                        disabled={selectedIds.size === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${selectedIds.size > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Ticket className="w-4 h-4" />
                        Print Tags {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                    </button>
                    <button
                        onClick={handlePrintAllTags}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 border border-indigo-200"
                    >
                        <Ticket className="w-4 h-4" /> Print All Tags
                    </button>
                    <div className="w-px h-8 bg-gray-300 mx-2 hidden sm:block"></div>
                    <button
                        onClick={handlePrintList}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        <Printer className="w-4 h-4" /> List
                    </button>
                    <button
                        onClick={handleDownloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        <Download className="w-4 h-4" /> CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 w-4">
                                    <button
                                        onClick={toggleAll}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        {registrations.length > 0 && selectedIds.size === registrations.length ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FCS Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">Loading...</td>
                                </tr>
                            ) : registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">No registrations found</td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className={selectedIds.has(reg.id) ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleSelect(reg.id)}
                                                className="text-gray-400 hover:text-blue-600 focus:outline-none"
                                            >
                                                {selectedIds.has(reg.id) ? (
                                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {reg.member?.firstName} {reg.member?.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.member?.fcsCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                reg.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.center?.name || reg.center?.centerName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.participationMode}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700 self-center">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
