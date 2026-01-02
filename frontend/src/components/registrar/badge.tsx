"use client";

import React from 'react';
import { Registration } from '@/types/api';
// Optionally import QRCode component if we had one

export function Badge({ registration }: { registration: Registration }) {
    return (
        <div className="w-[88mm] h-[55mm] border border-gray-300 flex flex-col items-center justify-center p-4 text-center bg-white shadow-sm print:shadow-none print:border-gray-800 rounded-lg relative overflow-hidden">
            {/* Header/Event Name */}
            <div className="absolute top-0 w-full bg-blue-900 h-3 print:bg-black"></div>

            <div className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest max-w-full truncate px-2">
                {registration.event?.title || 'Event Name'}
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1 break-words line-clamp-2">
                    {registration.member?.firstName} <br /> {registration.member?.lastName}
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                    {registration.center?.name || registration.participationMode}
                </p>
                {registration.group && (
                    <p className="text-xs text-blue-600 font-bold mt-1">
                        {registration.group.name}
                    </p>
                )}
            </div>

            <div className="mt-auto pt-2 w-full flex justify-between items-end border-t border-gray-100 print:border-gray-300">
                <div className="text-left">
                    <p className="text-[10px] text-gray-400">FCS Code</p>
                    <p className="text-xs font-mono font-bold text-gray-800">{registration.member?.fcsCode}</p>
                </div>
                {/* Placeholder for QR Code */}
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">
                    QR
                </div>
            </div>
        </div>
    );
}
