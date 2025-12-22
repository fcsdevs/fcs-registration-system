/**
 * Public Event Registration Page
 * NO AUTHENTICATION REQUIRED - Anyone with the link can register
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Mail, Phone, User, ArrowRight } from 'lucide-react';
import { Event } from '@/types/api';
import { api } from '@/lib/api/client';
import { ParticipationModeSelector } from '@/components/registrations/participation-mode-selector';
import { CenterSelector } from '@/components/registrations/center-selector';
import { GroupSelector } from '@/components/registrations/group-selector';
import Link from 'next/link';

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
            // Public endpoint - no auth required
            const response = await api.get<{ data: Event }>(`/events/${eventId}`);
            setEvent(response.data);

            // Auto-set participation mode if event is single-mode
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

            // Redirect to registration success page with access token and FCS Code
            router.push(`/events/registration/${response.data.id}?token=${response.data.accessToken}&fcsCode=${response.data.fcsCode}`);
        } catch (error: any) {
            setErrors({ submit: error.message || 'Registration failed. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const totalSteps = 5;
    const needsModeSelection = event?.participationMode === 'HYBRID';
    const needsCenterSelection = formData.participationMode === 'ONSITE' || event?.participationMode === 'ONSITE';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
                    <p className="text-gray-600">This registration link may be invalid or expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Event Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Calendar className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#010030] mb-2">{event.title}</h1>
                            <p className="text-gray-600 mb-4">{event.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.participationMode === 'ONLINE' ? 'bg-blue-100 text-blue-700' :
                                        event.participationMode === 'ONSITE' ? 'bg-amber-100 text-amber-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                        {event.participationMode}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600">
                            Already registered? <Link href={`/events/${eventId}/login`} className="text-blue-600 hover:text-blue-700 font-medium">Login here</Link>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step < currentStep ? 'bg-green-600 text-white' :
                                    step === currentStep ? 'bg-blue-600 text-white' :
                                        'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step}
                                </div>
                                {step < 5 && (
                                    <div className={`flex-1 h-1 mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-600">Your Info</span>
                        <span className="text-xs text-gray-600">Mode</span>
                        <span className="text-xs text-gray-600">Center</span>
                        <span className="text-xs text-gray-600">Group</span>
                        <span className="text-xs text-gray-600">Review</span>
                    </div>
                </div>

                {/* Form Steps */}
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
                            <p className="text-gray-600 mb-6">Please provide your details to register for this event</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="John"
                                            />
                                        </div>
                                        {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Doe"
                                            />
                                        </div>
                                        {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="+234 800 000 0000"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Create Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                        />
                                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Re-enter password"
                                            autoComplete="new-password"
                                        />
                                        {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && needsModeSelection && (
                        <div>
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

                    {currentStep === 2 && !needsModeSelection && needsCenterSelection && (
                        <CenterSelector
                            eventId={eventId}
                            selectedCenterId={formData.centerId}
                            onSelect={(centerId) => {
                                setFormData({ ...formData, centerId });
                                setErrors({});
                            }}
                            error={errors.centerId}
                        />
                    )}

                    {currentStep === 3 && needsCenterSelection && (
                        <CenterSelector
                            eventId={eventId}
                            selectedCenterId={formData.centerId}
                            onSelect={(centerId) => {
                                setFormData({ ...formData, centerId });
                                setErrors({});
                            }}
                            error={errors.centerId}
                        />
                    )}

                    {currentStep === 4 && (
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
                    )}

                    {currentStep === 5 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Registration</h2>

                            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-semibold text-gray-900">{formData.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-semibold text-gray-900">{formData.phone}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Participation Mode</p>
                                    <p className="font-semibold text-gray-900">{formData.participationMode || event.participationMode}</p>
                                </div>

                                {formData.centerId && (
                                    <div>
                                        <p className="text-sm text-gray-600">Event Center</p>
                                        <p className="font-semibold text-gray-900">Selected Center</p>
                                    </div>
                                )}
                            </div>

                            {errors.submit && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                                    {errors.submit}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Back
                        </button>

                        {currentStep < totalSteps ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Next
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        Complete Registration
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
