/**
 * Landing Page - Public Homepage
 * Modernized with Glassmorphism and Premium Aesthetics
 */

import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  ArrowRight,
  Users,
  CalendarDays,
  Globe2,
  QrCode,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  Zap,
  CheckCircle2,
  Building2,
  MapPin,
  GraduationCap
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";

export const metadata: Metadata = {
  title: "FCS Nigeria - Registration & Attendance System",
  description: "The next-generation platform for member registration, event management, and attendance tracking.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50 selection:bg-brand-primary/20 selection:text-brand-primary">
      {/* Decorative Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Modern Glass Header */}
      <Navbar />

      <main className="relative z-10">

        {/* Modern Split Hero Section */}
        <Hero />

        {/* Brand/Trust Section */}
        <section className="py-16 border-y border-gray-200/60 bg-white/80 backdrop-blur-md overflow-hidden relative">
          <div className="mx-auto max-w-7xl lg:px-8 relative z-10">
            <p className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-12">
              Beneficiaries
            </p>

            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-16 items-center shrink-0 pr-16">
                    <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-blue-700" />
                      </div>
                      <span className="font-bold text-gray-700 text-lg">FCS NIGERIA</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-purple-700" />
                      </div>
                      <span className="font-bold text-gray-700 text-lg">Student Ministry</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-emerald-700" />
                      </div>
                      <span className="font-bold text-gray-700 text-lg">National HQ</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Globe2 className="w-6 h-6 text-orange-700" />
                      </div>
                      <span className="font-bold text-gray-700 text-lg">Regional Office</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <MapPin className="w-6 h-6 text-pink-700" />
                      </div>
                      <span className="font-bold text-gray-700 text-lg">State Office</span>
                    </div>

                    <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-indigo-700" />
                      </div>
                      <span className="font-bold text-gray-700 text-lg">Zonal Office</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>



        {/* How It Works - Steps */}
        <section id="how-it-works" className="py-24 bg-gray-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]"></div>

          <div className="px-6 mx-auto max-w-7xl lg:px-8 relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16">
              Simple, streamlined process
            </h2>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { num: "01", title: "Create Profile", desc: "Sign up and build your comprehensive member profile in minutes." },
                { num: "02", title: "Browse Events", desc: "Discover upcoming national and regional gatherings tailored for you." },
                { num: "03", title: "Quick Register", desc: "One-click registration for events with your saved profile data." },
                { num: "04", title: "Check In", desc: "Use your unique QR code for instant access on event day." }
              ].map((step, idx) => (
                <div key={idx} className="relative p-6 pt-10 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                  <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-br-xl rounded-tl-xl border-t border-l border-white/20">
                    STEP {step.num}
                  </span>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Premium Split Design */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="mx-auto max-w-7xl relative">

            {/* Main Container with Split Layout */}
            <div className="relative rounded-[2rem] overflow-hidden isolate shadow-2xl">

              {/* Enhanced Background Layer */}
              <div className="absolute inset-0 z-0">
                {/* Rich Gradient Base */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600" />

                {/* Overlay Gradient for Depth */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-purple-900/40" />

                {/* Sophisticated Pattern Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:32px_32px]" />

                {/* Multiple Animated Glow Orbs */}
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-400/20 rounded-full blur-[80px] animate-blob animation-delay-4000" />

                {/* Subtle Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
              </div>

              {/* Content - Split Layout */}
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-12 md:p-16 lg:p-20">

                {/* Left: Headline & Description */}
                <div className="text-white space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Get Started</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                    Ready to transform{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200 animate-gradient-x">
                      your experience?
                    </span>
                  </h2>

                  <p className="text-lg md:text-xl text-blue-50/90 leading-relaxed max-w-lg">
                    Join thousands of FCS members using the platform to connect, organize, and grow their ministries.
                  </p>

                  {/* Trust Badge */}
                  <div className="flex items-center gap-3 pt-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/20 backdrop-blur-sm" />
                      ))}
                    </div>
                    <span className="text-sm text-blue-100/70 font-medium">500+ Ministries Trust Us</span>
                  </div>
                </div>

                {/* Right: Premium Action Buttons */}
                <div className="flex flex-col gap-4">
                  {/* Primary CTA - Glassmorphic */}
                  <Link
                    href="/auth/signup"
                    className="group relative px-8 py-5 bg-white/95 backdrop-blur-xl text-indigo-900 font-bold text-lg text-center rounded-2xl shadow-2xl shadow-black/20 hover:shadow-white/30 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                  >
                    {/* Animated Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Link>

                  {/* Secondary CTA - Glass Border */}
                  <Link
                    href="/auth/login"
                    className="group px-8 py-5 bg-white/5 backdrop-blur-md border-2 border-white/30 text-white font-semibold text-lg text-center rounded-2xl hover:bg-white/10 hover:border-white/50 hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Member Login
                      <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </span>
                  </Link>

                  {/* Subtle Helper Text */}
                  <p className="text-center text-sm text-blue-100/60 mt-2">
                    No credit card required • Free forever
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Modern Premium Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 border-t border-gray-800">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.3)_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">

            {/* Brand Section - Spans 4 columns on large screens */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-white text-lg">F</span>
                </div>
                <span className="font-bold text-xl text-white">FCS Nigeria</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                Empowering the next generation through digital innovation and spiritual growth.
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                <Link href="https://www.facebook.com/fcsnig" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </Link>
                <Link href="https://www.instagram.com/fcsnigeria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" /></svg>
                </Link>
                <Link href="https://www.youtube.com/@fcsnigeria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </Link>
                <Link href="https://www.tiktok.com/@fcsnigeria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="TikTok">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.46 1.43-1.61 2.41-.09.99.14 2.05.78 2.81.65.7 1.64 1.05 2.59.98 1.02-.05 1.96-.58 2.47-1.45.38-.61.54-1.35.53-2.06.01-3.89.02-7.78.02-11.67z" /></svg>
                </Link>
                <Link href="https://whatsapp.com/channel/0029VaFW845GZNCjAzvsB01H" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="WhatsApp Channel">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.559.925 3.527 1.488 5.604 1.488 5.304 0 9.622-4.318 9.622-9.621 0-2.569-1.001-4.985-2.819-6.802-1.819-1.82-4.232-2.822-6.804-2.822-5.305 0-9.624 4.319-9.624 9.623 0 2.124.593 4.144 1.71 5.864l-.968 3.535 3.679-.965zm10.188-7.92c-.3-.15-1.774-.875-2.049-.976-.275-.1-.475-.15-.675.15s-.775.976-.95 1.176-.35.225-.65.075c-.3-.15-1.267-.467-2.414-1.492-.892-.796-1.492-1.78-1.667-2.08s-.019-.462.13-.611c.134-.133.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525-.675-1.625-.925-2.225c-.244-.589-.491-.51-.675-.52l-.575-.01c-.2 0-.525.075-.8.375s-1.05 1.026-1.05 2.501c0 1.475 1.075 2.899 1.225 3.099s2.116 3.235 5.121 4.532c.714.308 1.272.492 1.707.631.716.227 1.368.195 1.883.117.573-.087 1.774-.725 2.024-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.2-.575-.35z" /></svg>
                </Link>
                <Link href="https://t.me/fcsnigeria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="Telegram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.894-17.435c.164 0 .312.045.44.132.128.087.214.208.257.362.043.155.038.333-.012.533l-2.107 9.941c-.042.203-.142.364-.299.482-.157.119-.336.176-.537.171-.158-.005-.303-.042-.435-.113l-3.373-2.484-1.623 1.562c-.15.144-.311.216-.484.216-.114 0-.224-.026-.33-.078-.106-.052-.191-.126-.255-.221s-.095-.202-.095-.32l.003-2.31 6.643-6.002c.07-.063.103-.143.099-.238-.004-.095-.041-.17-.111-.225s-.155-.082-.256-.082c-.101 0-.191.026-.271.078l-8.216 5.172-1.913-.604c-.263-.083-.396-.238-.396-.464 0-.154.095-.29.285-.411l15.37-5.92c.129-.05.252-.075.369-.075z" /></svg>
                </Link>
                <Link href="https://www.fcsnigeria.org" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5" title="Official Website">
                  <Globe2 className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Features
                </Link></li>
                <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  How It Works
                </Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Events
                </Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Pricing
                </Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  About Us
                </Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Contact
                </Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Careers
                </Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Blog
                </Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Privacy Policy
                </Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Terms of Service
                </Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Cookie Policy
                </Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">Get the latest updates and news.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} FCS Nigeria. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents for cleaner code


function FeatureCard({ icon, gradient, title, description }: { icon: React.ReactNode, gradient: string, title: string, description: string }) {
  return (
    <div className="group relative p-8 h-full bg-white/60 backdrop-blur-sm rounded-[2rem] border border-white/50 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
      {/* Gradient Hover Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />

      {/* Icon Container */}
      <div className={`relative w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">{title}</h3>
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">{description}</p>
      </div>

      {/* Action Arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
      </div>
    </div>
  );
}
