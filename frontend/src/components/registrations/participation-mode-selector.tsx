/**
 * Participation Mode Selector
 * Allows users to select Online or On-Site participation for HYBRID events
 */

"use client";

import React from 'react';
import { Monitor, MapPin, AlertCircle } from 'lucide-react';

interface ParticipationModeSelectorProps {
    participationModes: ('ONLINE' | 'ONSITE' | 'HYBRID')[];
    selectedMode?: 'ONLINE' | 'ONSITE';
    onSelect: (mode: 'ONLINE' | 'ONSITE') => void;
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Monitor className="w-6 h-6 text-blue-600" />
                    <div>
                        <h4 className="font-semibold text-blue-900">Online Event</h4>
                        <p className="text-sm text-blue-700">This event is online only</p>
                    </div>
                </div>
            </div>
        );
    }

    // If event is ONSITE only, auto-select and return minimal UI
    if (participationModes.length === 1 && participationModes[0] === 'ONSITE') {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-amber-600" />
                    <div>
                        <h4 className="font-semibold text-amber-900">On-Site Event</h4>
                        <p className="text-sm text-amber-700">This event requires physical attendance</p>
                    </div>
                </div>
            </div>
        );
    }

    // HYBRID event - show selection
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    How will you participate? <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                    This event supports both online and on-site participation
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Online Option */}
                <button
                    type="button"
                    onClick={() => onSelect('ONLINE')}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${selectedMode === 'ONLINE'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${selectedMode === 'ONLINE' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                            }`}>
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">Online</h4>
                            <p className="text-sm text-gray-600">
                                Join remotely via live stream or video conference
                            </p>
                            <ul className="mt-3 space-y-1 text-xs text-gray-500">
                                <li>• No physical attendance required</li>
                                <li>• Access from anywhere</li>
                                <li>• Participate virtually</li>
                            </ul>
                        </div>
                    </div>
                </button>

                {/* On-Site Option */}
                <button
                    type="button"
                    onClick={() => onSelect('ONSITE')}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${selectedMode === 'ONSITE'
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300 bg-white'
                        }`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${selectedMode === 'ONSITE' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-600'
                            }`}>
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">On-Site</h4>
                            <p className="text-sm text-gray-600">
                                Attend physically at an event center
                            </p>
                            <ul className="mt-3 space-y-1 text-xs text-gray-500">
                                <li>• In-person attendance</li>
                                <li>• Select your preferred center</li>
                                <li>• Check-in at venue</li>
                            </ul>
                        </div>
                    </div>
                </button>
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
