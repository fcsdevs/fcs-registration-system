/**
 * Participation Mode Selector
 * Allows users to select Online or On-Site participation for HYBRID events
 */

"use client";

import React from 'react';
import { Monitor, MapPin, AlertCircle, Sparkles, CheckCircle2, Radio } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ParticipationModeSelectorProps {
    participationModes: ('ONLINE' | 'ONSITE' | 'HYBRID')[];
    selectedMode?: 'ONLINE' | 'ONSITE' | 'HYBRID';
    onSelect: (mode: 'ONLINE' | 'ONSITE' | 'HYBRID') => void;
    error?: string;
}

export function ParticipationModeSelector({
    participationModes,
    selectedMode,
    onSelect,
    error,
}: ParticipationModeSelectorProps) {
    // If event is ONLINE only, auto-select and return minimal UI
    if (participationModes.length === 1 && participationModes[0] === 'ONLINE') {
        return (
            <div className="bg-blue-50/50 border border-blue-100 rounded-[24px] p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Monitor size={20} />
                </div>
                <div>
                    <h4 className="font-black text-[#0F172A] uppercase tracking-tight text-sm">Online</h4>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mt-0.5">Virtual Session Access Only</p>
                </div>
            </div>
        );
    }

    // If event is ONSITE only, auto-select and return minimal UI
    if (participationModes.length === 1 && participationModes[0] === 'ONSITE') {
        return (
            <div className="bg-amber-50/50 border border-amber-100 rounded-[24px] p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                    <MapPin size={20} />
                </div>
                <div>
                    <h4 className="font-black text-[#0F172A] uppercase tracking-tight text-sm">On-site</h4>
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mt-0.5">Physical Attendance Required</p>
                </div>
            </div>
        );
    }

    // HYBRID event - show selection
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Radio size={14} className="text-[#060CCD]" /> Select Engagement Protocol <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="h-1 w-20 bg-gradient-to-r from-[#060CCD] to-transparent rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Online Option */}
                <button
                    type="button"
                    onClick={() => onSelect('ONLINE')}
                    className="group relative text-left outline-none"
                >
                    <div className={`p-8 rounded-[36px] border-2 transition-all duration-300 relative overflow-hidden h-full flex flex-col ${selectedMode === 'ONLINE'
                        ? 'border-[#060CCD] bg-white shadow-[0_20px_50px_-12px_rgba(6,12,205,0.15)] scale-[1.02]'
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-xl'
                        }`}>
                        {selectedMode === 'ONLINE' && (
                            <div className="absolute top-6 right-6">
                                <CheckCircle2 size={24} className="text-[#060CCD] fill-[#060CCD]/10" />
                            </div>
                        )}

                        <div className={`h-14 w-14 rounded-2xl flex flex-shrink-0 items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${selectedMode === 'ONLINE' ? 'bg-[#060CCD] text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'
                            }`}>
                            <Monitor size={28} />
                        </div>

                        <div className="flex-1">
                            <Badge className={`mb-3 h-6 px-3 bg-blue-50 text-blue-600 border-none font-black uppercase text-[9px] tracking-widest ${selectedMode === 'ONLINE' ? 'bg-blue-600 text-white' : ''
                                }`}>
                                Digital Cloud
                            </Badge>
                            <h4 className="text-xl font-black text-[#0F172A] mb-3 leading-tight tracking-tight">Online</h4>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                                Join our secure live stream. Optimized for global remote participants.
                            </p>

                            <div className="space-y-2">
                                {['End-to-End Encrypted Stream', 'HD Video & Global Audio', 'Real-time Interaction'].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="h-1 w-1 bg-[#060CCD] rounded-full" /> {feat}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </button>

                {/* On-Site Option */}
                <button
                    type="button"
                    onClick={() => onSelect('ONSITE')}
                    className="group relative text-left outline-none"
                >
                    <div className={`p-8 rounded-[36px] border-2 transition-all duration-300 relative overflow-hidden h-full flex flex-col ${selectedMode === 'ONSITE'
                        ? 'border-emerald-500 bg-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] scale-[1.02]'
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-xl'
                        }`}>
                        {selectedMode === 'ONSITE' && (
                            <div className="absolute top-6 right-6">
                                <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-500/10" />
                            </div>
                        )}

                        <div className={`h-14 w-14 rounded-2xl flex flex-shrink-0 items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${selectedMode === 'ONSITE' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'
                            }`}>
                            <MapPin size={28} />
                        </div>

                        <div className="flex-1">
                            <Badge className={`mb-3 h-6 px-3 bg-emerald-50 text-emerald-600 border-none font-black uppercase text-[9px] tracking-widest ${selectedMode === 'ONSITE' ? 'bg-emerald-500 text-white' : ''
                                }`}>
                                Physical Presence
                            </Badge>
                            <h4 className="text-xl font-black text-[#0F172A] mb-3 leading-tight tracking-tight">On-site</h4>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                                Experience the event live at one of our global centers.
                            </p>

                            <div className="space-y-2">
                                {['In-Person Networking', 'Exclusive Local Sessions', 'Full Immersive Access'].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="h-1 w-1 bg-emerald-500 rounded-full" /> {feat}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </button>

                {/* Hybrid Option */}
                <button
                    type="button"
                    onClick={() => onSelect('HYBRID')}
                    className="group relative text-left outline-none"
                >
                    <div className={`p-8 rounded-[36px] border-2 transition-all duration-300 relative overflow-hidden h-full flex flex-col ${selectedMode === 'HYBRID'
                        ? 'border-purple-500 bg-white shadow-[0_20px_50px_-12px_rgba(168,85,247,0.15)] scale-[1.02]'
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-xl'
                        }`}>
                        {selectedMode === 'HYBRID' && (
                            <div className="absolute top-6 right-6">
                                <CheckCircle2 size={24} className="text-purple-500 fill-purple-500/10" />
                            </div>
                        )}

                        <div className={`h-14 w-14 rounded-2xl flex flex-shrink-0 items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${selectedMode === 'HYBRID' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'
                            }`}>
                            <Sparkles size={28} />
                        </div>

                        <div className="flex-1">
                            <Badge className={`mb-3 h-6 px-3 bg-purple-50 text-purple-600 border-none font-black uppercase text-[9px] tracking-widest ${selectedMode === 'HYBRID' ? 'bg-purple-500 text-white' : ''
                                }`}>
                                Dual Access
                            </Badge>
                            <h4 className="text-xl font-black text-[#0F172A] mb-3 leading-tight tracking-tight">Hybrid</h4>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
                                Flexible attendance. Join us both online and in-person.
                            </p>

                            <div className="space-y-2">
                                {['Full Digital Access', 'Physical Center Entry', 'Complete Flexibility'].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="h-1 w-1 bg-purple-500 rounded-full" /> {feat}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </button>
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
