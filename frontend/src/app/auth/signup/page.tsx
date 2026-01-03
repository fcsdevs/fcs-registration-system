/**
 * Sign Up Page
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "@/lib/validations/schemas";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/constants/states";
import { authApi } from "@/lib/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const { signup, login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // We only track this for UI purposes if needed, otherwise RHF handles it
  // But let's keep it simple and rely on RHF


  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    watch,
    setError: setFormError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Fetching logic removed as we use text inputs now

  const onNextStep = async () => {
    const isValid = await trigger([
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ]);

    if (isValid) {
      setIsChecking(true);
      try {
        const email = watch("email");
        const phone = watch("phone");

        const response = await authApi.checkExistence({ email, phoneNumber: phone });

        if (response.data && response.data.exists) {
          const { field, message } = response.data;
          if (field === 'email') {
            setFormError("email", { type: "manual", message });
          } else if (field === 'phoneNumber') {
            setFormError("phone", { type: "manual", message });
          }
          setIsChecking(false);
          return;
        }

        setStep(2);
      } catch (error) {
        console.error("Failed to check user existence", error);
        // We proceed if there's an error checking, to avoid blocking flow on network error
        // Or we could show a warning. For now, proceeding is safer for UX unless strict strict.
        setStep(2);
      } finally {
        setIsChecking(false);
      }
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      // 1. Sign up the user
      await signup(data);

      // 2. Automatically log them in
      // This will handle token storage and redirect to /dashboard
      await login(data.email, data.password);

    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/fcs_logo.png"
              alt="FCS Logo"
              width={60}
              height={60}
              className="h-16 w-16 mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">
            {step === 1 ? "Personal Details" : "Branch Selection"}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center mb-6 space-x-2">
          <div
            className={`h-2 w-12 rounded-full ${step === 1 ? "bg-primary" : "bg-primary/30"
              }`}
          />
          <div
            className={`h-2 w-12 rounded-full ${step === 2 ? "bg-primary" : "bg-gray-200"
              }`}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-4">
          {error && (
            <div className="p-4 bg-error/10 border border-error text-error rounded-md text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  {...register("firstName")}
                  type="text"
                  placeholder="John"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.firstName && (
                  <p className="text-error text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  {...register("lastName")}
                  type="text"
                  placeholder="Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.lastName && (
                  <p className="text-error text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.email && (
                  <p className="text-error text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="08135711111"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.phone && (
                  <p className="text-error text-sm mt-1">{errors.phone.message}</p>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onNextStep}
                  disabled={isChecking}
                  className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {isChecking && <Loader2 className="w-4 h-4 animate-spin" />}
                  Next Step
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>

              {/* State Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  {...register("state")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-error text-sm mt-1">{errors.state.message}</p>
                )}
              </div>

              {/* Zone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone / Area
                </label>
                <input
                  {...register("zone")}
                  type="text"
                  placeholder="Enter Zone or Area"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.zone && (
                  <p className="text-error text-sm mt-1">{errors.zone.message}</p>
                )}
              </div>

              {/* Branch Input (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch (Optional)
                </label>
                <input
                  {...register("branch")}
                  type="text"
                  placeholder="Enter Branch Name (Optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.branch && (
                  <p className="text-error text-sm mt-1">{errors.branch.message}</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start text-sm mt-4">
                <input type="checkbox" className="mt-1" required />
                <span className="ml-2 text-gray-600">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-100 text-gray-700 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-primary text-white py-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Account
                </button>
              </div>
            </>
          )}
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
