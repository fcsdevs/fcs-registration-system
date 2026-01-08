"use client";

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, Printer, Search } from 'lucide-react';
import Link from 'next/link';

// Decoration Component
const AmbientBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
    </div>
);

export default function RegistrationSuccessPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const registrationId = searchParams.get('registrationId');
    const eventId = params.id;

    // Redirect to detailed registration page if we have an ID
    useEffect(() => {
        if (registrationId) {
            // Redirect immediately to the structured details page which has Badge + Print
            router.replace(`/my-events/registration/${registrationId}`);
        }
    }, [registrationId, router]);

    // Fallback content if no ID or if waiting for redirect
    return (
        <div className="relative min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
            <AmbientBackground />

            <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
                <p className="text-gray-600 mb-8">You have been successfully registered for the event.</p>

                {registrationId ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 animate-pulse font-medium">Redirecting to badge details...</p>
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Link
                            href={`/my-events/${eventId}/register-others`}
                            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                        >
                            <Search className="w-4 h-4" />
                            Register Another Person
                        </Link>

                        <Link
                            href="/my-events"
                            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition"
                        >
                            <Home className="w-4 h-4" />
                            Back to My Events
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
