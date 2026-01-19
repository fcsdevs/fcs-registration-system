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
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Cinematic Header Background (Matching the style of the self-registration page) */}
            <div className="h-[400px] bg-gradient-to-br from-[#060CCD] via-[#010030] to-[#010030] absolute top-0 left-0 right-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
                <Badge className="mb-6 h-8 px-4 py-0 bg-white/20 hover:bg-white/30 text-white border-none rounded-full backdrop-blur-md font-black uppercase text-[10px] tracking-widest">
                    Registration Portal
                </Badge>

                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter leading-tight">
                    Start Your Registration
                </h1>
                <p className="text-white/70 font-medium text-lg mb-12">Select how you would like to proceed</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {/* Register Myself Card */}
                    <Link href={`/events/${eventId}/register/self`} className="group">
                        <Card className="h-full p-8 rounded-[32px] border-none shadow-xl bg-white/90 backdrop-blur-xl hover:bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col items-center text-center group-hover:ring-4 ring-blue-500/10">
                            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#060CCD] transition-colors duration-300">
                                <User className="h-10 w-10 text-[#060CCD] group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight mb-3">Register Myself</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Create a personal registration for this event. You'll choose your participation mode (Online/Onsite) in the next step.
                            </p>
                        </Card>
                    </Link>

                    {/* Register Others Card */}
                    <Link href={`/my-events/${eventId}/register-others`} className="group">
                        <Card className="h-full p-8 rounded-[32px] border-none shadow-xl bg-white/90 backdrop-blur-xl hover:bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col items-center text-center group-hover:ring-4 ring-emerald-500/10">
                            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                                <Users className="h-10 w-10 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight mb-3">Register Others</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Register friends, family, or group members using their FCS Code. Perfect for team leaders and coordinators.
                            </p>
                        </Card>
                    </Link>
                </div>

                <div className="mt-12">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="text-white/50 hover:text-white hover:bg-white/10 uppercase tracking-widest text-xs font-bold"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event Details
                    </Button>
                </div>
            </div>

            {/* Footer Trust Signal */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-100/50">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Reg Protocol</span>
                </div>
            </div>
        </div>
    );
}
