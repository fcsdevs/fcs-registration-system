/**
 * Group Selector Component
 * Allows users to select Bible study groups with capacity enforcement
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, BookOpen, Search } from 'lucide-react';
import { groupsApi } from '@/lib/api/groups';

import { EventGroup } from '@/types/api';
import { CapacityIndicator } from '../ui/capacity-indicator';

interface GroupSelectorProps {
    eventId: string;
    selectedGroupId?: string;
    onSelect: (groupId: string, groupName: string) => void;
    error?: string;
    required?: boolean;
}

export function GroupSelector({ eventId, selectedGroupId, onSelect, error, required = false }: GroupSelectorProps) {
    const [groups, setGroups] = useState<EventGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchGroups();
    }, [eventId]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await groupsApi.listByEvent(eventId, { isActive: true });

            let fetchedGroups: EventGroup[] = [];

            // Handle { data: { groups: [...] } }
            if (response.data && (response.data as any).groups && Array.isArray((response.data as any).groups)) {
                fetchedGroups = (response.data as any).groups;
            }
            // Handle { data: [...] } - direct array
            else if (Array.isArray(response.data)) {
                fetchedGroups = response.data;
            }
            // Handle possible wrapper { data: { data: [...] } }
            else if (response.data && (response.data as any).data && Array.isArray((response.data as any).data)) {
                fetchedGroups = (response.data as any).data;
            }

            setGroups(fetchedGroups || []);
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

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {filteredGroups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 col-span-full">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>{searchQuery ? 'No groups match your search' : 'No groups available'}</p>
                    </div>
                ) : (
                    filteredGroups.map(group => {
                        const isSelected = selectedGroupId === group.id;
                        const isFull = isGroupFull(group);

                        return (
                            <button
                                key={group.id}
                                type="button"
                                onClick={() => !isFull && onSelect(group.id, group.name)}
                                disabled={isFull}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected
                                    ? 'border-[#1F7A63] bg-[#E8F5F1] shadow-sm'
                                    : isFull
                                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                        : 'border-gray-200 hover:border-[#1F7A63] hover:bg-gray-50 bg-white'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-[#1F7A63] text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {getGroupIcon(group.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="font-semibold text-gray-900 truncate pr-2">{group.name}</h4>
                                            {isFull && (
                                                <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
                                                    Full
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                            {group.type.replace('_', ' ')}
                                        </p>

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
