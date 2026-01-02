/**
 * Register for Others Wizard
 * Allows users to register others for events by searching via FCS Code
 */

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserCheck, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Event } from '@/types/api';
import { EventRegistrationWizard } from './event-registration-wizard';
import { api } from '@/lib/api/client';

interface RegisterForOthersWizardProps {
    event: Event;
    currentUserId: string;
}

interface Member {
    id: string;
    firstName: string;
    lastName: string;
    fcsCode: string;
    email?: string;
    phoneNumber?: string;
    // Add other fields as needed
}

export function RegisterForOthersWizard({ event, currentUserId }: RegisterForOthersWizardProps) {
    const router = useRouter();
    const [searchCode, setSearchCode] = useState('');
    const [foundMember, setFoundMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) return;

        setLoading(true);
        setError(null);
        setFoundMember(null);

        try {
            // Using the specific endpoint for code lookup
            // Note: Use simple api.get which returns the data unwrapped if interception is uniform
            // or check the response structure. 
            // Based on other files: api.get returns response.body.
            // backend route: router.get('/code/:code', ...)
            const response = await api.get<{ data: Member } | Member>(`/members/code/${encodeURIComponent(searchCode.trim())}`);

            // Check structure
            let memberData: Member | null = null;
            if ((response as any).data) { // wrapped
                memberData = (response as any).data;
            } else {
                memberData = response as Member;
            }

            if (memberData) {
                setFoundMember(memberData);
            } else {
                setError('Member not found. Please check the FCS Code.');
            }
        } catch (err: any) {
            console.error('Search failed:', err);
            // Handle 404 specifically if needed, otherwise generic
            if (err.response?.status === 404) {
                setError('Member with this FCS Code not found.');
            } else {
                setError('Failed to search for member. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = () => {
        if (foundMember) {
            setIsRegistering(true);
        }
    };

    const handleRegistrationComplete = (registrationId: string) => {
        router.push(`/my-events/${event.id}/registration-success`);
    };

    // Registration Mode
    if (isRegistering && foundMember) {
        return (
            <div>
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white rounded-full p-2">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-700">Registering For</p>
                            <p className="font-semibold text-blue-900">
                                {foundMember.firstName} {foundMember.lastName}
                                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                    {foundMember.fcsCode}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => setIsRegistering(false)}
                            className="ml-auto text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            Change Person
                        </button>
                    </div>
                </div>

                <EventRegistrationWizard
                    event={event}
                    memberId={foundMember.id}
                    memberName={`${foundMember.firstName} ${foundMember.lastName}`}
                    onComplete={handleRegistrationComplete}
                />
            </div>
        );
    }

    // Search Mode
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Others</h2>
                    <p className="text-gray-600">
                        Enter the person's FCS Code to find them in the registry.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                                placeholder="Enter FCS Code (e.g., FCS/123/XYZ)"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchCode.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 animate-fadeIn">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {foundMember && !loading && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                    {foundMember.firstName.charAt(0)}{foundMember.lastName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        {foundMember.firstName} {foundMember.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-500">FCS Code:</span>
                                        <span className="text-sm font-medium bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                                            {foundMember.fcsCode}
                                        </span>
                                    </div>
                                    {foundMember.email && (
                                        <p className="text-sm text-gray-500 mt-1">{foundMember.email}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleProceed}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1F7A63] text-white rounded-lg font-medium hover:bg-[#18614f] transition-colors w-full sm:w-auto shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                            >
                                Proceed
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
