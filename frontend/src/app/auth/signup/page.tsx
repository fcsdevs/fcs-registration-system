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
import {
  Loader2, Eye, EyeOff, Check, X, AlertCircle, ShieldCheck,
  User, GraduationCap, Briefcase, MapPin, Phone, MessageSquare,
  Heart, ChevronRight, ChevronLeft, Building2
} from "lucide-react";
import { NIGERIAN_STATES } from "@/lib/constants/states";
import { authApi } from "@/lib/api/auth";
import { unitsApi } from "@/lib/api/units";
import { Unit } from "@/types/api";

// Area-State Mapping for automatic zone/area assignment
const AREA_STATE_MAPPING: Record<string, string[]> = {
  "Abuja Area": ["Abuja (FCT)", "Niger", "Kwara", "Kogi"],
  "Adamawa Area": ["Adamawa", "Gombe", "Taraba"],
  "Kaduna Area": ["Kaduna", "Kano", "Katsina", "Jigawa"],
  "Nasarawa Area": ["Nasarawa", "Benue", "Plateau"],
  "Sokoto Area": ["Sokoto", "Kebbi", "Zamfara"],
  "Yobe Area": ["Yobe"],
  "South East Area": ["Anambra", "Enugu", "Ebonyi", "Imo", "Abia"],
  "South South Area": ["Cross River", "Bayelsa", "Akwa Ibom", "Rivers", "Edo", "Delta"],
  "South West Area": ["Ogun", "Oyo", "Osun", "Ondo", "Lagos", "Ekiti"]
};

// Helper function to get area from state name
const getAreaFromState = (stateName: string): string | null => {
  for (const [area, states] of Object.entries(AREA_STATE_MAPPING)) {
    if (states.some(s => s.toLowerCase() === stateName.toLowerCase())) {
      return area;
    }
  }
  return null;
};

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

// Resend OTP Component with Countdown
const ResendOTPButton = ({ onResend }: { onResend: () => Promise<void> }) => {
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setCountdown(60); // Start 60s countdown
    } catch (error) {
      console.error("Resend failed", error);
    } finally {
      setIsResending(false);
    }
  };

  if (countdown > 0) {
    return (
      <p className="text-xs text-gray-400 mt-2">
        Resend code in <span className="font-mono font-bold text-primary">{countdown}s</span>
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={isResending}
      className="text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50 mt-2"
    >
      {isResending ? "Resending..." : "Resend Code"}
    </button>
  );
};

