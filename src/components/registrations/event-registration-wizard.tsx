/**
 * Event Registration Wizard
 * Multi-step wizard for registering users for events
 */

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Event, CreateRegistrationRequest } from '@/types/api';
import { ParticipationModeSelector } from './participation-mode-selector';
import { CenterSelector } from './center-selector';
import { GroupSelector } from './group-selector';
import { api } from '@/lib/api/client';

interface RegistrationWizardProps {
    event: Event;
    memberId: string;
    memberName: string;
    onComplete?: (registrationId: string) => void;
}

type Step = 'mode' | 'center' | 'group' | 'review';

interface RegistrationData {
    participationMode?: 'ONLINE' | 'ONSITE';
    centerId?: string;
    centerName?: string;
    groupId?: string;
    groupName?: string;
}

export function EventRegistrationWizard({
    event,
    memberId,
    memberName,
    onComplete,
}: RegistrationWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('mode');
    const [formData, setFormData] = useState<RegistrationData>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Determine if we need each step based on event configuration
    const needsModeSelection = event.participationMode === 'HYBRID';
    const needsCenterSelection = formData.participationMode === 'ONSITE' || event.participationMode === 'ONSITE';
    const needsGroupSelection = true; // Assuming all events have groups

    const steps: Step[] = [];
    if (needsModeSelection) steps.push('mode');
    if (needsCenterSelection) steps.push('center');
    if (needsGroupSelection) steps.push('group');
    steps.push('review');

    const currentStepIndex = steps.indexOf(currentStep);
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 'mode' && needsModeSelection) {
            if (!formData.participationMode) {
                newErrors.mode = 'Please select how you will participate';
            }
        }

        if (currentStep === 'center' && needsCenterSelection) {
            if (!formData.centerId) {
                newErrors.center = 'Please select an event center';
            }
        }

        if (currentStep === 'group' && needsGroupSelection) {
            if (!formData.groupId) {
                newErrors.group = 'Please select a Bible study group';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateCurrentStep()) return;

        if (isLastStep) {
            handleSubmit();
        } else {
            setCurrentStep(steps[currentStepIndex + 1]);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStep(steps[currentStepIndex - 1]);
            setErrors({});
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            const requestData: CreateRegistrationRequest = {
                eventId: event.id,
                memberId,
                participationMode: formData.participationMode || event.participationMode as any,
                centerId: formData.centerId,
            };

            const response = await api.post<{ data: { id: string } }>('/registrations', requestData);

            // Assign group if selected
            if (formData.groupId && response.data?.id) {
                await api.post(`/registrations/${response.data.id}/assign-group`, {
                    groupId: formData.groupId,
                });
            }

            if (onComplete && response.data?.id) {
                onComplete(response.data.id);
            } else {
                router.push(`/my-events/${event.id}/registration-success`);
            }
        } catch (error: any) {
            console.error('Registration failed:', error);
            setErrors({ submit: error.message || 'Registration failed. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'mode':
                return (
                    <ParticipationModeSelector
                        participationModes={[event.participationMode] as any}
                        selectedMode={formData.participationMode}
                        onSelect={(mode) => {
                            setFormData({ ...formData, participationMode: mode });
                            setErrors({});
                        }}
                        error={errors.mode}
                    />
                );

            case 'center':
                return (
                    <CenterSelector
                        eventId={event.id}
                        selectedCenterId={formData.centerId}
                        onSelect={(centerId, centerName) => {
                            setFormData({ ...formData, centerId, centerName });
                            setErrors({});
                        }}
                        error={errors.center}
                    />
                );

            case 'group':
                return (
                    <GroupSelector
                        eventId={event.id}
                        selectedGroupId={formData.groupId}
                        onSelect={(groupId, groupName) => {
                            setFormData({ ...formData, groupId, groupName });
                            setErrors({});
                        }}
                        error={errors.group}
                        required={true}
                    />
                );

            case 'review':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Registration</h3>
                            <p className="text-gray-600 mb-6">
                                Please review your selections before confirming your registration
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg divide-y">
                            <div className="p-4">
                                <p className="text-sm text-gray-600">Event</p>
                                <p className="font-semibold text-gray-900">{event.title}</p>
                            </div>

                            <div className="p-4">
                                <p className="text-sm text-gray-600">Participant</p>
                                <p className="font-semibold text-gray-900">{memberName}</p>
                            </div>

                            <div className="p-4">
                                <p className="text-sm text-gray-600">Participation Mode</p>
                                <p className="font-semibold text-gray-900">
                                    {formData.participationMode || event.participationMode}
                                </p>
                            </div>

                            {formData.centerId && (
                                <div className="p-4">
                                    <p className="text-sm text-gray-600">Event Center</p>
                                    <p className="font-semibold text-gray-900">{formData.centerName}</p>
                                </div>
                            )}

                            {formData.groupId && (
                                <div className="p-4">
                                    <p className="text-sm text-gray-600">Bible Study Group</p>
                                    <p className="font-semibold text-gray-900">{formData.groupName}</p>
                                </div>
                            )}
                        </div>

                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                                {errors.submit}
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'mode':
                return 'Participation Mode';
            case 'center':
                return 'Select Center';
            case 'group':
                return 'Select Group';
            case 'review':
                return 'Review & Confirm';
            default:
                return '';
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {steps.map((step, index) => (
                        <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${index < currentStepIndex
                                        ? 'bg-green-600 text-white'
                                        : index === currentStepIndex
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                                </div>
                                <p className={`text-xs mt-1 ${index === currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
                                    }`}>
                                    {step.charAt(0).toUpperCase() + step.slice(1)}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{getStepTitle()}</h2>
                {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={isFirstStep}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isFirstStep
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>

                <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Registering...
                        </>
                    ) : isLastStep ? (
                        <>
                            Confirm Registration
                            <Check className="w-5 h-5" />
                        </>
                    ) : (
                        <>
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
