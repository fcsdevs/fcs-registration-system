"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { User, Users, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RegistrationChoicePage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section with Dark Background */}
            <div className="bg-gradient-to-br from-[#060CCD] via-[#010030] to-[#010030] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="max-w-6xl mx-auto">
                    <Badge className="mb-4 h-8 px-4 py-0 bg-white/20 hover:bg-white/30 text-white border-none rounded-full backdrop-blur-md font-black uppercase text-[10px] tracking-widest w-fit">
                        Registration Portal
                    </Badge>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tighter leading-tight">
                        Start Your Registration
                    </h1>
                    <p className="text-white/70 font-medium text-sm sm:text-base md:text-lg">Select how you would like to proceed</p>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Cards Grid - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Register Myself Card */}
                        <Link href={`/my-events/${eventId}/register`} className="group">
                            <Card className="h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-none shadow-lg hover:shadow-2xl bg-white/95 backdrop-blur hover:bg-white transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center group-hover:ring-4 ring-blue-500/10">
                                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-[#060CCD] transition-colors duration-300">
                                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-[#060CCD] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#0F172A] uppercase tracking-tight">
                                    Register Myself
                                </h2>
                            </Card>
                        </Link>

                        {/* Register Others Card */}
                        <Link href={`/my-events/${eventId}/register-others`} className="group">
                            <Card className="h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-none shadow-lg hover:shadow-2xl bg-white/95 backdrop-blur hover:bg-white transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center group-hover:ring-4 ring-emerald-500/10">
                                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                                    <Users className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#0F172A] uppercase tracking-tight">
                                    Register Others
                                </h2>
                            </Card>
                        </Link>
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 sm:mt-12 flex justify-center">
                        <Button
                            onClick={() => router.back()}
                            variant="ghost"
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 uppercase tracking-widest text-xs font-bold transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Details
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer Trust Signal */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none px-4">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 sm:px-4 py-2 rounded-full shadow-sm border border-slate-100/50 text-center">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Secure Reg Protocol</span>
                </div>
            </div>
        </div>
    );
}
