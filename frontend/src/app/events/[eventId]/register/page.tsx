"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { User, Users, ArrowLeft, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RegistrationChoicePage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Header Section - Compact with Branding */}
            <div className="bg-[#010030] pt-12 pb-24 px-4 sm:px-6 relative overflow-hidden">
                {/* Abstract background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#060CCD] opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <Badge className="mb-4 bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white border-white/10 backdrop-blur-md transition-all">
                        Registration Portal
                    </Badge>

                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                        Start Your Registration
                    </h1>
                    <p className="text-blue-200/80 text-sm sm:text-base max-w-lg mx-auto">
                        Choose how you would like to verify your identity and proceed with the registration process.
                    </p>
                </div>
            </div>

            {/* Content Section - Overlapping & Focused */}
            <div className="flex-1 px-4 sm:px-6 -mt-16 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Register Myself Card */}
                        <Link href={`/my-events/${eventId}/register`} className="group outline-none">
                            <Card className="h-full p-6 sm:p-8 bg-white hover:bg-gray-50/50 border-0 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 ring-1 ring-gray-100">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                </div>

                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="h-16 w-16 bg-blue-50/80 rounded-2xl flex items-center justify-center group-hover:bg-[#060CCD] group-hover:rotate-3 transition-all duration-300">
                                        <User className="h-7 w-7 text-[#060CCD] group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#060CCD] transition-colors">
                                            Register Myself
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                            Register using your personal profile and manage your own attendance.
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-1">
                                            Proceed <ArrowLeft className="w-3 h-3 rotate-180" />
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Link>

                        {/* Register Others Card */}
                        <Link href={`/my-events/${eventId}/register-others`} className="group outline-none">
                            <Card className="h-full p-6 sm:p-8 bg-white hover:bg-gray-50/50 border-0 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 ring-1 ring-gray-100">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                </div>

                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="h-16 w-16 bg-emerald-50/80 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:-rotate-3 transition-all duration-300">
                                        <Users className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                            Register Others
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                            Register on behalf of a group, family, or other delegates.
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 inline-flex items-center gap-1">
                                            Proceed <ArrowLeft className="w-3 h-3 rotate-180" />
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-12 flex flex-col items-center gap-6">
                        <Button
                            onClick={() => router.back()}
                            variant="ghost"
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Event Details
                        </Button>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-gray-100">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                Secure Registration Protocol
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