export default function SignupPage() {
  const router = useRouter();
  const [otpValue, setOtpValue] = useState("");
  const { signup, login, isLoading, sendOTP } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Acc/Security, 2: OTP, 3: Profile, 4: Membership, 5: Placement & Consent
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChecking, setIsChecking] = useState(false);

  // Location Data States
  const [states, setStates] = useState<Unit[]>([]);
  const [branches, setBranches] = useState<Unit[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

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
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      membershipCategory: "PRIMARY",
      institutionType: "PRIMARY",
      gender: "MALE",
      maritalStatus: "SINGLE",
      privacyPolicyAccepted: false,
      termsAccepted: false,
      state: "",
      zone: "",
      branch: "",
    }
  });

  // Watch fields
  const membershipCategory = watch("membershipCategory");
  const dateOfBirth = watch("dateOfBirth");
  const email = watch("email");
  const phone = watch("phone");

  // Determine if minor
  const isMinor = React.useMemo(() => {
    if (!dateOfBirth) return false;
    const dob = new Date(dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    return age < 18;
  }, [dateOfBirth]);

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

        // Check if passwordValue exists
        if (passwordValue) {
          setPasswordsMatch(passwordValue === value.confirmPassword);
        }
      }
    });

    return () => subscription.unsubscribe();

  }, [watch, passwordValue, confirmPasswordValue]);

  // Fetch States on Mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setIsLoadingLocations(true);
        console.log('[Signup] Starting states fetch...');
        const response = await unitsApi.list({ type: 'State', limit: 300 }); // Increased limit
        console.log('[Signup] Full States API Response:', response);
        console.log('[Signup] response.data:', response.data);
        console.log('[Signup] response.data?.data:', response.data?.data);

        // Handle paginated response: response.data is the PaginatedResponse
        const statesData = response.data?.data || response?.data || [];
        console.log('[Signup] Extracted statesData:', statesData);
        console.log('[Signup] Is array?', Array.isArray(statesData));
        console.log('[Signup] Array length:', Array.isArray(statesData) ? statesData.length : 'N/A');

        if (Array.isArray(statesData) && statesData.length > 0) {
          setStates(statesData);
          console.log(`[Signup] ✅ Loaded ${statesData.length} states from API`);
        } else {
          console.warn('[Signup] ⚠️ States data is empty or malformed, using fallback', { response, statesData });
          // Fallback: Convert NIGERIAN_STATES to Unit objects
          const fallbackStates: Unit[] = NIGERIAN_STATES.map((stateName, idx) => ({
            id: `state-${idx}`,
            name: stateName === 'FCT' ? 'Abuja (FCT)' : stateName,
            code: `ST-${idx}`,
            isActive: true,
            type: 'State',
            description: '',
            unitTypeId: '',
            parentId: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setStates(fallbackStates);
          console.log(`[Signup] ✅ Loaded ${fallbackStates.length} states from fallback`);
        }
      } catch (err) {
        console.error("[Signup] ❌ Failed to fetch states", err);
        // Fallback: Use hardcoded states
        const fallbackStates: Unit[] = NIGERIAN_STATES.map((stateName, idx) => ({
          id: `state-${idx}`,
          name: stateName === 'FCT' ? 'Abuja (FCT)' : stateName,
          code: `ST-${idx}`,
          isActive: true,
          type: 'State',
          description: '',
          unitTypeId: '',
          parentId: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setStates(fallbackStates);
        console.log(`[Signup] ✅ Loaded ${fallbackStates.length} states from error fallback`);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchStates();
  }, []);

  // Watch State to Fetch Branches & Derive Area
  const selectedStateName = watch("state");
  useEffect(() => {
    const fetchBranchesAndArea = async () => {
      if (!selectedStateName) {
        setBranches([]);
        setValue("branch", "");
        setValue("branchId", "");
        setValue("zone", "");
        return;
      }

      // Find the State Unit Object
      const stateUnit = states.find(s => s.name === selectedStateName);
      if (!stateUnit) return;

      try {
        setIsLoadingBranches(true);

        // 1. Fetch Branches for this State
        const response = await unitsApi.list({
          parentUnitId: stateUnit.id,
          type: 'Branch',
          recursive: true, // Use recursive to find nested branches (State -> Zone -> Branch)
          limit: 300
        });

        // Handle paginated response
        const branchesData = response.data?.data || response?.data || [];
        if (Array.isArray(branchesData)) {
          setBranches(branchesData);
          console.log(`Loaded ${branchesData.length} branches for state ${selectedStateName}`);
        }

        // 2. Derive Area using client-side mapping
        const area = getAreaFromState(selectedStateName);
        if (area) {
          setValue("zone", area);
        } else {
          // Fallback if state not in mapping
          setValue("zone", "Unassigned Area");
        }

      } catch (err) {
        console.error("Failed to fetch branches/area details", err);
        setBranches([]);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranchesAndArea();
  }, [selectedStateName, states, setValue]);

  const onNextStep = async () => {
    if (isChecking) return;
    let fieldsToValidate: any[] = [];

    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "phone", "password", "confirmPassword"];
    } else if (step === 3) {
      fieldsToValidate = ["gender", "maritalStatus", "dateOfBirth", "membershipCategory"];
    } else if (step === 4) {
      if (membershipCategory === "ASSOCIATE") {
        fieldsToValidate = ["occupation", "placeOfWork"];
      } else {
        fieldsToValidate = ["institutionName", "institutionType", "level"];
        if (membershipCategory === "TERTIARY") fieldsToValidate.push("course");
      }
    }

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any[]) : true;

    if (isValid) {
      if (step === 1) {
        setIsChecking(true);
        try {
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

          // Send OTP
          await sendOTP(email || phone, 'REGISTRATION');
          setStep(2);
        } catch (error: any) {
          console.error("Failed to check user existence or send OTP", error);
          setError(error.message || "Failed to proceed to next step");
        } finally {
          setIsChecking(false);
        }
      } else {
        setStep(prev => prev + 1);
      }
    }
  };

  const verifyAndGoToStep3 = async () => {
    if (!otpValue || otpValue.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsChecking(true);
      setError(null);

      const response = await authApi.verifyOTP({
        phoneNumber: phone,
        email: email || undefined,
        code: otpValue,
        purpose: 'REGISTRATION'
      });

      if (response.data?.verified) {
        setStep(3);
      } else {
        setError("Invalid or expired OTP");
      }
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setIsChecking(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      await signup(data);
      router.replace("/dashboard");
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
            {step === 1 && "Account Identity"}
            {step === 2 && "Verification"}
            {step === 3 && "Personal Profile"}
            {step === 4 && "Membership Details"}
            {step === 5 && "Placement & Consent"}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center mb-6 space-x-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? "w-10 bg-primary" : step > s ? "w-4 bg-primary/40" : "w-4 bg-gray-200"
                }`}
            />
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register("firstName")}
                      type="text"
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register("lastName")}
                      type="text"
                      placeholder="Doe"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Other Names */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Names <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    {...register("otherNames")}
                    type="text"
                    placeholder="Middle Name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Preferred Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nick / Preferred
                  </label>
                  <input
                    {...register("preferredName")}
                    type="text"
                    placeholder="Johnny"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-xs text-primary">(Used for Login)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="08135711111"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
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
            <div className="space-y-6">
              <div className="text-center">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900">Verify Your Identity</h3>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit code to <span className="font-semibold text-primary">{watch("email") || watch("phone")}</span>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent tracking-[0.5em] font-mono text-center text-xl"
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">Didn't receive the code?</p>
                <ResendOTPButton
                  onResend={() => sendOTP(watch("email") || watch("phone"), 'REGISTRATION')}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all font-medium"
                >
                  Edit details
                </button>
                <button
                  type="button"
                  onClick={verifyAndGoToStep3}
                  disabled={isChecking || otpValue.length < 6}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {isChecking && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Gender
                  </label>
                  <select
                    {...register("gender")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white transition-all shadow-sm"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Marital Status
                  </label>
                  <select
                    {...register("maritalStatus")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white transition-all shadow-sm"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-500" />
                  Date of Birth
                </label>
                <input
                  {...register("dateOfBirth")}
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              {/* Membership Category */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Membership Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["PRIMARY", "SECONDARY", "TERTIARY", "ASSOCIATE"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue("membershipCategory", cat as any)}
                      className={`px-3 py-2.5 border rounded-lg text-xs font-bold transition-all ${membershipCategory === cat
                        ? "bg-primary text-white border-primary shadow-md scale-[1.02]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.membershipCategory && (
                  <p className="text-red-500 text-xs mt-1">{errors.membershipCategory.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-gray-50 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onNextStep}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95"
                >
                  Next Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              {membershipCategory === "ASSOCIATE" ? (
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <p className="text-blue-800 text-[10px] font-bold uppercase tracking-wider mb-1">Associate / Senior Friend</p>
                    <p className="text-blue-600 text-xs">Please provide your professional background.</p>
                  </div>
                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      Occupation
                    </label>
                    <input
                      {...register("occupation")}
                      type="text"
                      placeholder="e.g. Software Engineer"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  {/* Place of Work */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      Place of Work
                    </label>
                    <input
                      {...register("placeOfWork")}
                      type="text"
                      placeholder="e.g. Google Nigeria"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
                    <p className="text-purple-800 text-[10px] font-bold uppercase tracking-wider mb-1">Academic Profile</p>
                    <p className="text-purple-600 text-xs">Tell us about your current institution.</p>
                  </div>

                  {/* Institution Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      Institution Name
                    </label>
                    <input
                      {...register("institutionName")}
                      type="text"
                      placeholder="e.g. University of Lagos"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Institution Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Inst. Type</label>
                      <select
                        {...register("institutionType")}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
                      >
                        <option value="PRIMARY">Primary</option>
                        <option value="SECONDARY">Secondary</option>
                        <option value="TERTIARY">Tertiary</option>
                      </select>
                    </div>
                    {/* Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Class / Level</label>
                      <input
                        {...register("level")}
                        type="text"
                        placeholder="e.g. 300L / SS3"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                  </div>

                  {membershipCategory === "TERTIARY" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Course of Study</label>
                      <input
                        {...register("course")}
                        type="text"
                        placeholder="e.g. Computer Science"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 bg-gray-50 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onNextStep}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95"
                >
                  Last Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  FCS Placement
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      State {isLoadingLocations && <Loader2 className="inline w-3 h-3 animate-spin" />}
                    </label>
                    <select
                      {...register("state")}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Zone / Area (Auto-Filled)</label>
                    <input
                      {...register("zone")}
                      readOnly
                      placeholder="Auto-assigned based on State"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    FCS Branch {isLoadingBranches && <Loader2 className="inline w-3 h-3 animate-spin" />}
                  </label>

                  {branches.length > 0 ? (
                    // Show dropdown when branches are available
                    <select
                      {...register("branch")}
                      onChange={(e) => {
                        const selectedBranch = branches.find(b => b.name === e.target.value);
                        setValue("branch", e.target.value);
                        if (selectedBranch) {
                          setValue("branchId", selectedBranch.id);
                        } else {
                          setValue("branchId", undefined);
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  ) : selectedStateName ? (
                    // Show text input when state is selected but no branches found
                    <>
                      <input
                        {...register("branch")}
                        type="text"
                        placeholder="Enter your branch name"
                        onChange={(e) => {
                          setValue("branch", e.target.value);
                          // Clear branchId since it's a manual entry
                          setValue("branchId", undefined);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        No branches found for {selectedStateName}. Please enter your branch name.
                      </p>
                    </>
                  ) : (
                    // Show placeholder when no state is selected
                    <select
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    >
                      <option>Select a state first</option>
                    </select>
                  )}
                </div>
              </div>

              {isMinor && (
                <div className="space-y-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <p className="text-amber-800 text-[10px] font-bold uppercase tracking-wider">Guardian (Minor Profile)</p>
                  </div>
                  <input
                    {...register("guardianName")}
                    placeholder="Guardian Full Name"
                    className="w-full px-3 py-2.5 border border-amber-200 rounded-xl text-sm bg-white/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <input
                    {...register("guardianPhone")}
                    placeholder="Guardian Phone"
                    className="w-full px-3 py-2.5 border border-amber-200 rounded-xl text-sm bg-white/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                  <input
                    {...register("privacyPolicyAccepted")}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <p className="text-[11px] text-gray-500 leading-normal group-hover:text-gray-700">
                    I agree to the <Link href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link> and data processing terms.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                  <input
                    {...register("termsAccepted")}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <p className="text-[11px] text-gray-500 leading-normal group-hover:text-gray-700">
                    I accept the <Link href="/terms" className="text-primary hover:underline font-semibold">Terms of Service</Link> and code of conduct.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-1/3 bg-gray-50 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-xl shadow-blue-200/50 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finish Signup"}
                </button>
              </div>
            </div>
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
