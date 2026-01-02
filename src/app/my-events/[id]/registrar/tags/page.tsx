"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Badge } from '@/components/registrar/badge';
import { Registration } from '@/types/api';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TagPrintPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const eventId = params.id as string;
    const ids = searchParams.get('ids');

    // Filters for "Print All" mode
    const registeredBy = searchParams.get('registeredBy');
    const centerId = searchParams.get('centerId');

    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            setLoading(true);
            try {
                let url = `/registrations?eventId=${eventId}&limit=100`; // Limit to 100 for now
                if (ids) {
                    url += `&ids=${ids}`;
                } else {
                    if (registeredBy) url += `&registeredBy=${registeredBy}`;
                    if (centerId) url += `&centerId=${centerId}`;
                }

                const response = await api.get<any>(url);
                setRegistrations(response.data?.docs || response.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchRegistrations();
        }
    }, [eventId, ids, registeredBy, centerId]);

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white p-8 print:p-0">
            {/* Control Bar - Hidden in Print */}
            <div className="max-w-7xl mx-auto mb-8 print:hidden flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/my-events/${eventId}/registrar`}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Print Badges</h1>
                        <p className="text-sm text-gray-500">{registrations.length} badges selected</p>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    <Printer className="w-5 h-5" />
                    Print Now
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12 print:hidden">
                    Loading badges...
                </div>
            )}

            {/* Badges Grid */}
            <div className="print-grid max-w-[210mm] mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 print:gap-0 print:m-0 print:w-full">
                {/* 
                   Print CSS: 
                   We use a custom style block or Tailwind classes.
                   Tailwind's `print:` modifiers are great but `grid-cols-2` might need tweaking for specific paper sizes.
                   Usually 2 columns fit A4 portrait. 
                */}
                <style jsx global>{`
                    @media print {
                        @page { margin: 10mm; size: auto; }
                        body { background: white; }
                        .print-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10mm; /* Space between badges */
                            width: 100%;
                            max-width: none;
                        }
                        /* Avoid breaking page inside a badge */
                        .print-grid > * {
                            break-inside: avoid;
                        }
                    }
                `}</style>

                {registrations.map((reg) => (
                    <Badge key={reg.id} registration={reg} />
                ))}
            </div>
        </div>
    );
}
