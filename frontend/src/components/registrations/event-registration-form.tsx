/**
 * Event Registration Form
 * A comprehensive, world-class registration UI with profile synchronization,
 * auto-age calculation, and dynamic conditional rendering.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertCircle,
} from 'lucide-react';
import { Event, EventGroup, EventCenter, CreateRegistrationRequest } from '@/types/api';
import { api } from '@/lib/api/client';
import { groupsApi } from '@/lib/api/groups';
import { centersApi } from '@/lib/api/centers';
import { membersApi } from '@/lib/api/members';
import { unitsApi } from '@/lib/api/units';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

interface RegistrationFormProps {
    event: Event;
    member: any;
    isSelf?: boolean;
    onComplete?: (registrationId: string) => void;
}

interface FormState {
    attendanceIntent: 'CONFIRMED' | 'TENTATIVE';
    participationMode: 'ONLINE' | 'ONSITE' | 'HYBRID';
    centerId: string;
    workshopId: string;
    seminarId: string;
    // Profile Sync Fields
    membershipCategory: string;
    dateOfBirth: string;
    institutionName: string;
    institutionType: string;
    level: string;
    course: string;
    graduationYear: string;
    occupation: string;
    placeOfWork: string;
    department: string;
    ageBracket: string;
    // Guardian Fields
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    guardianRelationship: string;
}

// Helper for clean form fields with horizontal layout
const FormField = ({ label, required, children, error, icon: Icon }: any) => (
    <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-12 md:col-span-3 flex items-center justify-end md:text-right">
            <Label className="text-sm font-bold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}:
            </Label>
        </div>
        <div className="col-span-12 md:col-span-9">
            <div className="relative">
                {children}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    </div>
);

export function EventRegistrationForm({
    event,
    member,
    isSelf = true,
    onComplete,
}: RegistrationFormProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Available options
    const [centers, setCenters] = useState<EventCenter[]>([]);
    const [groups, setGroups] = useState<EventGroup[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [selectedCenterState, setSelectedCenterState] = useState<string>('');

    const [formData, setFormData] = useState<FormState>({
        attendanceIntent: 'CONFIRMED',
        participationMode: event.participationMode === 'HYBRID' ? 'ONSITE' : (event.participationMode as any),
        centerId: '',
        workshopId: '',
        seminarId: '',
        // Initialize with member data
        membershipCategory: member?.membershipCategory || '',
        dateOfBirth: member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
        institutionName: member?.institutionName || '',
        institutionType: member?.institutionType || '',
        level: member?.level || '',
        course: member?.course || '',
        graduationYear: member?.graduationYear?.toString() || '',
        occupation: member?.occupation || '',
        placeOfWork: member?.placeOfWork || '',
        department: member?.department || '',
        ageBracket: member?.ageBracket || '',
        guardianName: member?.guardianName || '',
        guardianPhone: member?.guardianPhone || '',
        guardianEmail: member?.guardianEmail || '',
        guardianRelationship: member?.guardianRelationship || '',
    });

    // Auto-calculate age bracket when DOB changes
    useEffect(() => {
        if (formData.dateOfBirth) {
            const birth = new Date(formData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }

            let bracket = '';
            if (age <= 12) bracket = '0-12';
            else if (age <= 17) bracket = '13-17';
            else if (age <= 24) bracket = '18-24';
            else if (age <= 34) bracket = '25-34';
            else if (age <= 44) bracket = '35-44';
            else bracket = '45+';

            setFormData(prev => ({ ...prev, ageBracket: bracket }));
        }
    }, [formData.dateOfBirth]);

    useEffect(() => {
        fetchOptions();
    }, [event.id]);

    const fetchOptions = async () => {
        try {
            setLoadingData(true);
            const [centersRes, groupsRes, statesRes] = await Promise.all([
                centersApi.listActive({ eventId: event.id, limit: 1000 }),
                groupsApi.listByEvent(event.id, { isActive: true, limit: 100 }),
                unitsApi.list({ type: 'State', limit: 100 })
            ]);

            // Handle centers
            let fetchedCenters: EventCenter[] = [];
            if (centersRes.data) {
                if (Array.isArray(centersRes.data)) fetchedCenters = centersRes.data;
                else if ((centersRes.data as any).data) fetchedCenters = (centersRes.data as any).data;
            }

            // Handle groups
            let fetchedGroups: EventGroup[] = [];
            if (groupsRes.data) {
                if ((groupsRes.data as any).groups) fetchedGroups = (groupsRes.data as any).groups;
                else if (Array.isArray(groupsRes.data)) fetchedGroups = groupsRes.data as any;
                else if ((groupsRes.data as any).data) fetchedGroups = (groupsRes.data as any).data;
            }
            setGroups(fetchedGroups);

            // Handle states
            let fetchedStates: any[] = [];
            if (statesRes.data) {
                if (Array.isArray(statesRes.data)) fetchedStates = statesRes.data;
                else if ((statesRes.data as any).data) fetchedStates = (statesRes.data as any).data;
            }

            // Derive available states from centers
            const derivedStateMap = new Map();
            fetchedCenters.forEach(c => {
                if (c.state) derivedStateMap.set(c.state.id, c.state);
            });

            const finalStatesList = fetchedStates.length > 0 ? fetchedStates : Array.from(derivedStateMap.values());
            setStates(finalStatesList);

            // Pre-select state if member has one
            if (member?.state) {
                const memberState = finalStatesList.find(s =>
                    s.name.toLowerCase() === member.state.toLowerCase() ||
                    s.id === member.state
                );
                if (memberState) {
                    setSelectedCenterState(memberState.id);
                    const filtered = fetchedCenters.filter(c => c.stateId === memberState.id || c.state?.id === memberState.id);
                    setCenters(filtered.length > 0 ? filtered : fetchedCenters);
                } else {
                    setCenters(fetchedCenters);
                }
            } else {
                setCenters(fetchedCenters);
            }

        } catch (error) {
            console.error('Failed to fetch registration options:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (event.participationMode === 'HYBRID' && !formData.participationMode) {
            newErrors.participationMode = 'Please select participation mode';
        }

        if ((formData.participationMode === 'ONSITE' || formData.participationMode === 'HYBRID') && !formData.centerId) {
            newErrors.centerId = 'Please select an event center';
        }

        // Profile validation
        if (!formData.membershipCategory) newErrors.membershipCategory = 'Membership category is required';
        if (!formData.ageBracket) newErrors.ageBracket = 'Age range is required';

        // Guardian validation for minors
        if (formData.ageBracket === '0-12' || formData.ageBracket === '13-17') {
            if (!formData.guardianName) newErrors.guardianName = 'Guardian name is required for minors';
            if (!formData.guardianPhone) newErrors.guardianPhone = 'Guardian phone is required for minors';
            if (!formData.guardianRelationship) newErrors.guardianRelationship = 'Relationship is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);

            // 1. Update Member Profile (Sync)
            const profileUpdatePayload = {
                membershipCategory: formData.membershipCategory as any,
                dateOfBirth: formData.dateOfBirth,
                institutionName: formData.institutionName,
                institutionType: formData.institutionType as any,
                level: formData.level,
                course: formData.course,
                graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
                occupation: formData.membershipCategory === 'ASSOCIATE' || formData.membershipCategory === 'STAFF' ? formData.occupation : undefined,
                placeOfWork: formData.membershipCategory === 'ASSOCIATE' || formData.membershipCategory === 'STAFF' ? formData.placeOfWork : undefined,
                department: formData.membershipCategory === 'STAFF' ? formData.department : undefined,
                ageBracket: formData.ageBracket,
                guardianName: formData.guardianName,
                guardianPhone: formData.guardianPhone,
                guardianEmail: formData.guardianEmail,
                guardianRelationship: formData.guardianRelationship,
            };

            if (isSelf) {
                await membersApi.updateProfile(profileUpdatePayload as any);
            } else {
                await membersApi.update(member.id, profileUpdatePayload as any);
            }

            // 2. Proceed with Registration
            const request: CreateRegistrationRequest = {
                eventId: event.id,
                memberId: member.id,
                participationMode: formData.participationMode,
                attendanceIntent: formData.attendanceIntent,
                centerId: (formData.participationMode === 'ONSITE' || formData.participationMode === 'HYBRID') ? formData.centerId : undefined,
            };

            const response = await api.post<{ data: { id: string } }>('/registrations', request);
            const registrationId = response.data?.id;

            if (registrationId) {
                // Assign Workshop if selected
                if (formData.workshopId && formData.workshopId !== 'none') {
                    await api.post(`/registrations/${registrationId}/assign-group`, {
                        groupId: formData.workshopId
                    });
                }

                // Assign Seminar if selected
                if (formData.seminarId && formData.seminarId !== 'none') {
                    await api.post(`/registrations/${registrationId}/assign-group`, {
                        groupId: formData.seminarId
                    });
                }

                if (onComplete) {
                    onComplete(registrationId);
                } else {
                    router.push(`/my-events/registration/${registrationId}`);
                }
            }
        } catch (error: any) {
            console.error('Registration failed:', error);
            setErrors({ submit: error.message || 'Failed to complete registration. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading registration options...</p>
            </div>
        );
    }

    const workshops = groups.filter(g => g.type === 'WORKSHOP');
    const seminars = groups.filter(g => g.type === 'SEMINAR');

    const hasBibleStudy = groups.some(g => g.type === 'BIBLE_STUDY');


    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">

            {/* 1. Identity & Profile Section */}
            <div className="space-y-4">
                <div className="col-span-12 border-b border-gray-100 my-2 pb-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase ml-1">Personal Information</h3>
                </div>

                <div className="space-y-3">
                    <FormField label="Membership Category" required error={errors.membershipCategory}>
                        <Select
                            value={formData.membershipCategory}
                            onValueChange={(val) => setFormData({ ...formData, membershipCategory: val })}
                        >
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="PRIMARY">Primary Student</SelectItem>
                                <SelectItem value="SECONDARY">Secondary Student</SelectItem>
                                <SelectItem value="TERTIARY">Tertiary Student</SelectItem>
                                <SelectItem value="ASSOCIATE">Associate (Staff/Graduate)</SelectItem>
                                <SelectItem value="STAFF">FCS Staff / Volunteer</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Age Range" required error={errors.ageBracket}>
                        <Select
                            value={formData.ageBracket}
                            onValueChange={(val) => setFormData({ ...formData, ageBracket: val })}
                        >
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Select Age Range" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="0-12">0-12 years</SelectItem>
                                <SelectItem value="13-17">13-17 years</SelectItem>
                                <SelectItem value="18-24">18-24 years</SelectItem>
                                <SelectItem value="25-34">25-34 years</SelectItem>
                                <SelectItem value="35-44">35-44 years</SelectItem>
                                <SelectItem value="45+">45+ years</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    {/* Conditional: Tertiary */}
                    {(formData.membershipCategory === 'TERTIARY') && (
                        <>
                            <FormField label="Institution Type">
                                <Select
                                    value={formData.institutionType}
                                    onValueChange={(val) => setFormData({ ...formData, institutionType: val })}
                                >
                                    <SelectTrigger className="bg-white h-9">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="UNIVERSITY">University</SelectItem>
                                        <SelectItem value="POLYTECHNIC">Polytechnic</SelectItem>
                                        <SelectItem value="COLLEGE_OF_EDUCATION">College of Education</SelectItem>
                                        <SelectItem value="OTHER">Other Tertiary</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Institution Name">
                                <Input
                                    value={formData.institutionName}
                                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                    placeholder="Name of Institution"
                                    className="bg-white h-9"
                                />
                            </FormField>

                            <FormField label="Level / Year">
                                <Select
                                    value={formData.level}
                                    onValueChange={(val) => setFormData({ ...formData, level: val })}
                                >
                                    <SelectTrigger className="bg-white h-9">
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="100">100 Level / Year 1</SelectItem>
                                        <SelectItem value="200">200 Level / Year 2</SelectItem>
                                        <SelectItem value="300">300 Level / Year 3</SelectItem>
                                        <SelectItem value="400">400 Level / Year 4</SelectItem>
                                        <SelectItem value="500">500 Level / Year 5</SelectItem>
                                        <SelectItem value="600">600 Level / Year 6</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Course of Study">
                                <Input
                                    value={formData.course}
                                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    placeholder="Course of study"
                                    className="bg-white h-9"
                                />
                            </FormField>
                        </>
                    )}

                    {/* Conditional: Staff */}
                    {(formData.membershipCategory === 'STAFF') && (
                        <>
                            <FormField label="Department / Unit" required>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Department"
                                    className="bg-white h-9"
                                    required
                                />
                            </FormField>
                            <FormField label="Place of Work / Office">
                                <Input
                                    value={formData.placeOfWork}
                                    onChange={(e) => setFormData({ ...formData, placeOfWork: e.target.value })}
                                    placeholder="Place of work"
                                    className="bg-white h-9"
                                />
                            </FormField>
                        </>
                    )}

                    {/* Variable: Guardian */}
                    {(formData.ageBracket === '0-12' || formData.ageBracket === '13-17') && (
                        <>
                            <div className="col-span-12 border-t border-gray-100 my-2 pt-2">
                                <p className="text-xs font-bold text-gray-500 uppercase ml-1">Parent / Guardian Information</p>
                            </div>

                            <FormField label="Guardian Name" required error={errors.guardianName}>
                                <Input
                                    value={formData.guardianName}
                                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                                    placeholder="Guardian Name"
                                    className="bg-white h-9"
                                    required
                                />
                            </FormField>

                            <FormField label="Guardian Phone" required error={errors.guardianPhone}>
                                <Input
                                    value={formData.guardianPhone}
                                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                    placeholder="Phone Number"
                                    className="bg-white h-9"
                                    required
                                />
                            </FormField>

                            <FormField label="Guardian Email">
                                <Input
                                    type="email"
                                    value={formData.guardianEmail}
                                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                                    placeholder="Email Address"
                                    className="bg-white h-9"
                                />
                            </FormField>

                            <FormField label="Relationship" required error={errors.guardianRelationship}>
                                <Select
                                    value={formData.guardianRelationship}
                                    onValueChange={(val) => setFormData({ ...formData, guardianRelationship: val })}
                                >
                                    <SelectTrigger className="bg-white h-9">
                                        <SelectValue placeholder="Select Relationship" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="FATHER">Father</SelectItem>
                                        <SelectItem value="MOTHER">Mother</SelectItem>
                                        <SelectItem value="UNCLE">Uncle</SelectItem>
                                        <SelectItem value="AUNT">Aunt</SelectItem>
                                        <SelectItem value="GUARDIAN">Legal Guardian</SelectItem>
                                        <SelectItem value="SPONSOR">Sponsor / Chaplain</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </>
                    )}
                </div>
            </div>

            {/* 2. Registration Details */}
            <div className="space-y-4 pt-2 mt-4 border-t border-gray-100">
                <div className="col-span-12 border-b border-gray-100 my-2 pb-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase ml-1">Event Registration</h3>
                </div>

                <div className="space-y-3">
                    <FormField label="Attendance Intent">
                        <Select
                            value={formData.attendanceIntent}
                            onValueChange={(val: any) => setFormData({ ...formData, attendanceIntent: val })}
                        >
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Select intent" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="CONFIRMED">Confirmed (I will be there)</SelectItem>
                                <SelectItem value="TENTATIVE">Tentative (Attempting to be there)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Participation Mode" error={errors.participationMode}>
                        <Select
                            value={formData.participationMode}
                            onValueChange={(val: any) => setFormData({ ...formData, participationMode: val, centerId: val === 'ONLINE' ? '' : formData.centerId })}
                            disabled={event.participationMode !== 'HYBRID'}
                        >
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="ONLINE">Online</SelectItem>
                                <SelectItem value="ONSITE">On-site</SelectItem>
                                <SelectItem value="HYBRID">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    {/* Location Selection */}
                    {(formData.participationMode === 'ONSITE' || formData.participationMode === 'HYBRID') && (
                        <>
                            <FormField label="State" required>
                                <Select
                                    value={selectedCenterState}
                                    onValueChange={(val) => {
                                        setSelectedCenterState(val);
                                        setFormData({ ...formData, centerId: '' });
                                        // Use API filtering + frontend fallback filtering for maximum reliability
                                        centersApi.listActive({ eventId: event.id, state: val, limit: 1000 }).then(res => {
                                            const all = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
                                            const filtered = all.filter((c: any) => c.stateId === val || c.state?.id === val);
                                            setCenters(filtered);
                                        });
                                    }}
                                >
                                    <SelectTrigger className="bg-white h-9">
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {states.map(state => (
                                            <SelectItem key={state.id} value={state.id}>
                                                {state.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Center" required error={errors.centerId}>
                                <Select
                                    value={formData.centerId}
                                    onValueChange={(val) => setFormData({ ...formData, centerId: val })}
                                    disabled={!selectedCenterState}
                                >
                                    <SelectTrigger className="bg-white h-9">
                                        <SelectValue placeholder={selectedCenterState ? "Select Center" : "Select State First"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {centers.map(center => (
                                            <SelectItem key={center.id} value={center.id} className="max-w-[calc(100vw-4rem)] md:max-w-md">
                                                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2 text-left">
                                                    <span className="font-medium truncate">{center.centerName}</span>
                                                    <span className="text-gray-500 text-xs md:text-xs truncate max-w-[200px] md:max-w-[300px]">
                                                        {center.address}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        {centers.length === 0 && selectedCenterState && (
                                            <div className="p-2 text-sm text-gray-500">No centers found in this state</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </>
                    )}
                </div>
            </div>

            {/* 3. Groups & Tracks */}
            <div className="space-y-4 pt-2 mt-4 border-t border-gray-100">
                <div className="col-span-12 border-b border-gray-100 my-2 pb-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase ml-1">Groups & Seminars</h3>
                </div>

                <div className="space-y-3">
                    {hasBibleStudy && (
                        <div className="bg-green-50 text-green-800 p-3 rounded text-sm border border-green-200 mb-2">
                            <strong>Bible Study:</strong> You will be automatically assigned to a Bible Study group.
                        </div>
                    )}

                    <FormField label="Workshop">
                        <Select
                            value={formData.workshopId}
                            onValueChange={(val) => setFormData({ ...formData, workshopId: val })}
                        >
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Select Workshop (Optional)" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="none" className="text-gray-500 italic">No Workshop</SelectItem>
                                {workshops.map(group => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Seminar">
                        <Select
                            value={formData.seminarId}
                            onValueChange={(val) => setFormData({ ...formData, seminarId: val })}
                        >
                            <SelectTrigger className="bg-white h-9">
                                <SelectValue placeholder="Select Seminar (Optional)" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="none" className="text-gray-500 italic">No Seminar</SelectItem>
                                {seminars.map(group => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
            </div>

            {errors.submit && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="font-bold ml-2 text-base">{errors.submit}</AlertDescription>
                </Alert>
            )}

            <div className="pt-4 flex justify-end">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-10 font-bold uppercase text-sm tracking-wider"
                >
                    {submitting ? 'Processing...' : 'Complete Registration'}
                </Button>
            </div>
        </form>
    );
}
