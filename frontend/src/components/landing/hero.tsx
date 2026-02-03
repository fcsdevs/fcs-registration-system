"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Users, QrCode, Play } from "lucide-react";

export function Hero() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-50/50">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply animate-blob opacity-50" />
                <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000 opacity-50" />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="container mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Content */}
                    <div className="flex flex-col items-start max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white border border-blue-100 shadow-sm text-blue-700 text-sm font-semibold tracking-wide uppercase animate-fade-in hover:shadow-md transition-shadow cursor-default">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                            </span>
                            Official Portal v2.0
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1] animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                            FCS <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 animate-gradient-x">
                                Member Management
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
                            The complete digital infrastructure for FCS Nigeria. Streamline registration, track attendance in real-time, and manage events with enterprise-grade precision.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                            <Link
                                href="/auth/signup"
                                className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1 active:scale-95"
                            >
                                Start Registration
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 transition-all bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:-translate-y-1 active:scale-95"
                            >
                                <Play className="w-4 h-4 mr-2 fill-gray-700" />
                                Explore System
                            </Link>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200/60 w-full flex items-center justify-center lg:justify-start gap-6 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-[3px] border-white bg-gray-100 flex items-center justify-center text-xs text-gray-400 overflow-hidden shadow-sm">
                                        <div className={`w-full h-full bg-gradient-to-br from-blue-${i * 100} to-indigo-${i * 100}`} />
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-full border-[3px] border-white bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                                    +2.5M
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="flex gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-gray-500"><strong className="text-gray-900">2.5M+</strong> Beneficiaries</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Visuals - 3D Dashboard Mockup */}
                    {/* Using inline styles for transform to ensure complex 3D works without specific classes */}
                    <div
                        className="relative w-full max-w-[600px] mx-auto lg:max-w-none perspective-1000 group hidden lg:block"
                        style={{ perspective: '1000px' }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Decor Bloom */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 rounded-full blur-[80px] -z-10 group-hover:bg-blue-500/30 transition-colors duration-700" />

                        {/* Main Card Container with 3D Rotate */}
                        <div
                            className="relative bg-white rounded-3xl border border-white/50 shadow-2xl overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                            style={{
                                transform: isHovered ? 'rotateY(0deg) rotateX(0deg)' : 'rotateY(-12deg) rotateX(6deg)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {/* Glass sheen */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-white/40 to-transparent z-10 pointer-events-none" />

                            {/* Internal UI Mockup */}
                            <div className="relative z-0 bg-gray-50 min-h-[500px] flex flex-col">
                                {/* Header */}
                                <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                    </div>
                                    <div className="w-1/3 h-2 bg-gray-100 rounded-full" />
                                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                                </div>

                                {/* Body */}
                                <div className="flex-1 p-6 space-y-6">
                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    <Users size={16} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase">Attendees</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">2.4M</div>
                                            <div className="text-xs text-green-500 font-medium mt-1">+12% vs last year</div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                    <QrCode size={16} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase">Check-ins</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">1.8M</div>
                                            <div className="text-xs text-blue-500 font-medium mt-1">Live updates</div>
                                        </div>
                                    </div>

                                    {/* Main Graphic/Image Area */}
                                    <div className="relative rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow bg-blue-900 h-48 border border-blue-800">
                                        <Image
                                            src="/hero-fcs-group.jpg"
                                            alt="Dashboard Event"
                                            fill
                                            className="object-cover opacity-80 mix-blend-overlay hover:opacity-100 transition-opacity duration-700"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900/90 to-transparent">
                                            <div className="flex items-center gap-3 text-white">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="font-semibold text-sm">Zone B Conference - Live Stream</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List Items */}
                                    <div className="space-y-3">
                                        {[1, 2].map((k) => (
                                            <div key={k} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                                                    <div>
                                                        <div className="h-2 w-24 bg-gray-200 rounded mb-1" />
                                                        <div className="h-1.5 w-16 bg-gray-100 rounded" />
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md">
                                                    Registered
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge (Parallax maybe?) */}
                        <div className="absolute top-[15%] -right-12 z-20 animate-float animation-delay-1000">
                            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex flex-col items-center gap-2 w-32">
                                <div className="text-3xl font-black text-blue-600">98%</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-tighter text-center">Satisfaction Rate</div>
                            </div>
                        </div>

                        <div className="absolute bottom-[20%] -left-12 z-20 animate-float animation-delay-4000">
                            <div className="bg-white/90 backdrop-blur-md p-3 pr-5 rounded-full shadow-xl border border-white/50 flex items-center gap-3">
                                <div className="bg-green-500 p-2 rounded-full text-white">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-900">System Stable</div>
                                    <div className="text-[10px] text-gray-500">Uptime 99.9%</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Simple Mobile Image fallback */}
                    <div className="lg:hidden relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                        <Image
                            src="/hero-fcs-group.jpg"
                            alt="FCS Event"
                            width={800}
                            height={600}
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 text-white">
                            <p className="font-bold text-xl">Connecting Students Everywhere</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
