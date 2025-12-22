/**
 * Register for Others Wizard
 * Allows users to register dependents/others for events
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, X, ChevronRight } from 'lucide-react';
import { Event } from '@/types/api';
import { EventRegistrationWizard } from './event-registration-wizard';

interface Dependent {
    id: string;
    firstName: string;
    lastName: string;
    relationship: string;
}

interface RegisterForOthersWizardProps {
    event: Event;
    currentUserId: string;
}

export function RegisterForOthersWizard({ event, currentUserId }: RegisterForOthersWizardProps) {
    const router = useRouter();
    const [dependents, setDependents] = useState<Dependent[]>([]);
    const [selectedDependents, setSelectedDependents] = useState<string[]>([]);
    const [currentDependentIndex, setCurrentDependentIndex] = useState<number | null>(null);
    const [completedRegistrations, setCompletedRegistrations] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDependents();
    }, [currentUserId]);

    const fetchDependents = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const response = await fetch(`/api/members/${currentUserId}/dependents`);
            const data = await response.json();
            setDependents(data.data || []);
        } catch (error) {
            console.error('Failed to fetch dependents:', error);
            setDependents([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleDependent = (dependentId: string) => {
        setSelectedDependents(prev =>
            prev.includes(dependentId)
                ? prev.filter(id => id !== dependentId)
                : [...prev, dependentId]
        );
    };

    const startRegistrations = () => {
        if (selectedDependents.length > 0) {
            setCurrentDependentIndex(0);
        }
    };

    const handleDependentRegistrationComplete = (registrationId: string) => {
        if (currentDependentIndex === null) return;

        const currentDependentId = selectedDependents[currentDependentIndex];
        setCompletedRegistrations(prev => new Set([...prev, currentDependentId]));

        // Move to next dependent or finish
        if (currentDependentIndex < selectedDependents.length - 1) {
            setCurrentDependentIndex(currentDependentIndex + 1);
        } else {
            // All done!
            router.push('/my-events?registered=true');
        }
    };

    // If we're in registration mode for a specific dependent
    if (currentDependentIndex !== null) {
        const currentDependentId = selectedDependents[currentDependentIndex];
        const currentDependent = dependents.find(d => d.id === currentDependentId);

        if (!currentDependent) return null;

        return (
            <div>
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700">
                                Registering for {currentDependentIndex + 1} of {selectedDependents.length}
                            </p>
                            <p className="font-semibold text-blue-900">
                                {currentDependent.firstName} {currentDependent.lastName}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            {selectedDependents.map((id, index) => (
                                <div
                                    key={id}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${completedRegistrations.has(id)
                                            ? 'bg-green-600 text-white'
                                            : index === currentDependentIndex
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <EventRegistrationWizard
                    event={event}
                    memberId={currentDependent.id}
                    memberName={`${currentDependent.firstName} ${currentDependent.lastName}`}
                    onComplete={handleDependentRegistrationComplete}
                />
            </div>
        );
    }

    // Selection screen
    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Register for Others</h2>
                    <p className="text-gray-600">
                        Select the people you'd like to register for this event
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : dependents.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dependents Found</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't added any dependents to your profile yet
                        </p>
                        <button
                            onClick={() => router.push('/settings/dependents')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Dependent
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {dependents.map(dependent => {
                                const isSelected = selectedDependents.includes(dependent.id);

                                return (
                                    <button
                                        key={dependent.id}
                                        type="button"
                                        onClick={() => toggleDependent(dependent.id)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {dependent.firstName.charAt(0)}{dependent.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {dependent.firstName} {dependent.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{dependent.relationship}</p>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="bg-blue-600 text-white rounded-full p-1">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                {selectedDependents.length} {selectedDependents.length === 1 ? 'person' : 'people'} selected
                            </p>
                            <button
                                onClick={startRegistrations}
                                disabled={selectedDependents.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Start Registration
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
