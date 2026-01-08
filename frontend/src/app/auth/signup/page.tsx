/**
 * Sign Up Page - Enhanced with Real-time Password Validation
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
import { Loader2, Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/constants/states";
import { authApi } from "@/lib/api/auth";

// Password strength calculator
const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (!password) return { score: 0, label: "No password", color: "#E5E7EB" };

  // Length check
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10; // Special characters

  // Determine label and color
  if (score < 40) return { score, label: "Weak", color: "#EF4444" };
  if (score < 60) return { score, label: "Fair", color: "#F59E0B" };
  if (score < 80) return { score, label: "Good", color: "#3B82F6" };
  return { score, label: "Strong", color: "#10B981" };
};

// Password requirement checker
interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p) => /[0-9]/.test(p) },
  { label: "Contains special character (recommended)", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup, login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Watch password fields for real-time validation
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(calculatePasswordStrength(""));
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

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

  // Real-time password validation
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password" && value.password) {
        setPasswordValue(value.password);
        setPasswordStrength(calculatePasswordStrength(value.password));

        // Check if passwords match
        if (confirmPasswordValue) {
          setPasswordsMatch(value.password === confirmPasswordValue);
        }
      }

      if (name === "confirmPassword" && value.confirmPassword) {
        setConfirmPasswordValue(value.confirmPassword);

        // Check if passwords match
        if (passwordValue) {
          setPasswordsMatch(passwordValue === value.confirmPassword);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, passwordValue, confirmPasswordValue]);

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
        setStep(2);
      } finally {
        setIsChecking(false);
      }
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      await signup(data);
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">
            {step === 1 ? "Personal Details" : "Branch Selection"}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center mb-6 space-x-2">
          <div
            className={`h-2 w-12 rounded-full transition-all duration-300 ${step === 1 ? "bg-primary scale-110" : "bg-primary/30"
              }`}
          />
          <div
            className={`h-2 w-12 rounded-full transition-all duration-300 ${step === 2 ? "bg-primary scale-110" : "bg-gray-200"
              }`}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.firstName.message}
                  </p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.lastName.message}
                  </p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.email.message}
                  </p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.phone.message}
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

                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Password Strength:</span>
                      <span className="font-semibold" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out rounded-full"
                        style={{
                          width: `${passwordStrength.score}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements Checklist */}
                {passwordValue && (
                  <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {passwordRequirements.map((req, index) => {
                      const isMet = req.test(passwordValue);
                      const isRequired = index < 4; // First 4 are required

                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-2 text-xs transition-all duration-200 ${isMet ? "text-green-600" : isRequired ? "text-gray-500" : "text-gray-400"
                            }`}
                        >
                          <div
                            className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${isMet
                              ? "bg-green-100 text-green-600 scale-110"
                              : "bg-gray-100 text-gray-400"
                              }`}
                          >
                            {isMet ? (
                              <Check className="w-3 h-3" strokeWidth={3} />
                            ) : (
                              <X className="w-3 h-3" strokeWidth={2} />
                            )}
                          </div>
                          <span className={isMet ? "font-medium" : ""}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password.message}
                  </p>
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-10 ${confirmPasswordValue
                      ? passwordsMatch
                        ? "border-green-300 focus:ring-green-500"
                        : "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-primary"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Real-time Password Match Indicator */}
                {confirmPasswordValue && passwordValue && (
                  <div className={`mt-2 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1 duration-200 ${passwordsMatch ? "text-green-600" : "text-red-500"
                    }`}>
                    {passwordsMatch ? (
                      <>
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="font-medium">Passwords match!</span>
                      </>
                    ) : (
                      <>
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="font-medium">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}

                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onNextStep}
                  disabled={isChecking}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white transition-all"
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.state.message}
                  </p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.zone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.zone.message}
                  </p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.branch && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.branch.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start text-sm mt-4 cursor-pointer group">
                <input type="checkbox" className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary transition-all" required />
                <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 shadow-sm hover:shadow"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
          <Link href="/auth/login" className="text-primary font-semibold hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
