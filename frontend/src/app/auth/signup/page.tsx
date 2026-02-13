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
import { centersApi } from "@/lib/api/centers";
import { eventsApi } from "@/lib/api/events";
import { Unit, EventCenter } from "@/types/api";

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



export default function SignupPage() {
  const router = useRouter();

  const { signup, login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Acc/Security, 2: Profile, 3: Membership, 4: Placement & Consent
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChecking, setIsChecking] = useState(false);

  // Location Data States
  const [states, setStates] = useState<Unit[]>([]);
  const [centers, setCenters] = useState<EventCenter[]>([]);
  const [latestEventId, setLatestEventId] = useState<string | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingCenters, setIsLoadingCenters] = useState(false);

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

  // Fetch States and Latest Event on Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingLocations(true);
        console.log('[Signup] Starting initial data fetch...');

        const [statesRes, eventsRes] = await Promise.all([
          unitsApi.list({ type: 'State', limit: 300 }),
          eventsApi.list({ isPublished: true, limit: 1 })
        ]);

        // Process States
        const statesData = statesRes.data?.data || statesRes?.data || [];
        if (Array.isArray(statesData) && statesData.length > 0) {
          setStates(statesData);
          console.log(`[Signup] ✅ Loaded ${statesData.length} states`);
        } else {
          // Fallback states logic
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
        }

        // Process Latest Event
        const latestEvent = eventsRes.data?.data?.[0];
        if (latestEvent) {
          setLatestEventId(latestEvent.id);
          console.log(`[Signup] ✅ Targeting Latest Event: ${latestEvent.title} (${latestEvent.id})`);
        }

      } catch (err) {
        console.error("[Signup] ❌ Failed to fetch initial data", err);
        // Fallback for states
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
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchInitialData();
  }, []);

  // Sync Institution Type with Membership Category
  useEffect(() => {
    if (membershipCategory === "PRIMARY" || membershipCategory === "SECONDARY" || membershipCategory === "TERTIARY") {
      setValue("institutionType", membershipCategory);
    }
  }, [membershipCategory, setValue]);

  // Watch State to Fetch Centers & Derive Area
  const selectedStateName = watch("state");
  useEffect(() => {
    const fetchCentersAndArea = async () => {
      if (!selectedStateName) {
        setCenters([]);
        setValue("branch", "");
        setValue("branchId", "");
        setValue("zone", "");
        return;
      }

      // Find the State Unit Object
      const stateUnit = states.find(s => s.name === selectedStateName);

      try {
        setIsLoadingCenters(true);

        // 1. Fetch Centers for this State
        if (latestEventId) {
          const response = await centersApi.listActive({
            eventId: latestEventId,
            state: stateUnit?.id
          });

          // listActive returns ApiResponse<EventCenter[]>
          const centersData = response.data;
          if (Array.isArray(centersData)) {
            setCenters(centersData);
            console.log(`[Signup] Loaded ${centersData.length} centers for state ${selectedStateName}`);
          }
        } else {
          console.warn('[Signup] No active event found to load centers');
          setCenters([]);
        }

        // 2. Derive Area using client-side mapping
        const area = getAreaFromState(selectedStateName);
        if (area) {
          setValue("zone", area);
        } else {
          setValue("zone", "Unassigned Area");
        }

      } catch (err) {
        console.error("Failed to fetch centers/area details", err);
        setCenters([]);
      } finally {
        setIsLoadingCenters(false);
      }
    };

    fetchCentersAndArea();
  }, [selectedStateName, states, latestEventId, setValue]);

  const onNextStep = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setError(null);

    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "phone", "email", "password", "confirmPassword"];
    } else if (step === 2) {
      fieldsToValidate = ["gender", "maritalStatus", "dateOfBirth", "membershipCategory"];
    } else if (step === 3) {
      if (membershipCategory === "ASSOCIATE" || membershipCategory === "STAFF") {
        fieldsToValidate = ["occupation", "placeOfWork"];
      } else {
        fieldsToValidate = ["institutionName", "institutionType", "level"];
        if (membershipCategory === "TERTIARY") fieldsToValidate.push("course");
      }
    }

    try {
      const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any[]) : true;

      if (!isValid) {
        setIsChecking(false);
        return;
      }

      if (step === 1) {
        const response = await authApi.checkExistence({
          email: email || undefined,
          phoneNumber: phone
        });

        if (response.data?.exists) {
          const { field, message } = response.data;
          if (field === 'email') setFormError("email", { type: "manual", message });
          else if (field === 'phoneNumber') setFormError("phone", { type: "manual", message });
          setIsChecking(false);
          return;
        }
      }

      setStep(prev => prev + 1);
    } catch (err: any) {
      console.error("Step navigation error:", err);
      setError(err.message || "Failed to proceed. Please try again.");
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
              width={200}
              height={200}
              quality={100}
              priority
              className="h-20 w-20 mx-auto hover:scale-110 transition-transform duration-300 object-contain"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">
            {step === 1 && "Account Identity"}
            {step === 2 && "Personal Profile"}
            {step === 3 && "Membership Details"}
            {step === 4 && "Placement & Consent"}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center mb-6 space-x-1.5">
          {[1, 2, 3, 4].map((s) => (
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
                  {["PRIMARY", "SECONDARY", "TERTIARY", "ASSOCIATE", "STAFF"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue("membershipCategory", cat as any)}
                      className={`px-3 py-2.5 border rounded-lg text-xs font-bold transition-all ${membershipCategory === cat
                        ? "bg-primary text-white border-primary shadow-md scale-[1.02]"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary/50"
                        } ${cat === "STAFF" ? "col-span-2" : ""}`}
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
                  onClick={() => setStep(1)}
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

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              {(membershipCategory === "ASSOCIATE" || membershipCategory === "STAFF") ? (
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <p className="text-blue-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                      {membershipCategory === "STAFF" ? "FCS Staff Member" : "Associate / Senior Friend"}
                    </p>
                    <p className="text-blue-600 text-xs">Please provide your professional background.</p>
                  </div>
                  {/* Office / Position (was Occupation) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      {membershipCategory === "STAFF" ? "Office / Position" : "Occupation"}
                    </label>
                    <input
                      {...register("occupation")}
                      type="text"
                      placeholder={membershipCategory === "STAFF" ? "e.g. Training Secretary" : "e.g. Software Engineer"}
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
                      placeholder={membershipCategory === "STAFF" ? "e.g. FCS National HQ" : "e.g. Google Nigeria"}
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
                      placeholder={
                        membershipCategory === "PRIMARY" ? "e.g. Grace Primary School" :
                          membershipCategory === "SECONDARY" ? "e.g. Federal Government College" :
                            "e.g. University of Lagos"
                      }
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
                        placeholder={
                          membershipCategory === "PRIMARY" ? "e.g. Primary 5" :
                            membershipCategory === "SECONDARY" ? "e.g. SS3" :
                              "e.g. 300L"
                        }
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
                  Last Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
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
                    FCS Center {isLoadingCenters && <Loader2 className="inline w-3 h-3 animate-spin" />}
                  </label>

                  {centers.length > 0 ? (
                    // Show dropdown when centers are available
                    <select
                      {...register("branch")}
                      onChange={(e) => {
                        const selectedCenter = centers.find(c => c.centerName === e.target.value);
                        setValue("branch", e.target.value);
                        if (selectedCenter && selectedCenter.stateId) {
                          setValue("branchId", selectedCenter.stateId);
                        } else {
                          setValue("branchId", undefined);
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select Center</option>
                      {centers.map(c => (
                        <option key={c.id} value={c.centerName}>{c.centerName}</option>
                      ))}
                    </select>
                  ) : selectedStateName ? (
                    // Show text input when state is selected but no centers found
                    <>
                      <input
                        {...register("branch")}
                        type="text"
                        placeholder="Enter your center or branch name"
                        onChange={(e) => {
                          setValue("branch", e.target.value);
                          // Clear branchId since it's a manual entry
                          setValue("branchId", undefined);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        No centers found for {selectedStateName}. Please enter your center/branch name.
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
                  onClick={() => setStep(3)}
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
