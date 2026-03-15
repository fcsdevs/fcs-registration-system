"use client";
/**
 * OTP Verification Page
 * Handles email verification after signup
 */

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle,
  Mail,
  RefreshCw
} from "lucide-react";
import { authApi } from "@/lib/api/auth";

function VerifyOTPForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { sendOTP } = useAuth();

    const identifier = searchParams.get('identifier') || "";
    const purpose = searchParams.get('purpose') || "REGISTRATION";

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!identifier) {
            router.push("/auth/login");
        }
    }, [identifier, router]);

    // Timer logic for resending OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            const response = await authApi.verifyOTP({
                email: identifier.includes('@') ? identifier : undefined,
                phoneNumber: !identifier.includes('@') ? identifier : undefined,
                code: otp,
                purpose
            });

            if (response.data?.verified) {
                setSuccess("Account verified successfully! Redirecting...");
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || "Invalid or expired code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        try {
            setIsResending(true);
            setError(null);
            await sendOTP(identifier, purpose);
            setSuccess("A new verification code has been sent!");
            setCountdown(60); // 1 minute cooldown
        } catch (err: any) {
            setError(err.message || "Failed to resend code. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40">
            {/* Background Blobs */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-indigo-500/25 to-blue-600/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[-25%] left-[15%] w-[650px] h-[650px] bg-gradient-to-br from-purple-500/30 via-fuchsia-500/25 to-pink-500/30 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <Image
                            src="/fcs_logo.png"
                            alt="FCS Logo"
                            width={160}
                            height={160}
                            className="h-16 w-16 mx-auto hover:rotate-6 transition-transform duration-300"
                        />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
                    <p className="text-gray-600">
                        We've sent a 6-digit verification code to
                    </p>
                    <p className="font-semibold text-blue-600 mt-1">{identifier}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                                Enter Verification Code
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                placeholder="000000"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            Verify Account
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-4">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={isResending || countdown > 0}
                            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className={`w-4 h-4 ${countdown > 0 ? '' : 'group-hover:rotate-180 transition-transform duration-500'}`} />}
                            {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Verification Code"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/auth/login" className="text-gray-500 text-sm font-medium hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        }>
            <VerifyOTPForm />
        </Suspense>
    );
}
