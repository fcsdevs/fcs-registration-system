/**
 * Group Selector Component
 * Allows users to select Bible study groups with capacity enforcement
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, BookOpen, Search, CheckCircle2, Trophy, Target } from 'lucide-react';
import { groupsApi } from '@/lib/api/groups';
import { EventGroup } from '@/types/api';
import { Badge } from '@/components/ui/badge';

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
            if (response.data && (response.data as any).groups && Array.isArray((response.data as any).groups)) {
                fetchedGroups = (response.data as any).groups;
            } else if (Array.isArray(response.data)) {
                fetchedGroups = response.data;
            } else if (response.data && (response.data as any).data && Array.isArray((response.data as any).data)) {
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



    const getGroupIcon = (type: string, isSelected: boolean) => {
        const iconClass = isSelected ? 'text-white' : 'text-[#1F7A63]';
        switch (type) {
            case 'BIBLE_STUDY':
                return <BookOpen size={20} className={iconClass} />;
            case 'WORKSHOP':
                return <Target size={20} className={iconClass} />;
            default:
                return <Users size={20} className={iconClass} />;
        }
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-10 w-10 border-4 border-[#1F7A63]/20 border-t-[#1F7A63] rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Neural Units</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Trophy size={14} className="text-[#1F7A63]" /> Assignment Group {required && <span className="text-red-500 font-bold">*</span>}
                </label>
                <div className="h-1 w-20 bg-gradient-to-r from-[#1F7A63] to-transparent rounded-full" />
            </div>

            {/* Premium Search Hub */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1F7A63] transition-colors duration-300" size={18} />
                <input
                    type="text"
                    placeholder="Search Unit Registry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-[#1F7A63]/5 focus:border-[#1F7A63] outline-none transition-all"
                />
            </div>

            {/* Units Registry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredGroups.length === 0 ? (
                    <div className="col-span-2 py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-center">
                        <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching units found</p>
                    </div>
                ) : (
                    filteredGroups.map(group => {
                        const isSelected = selectedGroupId === group.id;

                        return (
                            <button
                                key={group.id}
                                type="button"
                                onClick={() => onSelect(group.id, group.name)}
                                className="group text-left outline-none"
                            >
                                <div className={`p-6 rounded-[32px] border-2 transition-all duration-300 relative overflow-hidden h-full flex flex-col ${isSelected
                                    ? 'border-[#1F7A63] bg-[#E8F5F1]/50 shadow-[0_20px_40px_-12px_rgba(31,122,99,0.15)] scale-[1.02]'
                                    : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg'
                                    }`}>
                                    {isSelected && (
                                        <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                                            <CheckCircle2 size={20} className="text-[#1F7A63] fill-[#1F7A63]/10" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex flex-col gap-3">
                                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-[#1F7A63] shadow-lg shadow-[#1F7A63]/20' : 'bg-white text-slate-400 group-hover:text-[#1F7A63]'
                                                }`}>
                                                {getGroupIcon(group.type, isSelected)}
                                            </div>

                                            <div>
                                                <h4 className="font-black text-[#0F172A] leading-tight tracking-tight mb-1 truncate">{group.name}</h4>
                                                <Badge className={`bg-transparent p-0 border-none font-black text-[9px] uppercase tracking-widest ${isSelected ? 'text-[#1F7A63]' : 'text-slate-400'
                                                    }`}>
                                                    {group.type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {error && (
                <div className="flex items-center gap-3 text-red-600 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
