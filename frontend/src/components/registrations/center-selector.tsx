/**
 * Center Selector Component
 * Allows users to select an event center with state filtering and capacity display
 */

"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Users, AlertCircle } from 'lucide-react';
import { EventCenter } from '@/types/api';
import { CapacityIndicator } from '../ui/capacity-indicator';

interface CenterSelectorProps {
    eventId: string;
    selectedCenterId?: string;
    onSelect: (centerId: string) => void;
    error?: string;
}

export function CenterSelector({ eventId, selectedCenterId, onSelect, error }: CenterSelectorProps) {
    const [centers, setCenters] = useState<EventCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState<string>('all');

    useEffect(() => {
        fetchCenters();
    }, [eventId]);

    const fetchCenters = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const response = await fetch(`/api/events/${eventId}/centers`);
            const data = await response.json();
            setCenters(data.data || []);
        } catch (error) {
            console.error('Failed to fetch centers:', error);
            setCenters([]);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique states from centers
    const states = Array.from(new Set(centers.map(c => c.stateId).filter(Boolean))) as string[];

    // Filter centers
    const filteredCenters = centers.filter(center => {
        const matchesSearch = center.centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            center.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesState = selectedState === 'all' || center.stateId === selectedState;
        return matchesSearch && matchesState && center.isActive;
    });

    // Check if center is full (mock - would come from API)
    const isCenterFull = (center: EventCenter) => {
        if (!center.capacity) return false;
        // TODO: Get actual registration count from API
        return false;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event Center
                </label>
                <p className="text-sm text-gray-600 mb-4">
                    Choose the physical location where you'll attend this event
                </p>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search centers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="all">All States</option>
                    {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </div>

            {/* Centers List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCenters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No centers found</p>
                    </div>
                ) : (
                    filteredCenters.map(center => {
                        const isSelected = selectedCenterId === center.id;
                        const isFull = isCenterFull(center);
                        const currentRegistrations = 0; // TODO: Get from API

                        return (
                            <button
                                key={center.id}
                                type="button"
                                onClick={() => !isFull && onSelect(center.id)}
                                disabled={isFull}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                        ? 'border-blue-600 bg-blue-50'
                                        : isFull
                                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                            : 'border-gray-200 hover:border-blue-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{center.centerName}</h4>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>{center.address}</span>
                                        </div>
                                    </div>
                                    {isFull && (
                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                            Full
                                        </span>
                                    )}
                                </div>

                                {center.capacity && (
                                    <div className="mt-3">
                                        <CapacityIndicator
                                            current={currentRegistrations}
                                            max={center.capacity}
                                            size="sm"
                                        />
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
