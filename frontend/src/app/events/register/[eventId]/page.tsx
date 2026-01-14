/**
 * Public Event Registration Page
 * NO AUTHENTICATION REQUIRED - Anyone with the link can register
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Calendar,
    MapPin,
    Users,
    Mail,
    Phone,
    User,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    ChevronRight,
    Lock,
    Globe,
    Building,
    Scan,
    FileText,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import { ParticipationModeSelector } from '@/components/registrations/participation-mode-selector';
import { CenterSelector } from '@/components/registrations/center-selector';
import { GroupSelector } from '@/components/registrations/group-selector';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PublicEventRegistrationPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        participationMode: undefined as 'ONLINE' | 'ONSITE' | undefined,
        centerId: '',
        groupId: '',
    });

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ data: Event }>(`/events/${eventId}`);
            setEvent(response.data);

            if (response.data.participationMode === 'ONLINE') {
                setFormData(prev => ({ ...prev, participationMode: 'ONLINE' }));
            } else if (response.data.participationMode === 'ONSITE') {
                setFormData(prev => ({ ...prev, participationMode: 'ONSITE' }));
            }
        } catch (error) {
            console.error('Failed to fetch event:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
            if (!formData.password.trim()) newErrors.password = 'Password is required';
            else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
            else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }

        if (step === 2 && event?.participationMode === 'HYBRID') {
            if (!formData.participationMode) newErrors.participationMode = 'Please select how you will participate';
        }

        if (step === 3 && (formData.participationMode === 'ONSITE' || event?.participationMode === 'ONSITE')) {
            if (!formData.centerId) newErrors.centerId = 'Please select a center';
        }

        if (step === 4) {
            if (!formData.groupId) newErrors.groupId = 'Please select a group';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        try {
            setSubmitting(true);

            const response = await api.post<{ data: { id: string; fcsCode: string; accessToken: string } }>('/registrations/public', {
                eventId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                participationMode: formData.participationMode || event?.participationMode,
                centerId: formData.centerId || undefined,
                groupId: formData.groupId || undefined,
            });

            router.push(`/events/registration/${response.data.id}?token=${response.data.accessToken}&fcsCode=${response.data.fcsCode}`);
        } catch (error: any) {
            let userMessage = 'System Sync failed. Please check your connectivity and try again.';

            if (error.status === 409 || error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('conflict')) {
                userMessage = 'Identity Match Detected: Our secure registry indicates you are already enrolled for this event. Please retrieve your existing digital credentials from your inbox.';
            }

            setErrors({ submit: userMessage });
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const totalSteps = 5;
    const progressValue = (currentStep / totalSteps) * 100;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-bounce mb-6">
                    <ShieldCheck className="h-10 w-10 text-[#060CCD]" />
                </div>
                <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-widest">Enabling Portal</h2>
                <div className="mt-4 w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#060CCD] animate-[loading_2s_infinite]" />
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 rounded-[40px] border-none shadow-2xl text-center">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <Scan className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0F172A] mb-2 uppercase tracking-tight">Session Expired</h2>
                    <p className="text-slate-500 font-medium text-sm mb-8">This registration link is no longer active.</p>
                    <Button asChild className="w-full h-14 rounded-2xl bg-[#060CCD] hover:bg-[#010030] font-bold">
                        <Link href="/events">Explore Other Events</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <style jsx global>{` @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } } `}</style>

            {/* Cinematic Header Background */}
            <div className="h-[400px] bg-gradient-to-br from-[#060CCD] via-[#010030] to-[#010030] absolute top-0 left-0 right-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 pb-24">
                {/* Event Summary Card */}
                <div className="mb-12 flex flex-col items-center text-center">
                    <Badge className="mb-6 h-8 px-4 py-0 bg-white/20 hover:bg-white/30 text-white border-none rounded-full backdrop-blur-md font-black uppercase text-[10px] tracking-widest">
                        Official Session Registration
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-tight max-w-3xl">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-blue-400" />
                            {new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-blue-400" />
                            {event.participationMode === 'HYBRID' ? 'Global Access' : event.participationMode}
                        </div>
                        <div className={`h-2 w-2 rounded-full ${event.isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    </div>
                </div>

                {/* Main Registration Container */}
                <Card className="rounded-[40px] border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] bg-white/80 backdrop-blur-2xl overflow-hidden relative">
                    {/* Floating Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 ease-out"
                            style={{ width: `${progressValue}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Sidebar Progress */}
                        <div className="lg:col-span-4 bg-slate-50/50 p-10 border-r border-slate-100 hidden lg:block">
                            <div className="space-y-12">
                                {[
                                    { step: 1, label: "Identity", icon: User },
                                    { step: 2, label: "Modality", icon: Globe },
                                    { step: 3, label: "Precinct", icon: Building },
                                    { step: 4, label: "Affiliation", icon: Users },
                                    { step: 5, label: "Validation", icon: ShieldCheck }
                                ].map((s) => (
                                    <div key={s.step} className="flex items-center gap-4 group transition-all">
                                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${currentStep === s.step ? 'bg-[#060CCD] text-white shadow-xl shadow-blue-200' :
                                            currentStep > s.step ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                                            }`}>
                                            {currentStep > s.step ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === s.step ? 'text-[#060CCD]' : 'text-slate-400'}`}>Step 0{s.step}</span>
                                            <span className={`text-sm font-black uppercase tracking-tight ${currentStep === s.step ? 'text-[#0F172A]' : 'text-slate-400'}`}>{s.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Content Area */}
                        <div className="lg:col-span-8 p-10 md:p-14 min-h-[500px] flex flex-col">

                            <div className="flex-1">
                                {currentStep === 1 && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Member Identity</h2>
                                            <p className="text-slate-500 font-medium text-sm">Create your attendee profile for this session</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-[#64748B] uppercase tracking-widest px-1">First Name</label>
                                                    <div className="relative group">
                                                        <Input
                                                            value={formData.firstName}
                                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                            className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-12 font-bold focus:shadow-md transition-all"
                                                            placeholder="e.g. Samuel"
                                                        />
                                                        <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#060CCD] transition-colors" size={20} />
                                                    </div>
                                                    {errors.firstName && <p className="text-[10px] text-red-500 font-black uppercase px-1 mt-1">{errors.firstName}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-[#64748B] uppercase tracking-widest px-1">Last Name</label>
                                                    <div className="relative group">
                                                        <Input
                                                            value={formData.lastName}
                                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                            className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-12 font-bold focus:shadow-md transition-all"
                                                            placeholder="e.g. CICAN"
                                                        />
                                                        <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#060CCD] transition-colors" size={20} />
                                                    </div>
                                                    {errors.lastName && <p className="text-[10px] text-red-500 font-black uppercase px-1 mt-1">{errors.lastName}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-[#64748B] uppercase tracking-widest px-1">Email System</label>
                                                <div className="relative group">
                                                    <Input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-12 font-bold focus:shadow-md transition-all"
                                                        placeholder="contact@fcs.org"
                                                    />
                                                    <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#060CCD] transition-colors" size={20} />
                                                </div>
                                                {errors.email && <p className="text-[10px] text-red-500 font-black uppercase px-1 mt-1">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-[#64748B] uppercase tracking-widest px-1">Voice ID / Phone</label>
                                                <div className="relative group">
                                                    <Input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-12 font-bold focus:shadow-md transition-all"
                                                        placeholder="+234 ..."
                                                    />
                                                    <Phone className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#060CCD] transition-colors" size={20} />
                                                </div>
                                                {errors.phone && <p className="text-[10px] text-red-500 font-black uppercase px-1 mt-1">{errors.phone}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-[#64748B] uppercase tracking-widest px-1">Pass-Key</label>
                                                    <div className="relative group">
                                                        <Input
                                                            type="password"
                                                            value={formData.password}
                                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                            className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-12 font-bold focus:shadow-md transition-all"
                                                            placeholder="••••••••"
                                                            autoComplete="new-password"
                                                        />
                                                        <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#060CCD] transition-colors" size={20} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-[#64748B] uppercase tracking-widest px-1">Confirm Pass-Key</label>
                                                    <div className="relative group">
                                                        <Input
                                                            type="password"
                                                            value={formData.confirmPassword}
                                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                            className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-12 font-bold focus:shadow-md transition-all"
                                                            placeholder="••••••••"
                                                            autoComplete="new-password"
                                                        />
                                                        <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#060CCD] transition-colors" size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                            {(errors.password || errors.confirmPassword) && (
                                                <p className="text-[10px] text-red-500 font-black uppercase px-1 mt-1">
                                                    {errors.password || errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Session Modality</h2>
                                            <p className="text-slate-500 font-medium text-sm">Choose how you wish to experience this event</p>
                                        </div>
                                        <ParticipationModeSelector
                                            participationModes={[event.participationMode] as any}
                                            selectedMode={formData.participationMode}
                                            onSelect={(mode) => {
                                                setFormData({ ...formData, participationMode: mode });
                                                setErrors({});
                                            }}
                                            error={errors.participationMode}
                                        />
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Location Precinct</h2>
                                            <p className="text-slate-500 font-medium text-sm">Select the official center you will be attending</p>
                                        </div>
                                        <CenterSelector
                                            eventId={eventId}
                                            selectedCenterId={formData.centerId}
                                            onSelect={(centerId) => {
                                                setFormData({ ...formData, centerId });
                                                setErrors({});
                                            }}
                                            error={errors.centerId}
                                        />
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Study Affiliation</h2>
                                            <p className="text-slate-500 font-medium text-sm">Join a group for coordinated session activities</p>
                                        </div>
                                        <GroupSelector
                                            eventId={eventId}
                                            selectedGroupId={formData.groupId}
                                            onSelect={(groupId) => {
                                                setFormData({ ...formData, groupId });
                                                setErrors({});
                                            }}
                                            error={errors.groupId}
                                            required={true}
                                        />
                                    </div>
                                )}

                                {currentStep === 5 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Dossier Validation</h2>
                                            <p className="text-slate-500 font-medium text-sm">Verify your submission details before confirmation</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 shadow-inner space-y-8">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Identity</p>
                                                    <p className="text-lg font-black text-[#0F172A] uppercase tracking-tight">{formData.firstName} {formData.lastName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Digital Anchor</p>
                                                    <p className="text-sm font-bold text-[#0F172A] truncate">{formData.email}</p>
                                                </div>
                                            </div>

                                            <div className="h-px bg-slate-200" />

                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Mode</p>
                                                    <Badge className="bg-[#060CCD]/10 text-[#060CCD] border-none font-bold uppercase text-[10px] px-3">
                                                        {formData.participationMode || event.participationMode}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Voice Protocol</p>
                                                    <p className="text-sm font-bold text-[#0F172A]">{formData.phone}</p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                                <ShieldCheck className="text-emerald-600" size={20} />
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.05em]">Validation Security Protocol Check Sum: Active</span>
                                            </div>
                                        </div>

                                        {errors.submit && (
                                            <div className="mt-8 bg-red-50 border border-red-100 text-red-700 p-6 rounded-[32px] flex items-start gap-4">
                                                <Sparkles className="h-6 w-6 flex-shrink-0" />
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-widest mb-1">System Feedback</p>
                                                    <p className="text-sm font-bold opacity-90 leading-tight">{errors.submit}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Navigation Zone */}
                            <div className="mt-14 pt-10 border-t border-slate-100 flex items-center justify-between">
                                {currentStep > 1 ? (
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="h-16 px-10 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50"
                                    >
                                        <ArrowLeft className="mr-2" size={16} /> Previous Page
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < totalSteps ? (
                                    <Button
                                        onClick={handleNext}
                                        className="h-16 px-12 rounded-2xl bg-[#060CCD] hover:bg-[#010030] text-white shadow-2xl shadow-blue-200 font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        Execute Next <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="h-16 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-200 font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                                                Authenticating...
                                            </>
                                        ) : (
                                            <>Confirm Registration <ChevronRight className="ml-2" size={16} /></>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Secure Footer */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                            <Lock className="text-slate-400" size={18} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End-To-End Security Enabled</p>
                    </div>
                    <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Link href="/" className="hover:text-[#060CCD] transition-colors">Privacy Charter</Link>
                        <Link href="/" className="hover:text-[#060CCD] transition-colors">Terms of Service</Link>
                        <a href={`/events/${eventId}/login`} className="text-[#060CCD] hover:underline">Participant Portal Login</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
