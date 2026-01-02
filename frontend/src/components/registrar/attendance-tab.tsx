"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api/client';
import { Search, Loader2, CheckCircle, XCircle, QrCode } from 'lucide-react';

export function AttendanceTab({ eventId }: { eventId: string }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setScanResult(null);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            // Search for registration in this event using the code
            const response = await api.get<{ data: any[] }>(`/registrations?eventId=${eventId}&search=${encodeURIComponent(code)}`);
            if (response.data && response.data.length > 0) {
                // Determine best match? listRegistrations returns array.
                // If searching by unique FCS code, likely 1 result.
                setScanResult(response.data[0]);
            } else {
                setErrorMsg('No registration found for this code.');
            }
        } catch (err) {
            setErrorMsg('Error looking up registration.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!scanResult) return;
        setActionLoading(true);
        try {
            await api.post(`/registrations/${scanResult.id}/attendance`, { method: 'MANUAL' }); // or CODE/SCAN
            setSuccessMsg(`Checked in ${scanResult.member?.firstName} successfully!`);
            setScanResult(null); // Clear result to allow next scan
            setCode('');
        } catch (err: any) {
            setErrorMsg(err.message || 'Check-in failed');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <QrCode className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-in Participant</h2>
                <p className="text-gray-500 mb-8">Enter FCS Code or Scan Barcode</p>

                <form onSubmit={handleLookup} className="relative max-w-md mx-auto mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter Code..."
                            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                            autoFocus
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    </div>
                </form>

                {loading && (
                    <div className="flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {successMsg}
                    </div>
                )}
            </div>

            {/* Scan Result Card */}
            {scanResult && !successMsg && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {scanResult.member?.firstName} {scanResult.member?.lastName}
                            </h3>
                            <p className="text-gray-500 mb-4">{scanResult.member?.fcsCode}</p>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${scanResult.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                        scanResult.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {scanResult.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {scanResult.participation?.center?.centerName || 'Online'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckIn}
                            disabled={actionLoading || scanResult.status === 'CHECKED_IN'}
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {actionLoading ? 'Processing...' :
                                scanResult.status === 'CHECKED_IN' ? 'Already Checked In' : 'Confirm Check-in'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
