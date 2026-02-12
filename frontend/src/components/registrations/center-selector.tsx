/**
 * Center Selector Component
 * Allows users to select an event center with state filtering and capacity display
 */

"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Users, AlertCircle, Filter, CheckCircle2, Navigation } from 'lucide-react';
import { EventCenter } from '@/types/api';
import { centersApi } from '@/lib/api/centers';
import { Badge } from '@/components/ui/badge';

interface CenterSelectorProps {
    eventId: string;
    selectedCenterId?: string;
    onSelect: (centerId: string, centerName: string) => void;
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
            const response = await centersApi.listActive({ eventId });
            let fetchedCenters: EventCenter[] = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    fetchedCenters = response.data;
                } else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
                    fetchedCenters = (response.data as any).data;
                }
            }
            setCenters(fetchedCenters || []);
        } catch (error) {
            console.error('Failed to fetch centers:', error);
            setCenters([]);
        } finally {
            setLoading(false);
        }
    };

    const states = Array.from(
        new Set(
            centers.map(c => {
                if (c.state && typeof c.state === 'object' && 'name' in c.state) {
                    return c.state.name;
                }
                return c.stateId;
            }).filter(Boolean)
        )
    ) as string[];

    const filteredCenters = centers.filter(center => {
        const matchesSearch = center.centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            center.address.toLowerCase().includes(searchQuery.toLowerCase());
        if (selectedState === 'all') return matchesSearch && center.isActive;
        const normalize = (s: string) => s.toLowerCase().trim();
        const targetState = normalize(selectedState);
        const centerStateName = center.state?.name ? normalize(center.state.name) : '';
        const centerStateId = center.stateId ? normalize(center.stateId) : '';
        const matchesState = centerStateName === targetState || centerStateId === targetState;
        return matchesSearch && matchesState && center.isActive;
    });



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Precinct Registry</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Navigation size={14} className="text-[#060CCD]" /> Deploy Location <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="h-1 w-20 bg-gradient-to-r from-[#060CCD] to-transparent rounded-full" />
            </div>

            {/* Search and Filter Interface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#060CCD] transition-colors duration-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search Precinct / Address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-[#060CCD]/5 focus:border-[#060CCD] outline-none transition-all"
                    />
                </div>

                <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#060CCD] transition-colors duration-300" size={18} />
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-[#060CCD]/5 focus:border-[#060CCD] outline-none transition-all appearance-none"
                    >
                        <option value="all">Global (All States)</option>
                        {states.sort().map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Centers Registry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCenters.length === 0 ? (
                    <div className="col-span-2 py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching precinct found</p>
                    </div>
                ) : (
                    filteredCenters.map(center => {
                        const isSelected = selectedCenterId === center.id;
                        const currentRegistrations = 0;

                        return (
                            <button
                                key={center.id}
                                type="button"
                                onClick={() => onSelect(center.id, center.centerName)}
                                className="group text-left outline-none"
                            >
                                <div className={`p-6 rounded-[32px] border-2 transition-all duration-300 relative overflow-hidden h-full flex flex-col ${isSelected
                                    ? 'border-[#060CCD] bg-white shadow-[0_20px_40px_-10px_rgba(6,12,205,0.1)] scale-[1.01]'
                                    : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg'
                                    }`}>
                                    {isSelected && (
                                        <div className="absolute top-4 right-4">
                                            <CheckCircle2 size={20} className="text-[#060CCD] fill-[#060CCD]/10" />
                                        </div>
                                    )}

                                    <div className="flex-1 w-full">
                                        <div className="flex items-start gap-3">
                                            <div className={`h-8 w-8 min-w-[32px] rounded-lg flex items-center justify-center mt-1 transition-colors ${isSelected ? 'bg-[#060CCD] text-white shadow-md' : 'bg-white text-slate-400 group-hover:text-[#060CCD]'
                                                }`}>
                                                <MapPin size={16} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                                                    <h4 className="font-black text-[#0F172A] text-sm leading-tight tracking-tight truncate shrink-0 max-w-[200px]">{center.centerName}</h4>
                                                    <span className="hidden sm:inline text-slate-300">•</span>
                                                    <p className="text-xs font-semibold text-slate-500 truncate leading-tight mt-0.5 sm:mt-0">
                                                        {center.address}
                                                    </p>
                                                </div>
                                                {center.state?.name && (
                                                    <p className="text-[10px] font-black text-[#060CCD] uppercase tracking-widest mt-1">{center.state.name}</p>
                                                )}
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
