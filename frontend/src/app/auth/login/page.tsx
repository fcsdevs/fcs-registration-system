/**
 * Login Page
 */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/schemas";
import Link from "next/link";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Check if redirected from signup
    const identifier = searchParams.get('email') || searchParams.get('phone');
    const registered = searchParams.get('registered');

    if (identifier) {
      setValue('identifier', identifier);
    }

    if (registered === 'true') {
      setSuccessMessage('Account created successfully! Please sign in with your credentials.');
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setSuccessMessage(null);
      await login(data.identifier, data.password);
      router.push("/home");
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40">
      {/* Enhanced Animated Background Blobs - Vibrant Colors */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Primary Gradient Blobs - More Vibrant & Sharp */}
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 via-indigo-500/25 to-blue-600/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-[-20%] left-[-15%] w-[700px] h-[700px] bg-gradient-to-br from-purple-500/30 via-fuchsia-500/25 to-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-25%] left-[15%] w-[650px] h-[650px] bg-gradient-to-br from-emerald-500/30 via-teal-500/25 to-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-4000" />

        {/* Secondary Accent Blobs - Sharper */}
        <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-gradient-to-br from-cyan-500/25 to-blue-600/25 rounded-full blur-2xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[30%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-br from-violet-500/25 to-purple-600/25 rounded-full blur-2xl animate-blob animation-delay-4000" />

        {/* Decorative Geometric Shapes - More Prominent */}
        <div className="absolute top-[20%] left-[5%] w-32 h-32 border-2 border-blue-300/40 rounded-2xl rotate-12 animate-float" />
        <div className="absolute bottom-[25%] right-[8%] w-24 h-24 border-2 border-purple-300/40 rounded-full animate-float animation-delay-2000" />
        <div className="absolute top-[60%] right-[15%] w-20 h-20 border-2 border-emerald-300/40 rounded-lg -rotate-12 animate-float animation-delay-4000" />

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.5)_1px,transparent_1px)] [background-size:32px_32px]" />

        {/* Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/20" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/fcs_logo.png"
              alt="FCS Logo"
              width={60}
              height={60}
              className="h-16 w-16 mx-auto hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-4 border border-gray-100">
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Identifier (Email or Phone) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address or Phone Number
            </label>
            <input
              {...register("identifier")}
              type="text"
              placeholder="Email or Phone Number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary transition-all" />
              <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary font-semibold hover:underline transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
