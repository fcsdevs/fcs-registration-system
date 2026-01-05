"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronRight, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming utils exists, standard in shadcn-like setups. If not, I'll use clsx/tailwind-merge directly or create it.

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "How it Works", href: "#how-it-works" },
        { name: "Benefits", href: "#benefits" },
        { name: "Testimonials", href: "#testimonials" },
    ];

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                    isScrolled
                        ? "border-gray-200/20 bg-white/80 backdrop-blur-xl shadow-sm py-3"
                        : "border-transparent bg-transparent py-5"
                )}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20">
                                <Image
                                    src="/fcs_logo.png"
                                    alt="FCS Logo"
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-contain p-1"
                                />
                            </div>
                            <span className={cn("text-xl font-bold tracking-tight transition-colors", isScrolled ? "text-gray-900" : "text-gray-900")}>
                                FCS <span className="text-blue-600">Portal</span>
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                href="/auth/login"
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-4 py-2"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/signup"
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all shadow-lg shadow-blue-600/20 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                            >
                                Get Started
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden flex flex-col pt-24 px-6",
                    isMobileMenuOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-full"
                )}
            >
                <div className="flex flex-col gap-6 text-lg font-medium text-gray-900">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between border-b border-gray-100 pb-4"
                        >
                            {link.name}
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                    ))}
                    <div className="mt-4 flex flex-col gap-4">
                        <Link
                            href="/auth/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full py-3 text-center text-gray-700 bg-gray-50 rounded-xl font-semibold border border-gray-200"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/auth/signup"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full py-3 text-center text-white bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
