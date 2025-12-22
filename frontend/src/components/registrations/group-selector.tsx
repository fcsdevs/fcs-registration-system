/**
 * Group Selector Component
 * Allows users to select Bible study groups with capacity enforcement
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, BookOpen } from 'lucide-react';
import { EventGroup } from '@/types/api';
import { CapacityIndicator } from '../ui/capacity-indicator';

interface GroupSelectorProps {
    eventId: string;
    selectedGroupId?: string;
    onSelect: (groupId: string) => void;
    error?: string;
    required?: boolean;
}

export function GroupSelector({ eventId, selectedGroupId, onSelect, error, required = false }: GroupSelectorProps) {
    const [groups, setGroups] = useState<EventGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
    }, [eventId]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const response = await fetch(`/api/events/${eventId}/groups`);
            const data = await response.json();
            setGroups(data.data || []);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const isGroupFull = (group: EventGroup) => {
        if (!group.capacity) return false;
        return (group.memberCount || 0) >= group.capacity;
    };

    const getGroupIcon = (type: string) => {
        switch (type) {
            case 'BIBLE_STUDY':
                return <BookOpen className="w-5 h-5" />;
            case 'WORKSHOP':
                return <Users className="w-5 h-5" />;
            default:
                return <Users className="w-5 h-5" />;
        }
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
                    Select Bible Study Group {required && <span className="text-red-500">*</span>}
                </label>
                <p className="text-sm text-gray-600 mb-4">
                    Groups are shared across all centers for teaching and reporting purposes
                </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {groups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No groups available for this event</p>
                    </div>
                ) : (
                    groups.map(group => {
                        const isSelected = selectedGroupId === group.id;
                        const isFull = isGroupFull(group);

                        return (
                            <button
                                key={group.id}
                                type="button"
                                onClick={() => !isFull && onSelect(group.id)}
                                disabled={isFull}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                        ? 'border-[#1F7A63] bg-[#E8F5F1]'
                                        : isFull
                                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                            : 'border-gray-200 hover:border-[#1F7A63] bg-white'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#1F7A63] text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {getGroupIcon(group.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{group.name}</h4>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                                                    {group.type.replace('_', ' ')}
                                                </p>
                                            </div>
                                            {isFull && (
                                                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    Full
                                                </span>
                                            )}
                                        </div>

                                        {group.description && (
                                            <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                                        )}

                                        {group.capacity && (
                                            <CapacityIndicator
                                                current={group.memberCount || 0}
                                                max={group.capacity}
                                                size="sm"
                                            />
                                        )}
                                    </div>
                                </div>
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
