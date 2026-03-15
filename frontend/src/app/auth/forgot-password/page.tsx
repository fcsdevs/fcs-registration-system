"use client";
/**
 * Forgot Password Page - Multi-Path Recovery Redesign
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { 
    Loader2, 
    ArrowLeft, 
    Mail, 
    ShieldCheck, 
    Key, 
    Eye, 
    EyeOff, 
    CheckCircle, 
    Search, 
    User, 
    Calendar,
    ChevronRight,
    AlertCircle
} from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { 
        forgotPassword, 
        resetPassword, 
        searchRecoveryAccounts, 
        verifyRecoveryDob, 
        resetPasswordByToken 
    } = useAuth();

    // Recovery Mode: 'otp' | 'alternative'
    const [mode, setMode] = useState<'otp' | 'alternative'>('otp');
    
    // Steps: 
    // OTP Mode: 1 = Input Identifier, 2 = Verify OTP & Reset
    // Alternative Mode: 1 = Search, 2 = Select Account, 3 = Verify DOB, 4 = Final Reset
    const [step, setStep] = useState(1);
    
    // Common State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // OTP Path State
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");

    // Alternative Path State
    const [searchQuery, setSearchQuery] = useState("");
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
    const [dob, setDob] = useState("");
    const [recoveryToken, setRecoveryToken] = useState("");

    // --- Handlers ---

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) {
            setError("Please enter your Email or FCS Code");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await forgotPassword(identifier);
            setSuccess("Verification code sent! Please check your registered email or phone for the 6-digit OTP.");
            setStep(2);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await forgotPassword(identifier);
            setSuccess("Verification code re-sent! Please check your email or phone.");
        } catch (err: any) {
            setError(err.message || "Failed to resend OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!otp.trim()) {
            setError("Please enter the OTP sent to you");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(identifier, otp, newPassword);
            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password. Please check your OTP and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError("Please enter your Full Name or FCS Code");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            // Check if it's likely an FCS Code or a Name
            const isCode = /^FCS-|^[0-9]{4}-/.test(searchQuery.toUpperCase());
            const params = isCode ? { fcsCode: searchQuery.trim() } : { fullName: searchQuery.trim() };
            
            const results = await searchRecoveryAccounts(params);
            setAccounts(results);
            setStep(2);
        } catch (err: any) {
            setError(err.message || "No matching accounts found.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAccount = (account: any) => {
        setSelectedAccount(account);
        setStep(3);
    };

    const handleVerifyDob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dob) {
            setError("Please enter your Date of Birth");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const token = await verifyRecoveryDob(selectedAccount.memberId, dob);
            setRecoveryToken(token);
            setSuccess("Identity verified! Please set your new password.");
            setStep(4);
        } catch (err: any) {
            setError(err.message || "Incorrect Date of Birth provided.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetByToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await resetPasswordByToken(recoveryToken, newPassword);
            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setStep(1);
        setError(null);
        setSuccess(null);
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setDob("");
        setAccounts([]);
        setSelectedAccount(null);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40">
            {/* Background Blobs */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-indigo-500/25 to-blue-600/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-[-20%] left-[-15%] w-[700px] h-[700px] bg-gradient-to-br from-purple-500/30 via-fuchsia-500/25 to-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-25%] left-[15%] w-[650px] h-[650px] bg-gradient-to-br from-emerald-500/30 via-teal-500/25 to-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-block mb-4">
                        <Image
                            src="/fcs_logo.png"
                            alt="FCS Logo"
                            width={160}
                            height={160}
                            className="h-14 w-14 mx-auto object-contain"
                        />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Recovery Center
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Restore access to your FCS account
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
                    {/* Mode Toggle - Only on Step 1 */}
                    {step === 1 && (
                        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                            <button
                                onClick={() => { setMode('otp'); resetState(); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'otp' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Email OTP
                            </button>
                            <button
                                onClick={() => { setMode('alternative'); resetState(); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'alternative' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Identity Search
                            </button>
                        </div>
                    )}

                    {/* Feedback Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg text-xs flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* --- FLOWS --- */}

                    {/* OTP FLOW */}
                    {mode === 'otp' && (
                        <>
                            {step === 1 && (
                                <form onSubmit={handleRequestOtp} className="space-y-4">
                                    <div className="text-center pb-2">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm text-gray-600">Enter your Email or FCS Code to receive a verification code.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 px-1">Identity</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                                placeholder="Email or FCS Code"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Get OTP
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
                                        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                        <p className="text-[11px] text-amber-800">Check your spam folder if you don't see the code in 2 minutes.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 px-1">Confirmation Code</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 px-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 px-1">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Update Password
                                    </button>
                                    <div className="flex justify-between items-center px-1">
                                        <button type="button" onClick={() => setStep(1)} className="text-gray-400 text-xs py-1 hover:text-gray-600">Wrong identifier? Back up.</button>
                                        <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-primary font-bold text-xs py-1 hover:underline disabled:opacity-50">Resend Code</button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}

                    {/* ALTERNATIVE FLOW (SEARCH -> Selection -> DOB) */}
                    {mode === 'alternative' && (
                        <>
                            {step === 1 && (
                                <form onSubmit={handleSearch} className="space-y-4 text-center">
                                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">Can't access your email? Search for your account using your name or code.</p>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="Full Name or FCS Code"
                                        />
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Search Account
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="text-center mb-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select your account</p>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {accounts.map((acc) => (
                                            <button
                                                key={acc.memberId}
                                                onClick={() => handleSelectAccount(acc)}
                                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-white border border-transparent hover:border-primary/30 rounded-xl transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                                        {acc.name.charAt(0)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-semibold text-gray-800">{acc.name}</p>
                                                        <p className="text-[10px] text-gray-500">{acc.fcsCode} • {acc.email || acc.phoneNumber}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setStep(1)} className="w-full text-primary font-medium text-xs mt-4">Try another search</button>
                                </div>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleVerifyDob} className="space-y-4 text-center">
                                    <div className="pb-2">
                                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-sm">
                                            <User className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">{selectedAccount.name}</h3>
                                        <p className="text-xs text-gray-500">{selectedAccount.fcsCode}</p>
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <p className="text-sm text-blue-900 mb-3 font-medium">Verify your identity</p>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-4 h-4" />
                                            <input
                                                type="date"
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm text-blue-900"
                                            />
                                        </div>
                                        <p className="text-[10px] text-blue-600 mt-2 italic">Enter the Date of Birth you used during registration.</p>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Verify Identity
                                    </button>
                                    <button type="button" onClick={() => setStep(2)} className="text-gray-400 text-xs">Back to selection</button>
                                </form>
                            )}

                            {step === 4 && (
                                <form onSubmit={handleResetByToken} className="space-y-4">
                                    <div className="text-center pb-2">
                                        <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">Identity verified! Secure your account with a new password.</p>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 px-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="••••••••"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 px-1">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="••••••••"
                                                />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Reset Password
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-all group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Login
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
