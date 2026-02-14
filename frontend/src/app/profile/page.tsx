"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAuth } from "@/context/auth-context";
import {
    User, Mail, Phone, Calendar, MapPin, UserCircle, X, Save, Loader2, Camera,
    Briefcase, GraduationCap, Building, Shield, Heart, Info, Landmark, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { membersApi } from "@/lib/api/members";
import Image from "next/image";
import { getAgeBracket } from "@/lib/utils";
import { useModal } from "@/components/common/modal-provider";

export default function ProfilePage() {
    const { user, login } = useAuth(); // login is needed to refresh user data? No, login expects credentials. 
    // We might need a way to refresh user data without re-login. 
    // Ideally AuthContext exposes refreshUser(). If not, we might need to manually update local state or reload.
    // user object is immutable from context usually.
    // For now, reload window on success is easiest.

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        otherNames: "",
        preferredName: "",
        gender: "",
        phoneNumber: "",
        whatsappNumber: "",
        maritalStatus: "",
        dateOfBirth: "",
        occupation: "",
        placeOfWork: "",
        institutionName: "",
        institutionType: "" as any,
        level: "",
        course: "",
        graduationYear: "",
        yearJoined: "",
        membershipCategory: "" as any,
        state: "",
        zone: "",
        branch: "",
        preferredContactMethod: "" as any,
        emergencyContactName: "",
        emergencyContactPhone: "",
        ageBracket: "",
        department: "",
        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",
        guardianRelationship: "" as any,
    });

    // Auto-calculate age bracket and derived minor status
    useEffect(() => {
        if (formData.dateOfBirth) {
            const bracket = getAgeBracket(formData.dateOfBirth);
            if (formData.ageBracket !== bracket) {
                setFormData(prev => ({ ...prev, ageBracket: bracket }));
            }
        }
    }, [formData.dateOfBirth]);

    const isMinor = ["0-12", "13-17"].includes(formData.ageBracket);
    const isTertiary = formData.membershipCategory === "TERTIARY";
    const isStaff = formData.membershipCategory === "STAFF";

    const handleEditClick = () => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                otherNames: user.otherNames || "",
                preferredName: user.preferredName || "",
                gender: user.gender || "",
                phoneNumber: user.phone || "",
                whatsappNumber: user.whatsappNumber || "",
                maritalStatus: user.maritalStatus || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                occupation: user.occupation || "",
                placeOfWork: user.placeOfWork || "",
                institutionName: user.institutionName || "",
                institutionType: user.institutionType || "",
                level: user.level || "",
                course: user.course || "",
                graduationYear: user.graduationYear?.toString() || "",
                yearJoined: user.yearJoined?.toString() || "",
                membershipCategory: user.membershipCategory || "",
                state: user.state || "",
                zone: user.zone || "",
                branch: user.branch || "",
                preferredContactMethod: user.preferredContactMethod || "",
                emergencyContactName: user.emergencyContactName || "",
                emergencyContactPhone: user.emergencyContactPhone || "",
                ageBracket: user.ageBracket || "",
                department: user.department || "",
                guardianName: user.guardianName || "",
                guardianPhone: user.guardianPhone || "",
                guardianEmail: user.guardianEmail || "",
                guardianRelationship: user.guardianRelationship || "",
            });
            setImageFile(null);
            setImagePreview(user.profilePhotoUrl || null);
            setIsEditing(true);
        }
    };

    const { alert: modalAlert } = useModal();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) payload.append(key, value);
            });

            if (imageFile) {
                payload.append("image", imageFile);
            }

            await membersApi.updateProfile(payload);

            await modalAlert("Your profile has been updated successfully!", "Update Successful", "success");

            // Refresh page to get new data
            window.location.reload();
        } catch (error) {
            console.error("Failed to update profile", error);
            modalAlert("Failed to update profile. Please check your network and try again.", "Update Failed", "danger");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }



    const joinedDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const joinedDateString = !isNaN(joinedDate.getTime()) ? joinedDate.toLocaleDateString() : "N/A";

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50/50">
                {/* Hero / Banner Section */}
                <div className="h-64 relative overflow-hidden group">
                    <div className="absolute inset-0">
                        <img
                            src="/profile-header.png"
                            alt="Profile Header"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#010030]/30 to-[#010030]/60 mix-blend-multiply"></div>
                        {/* FCS Logo Watermark */}
                        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <Image
                                src="/fcs_logo.png"
                                alt="FCS"
                                width={512}
                                height={512}
                                quality={100}
                                priority
                                className="h-56 w-auto opacity-40 grayscale sepia hue-rotate-190 saturate-200 brightness-110 contrast-125 object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar: Profile Summary */}
                        <div className="w-full lg:w-1/3 flex-shrink-0">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="relative group/photo">
                                        <div className={`w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white mb-4 overflow-hidden ${user?.gender === 'FEMALE' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                                            user?.gender === 'MALE' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                                'bg-gradient-to-br from-gray-600 to-gray-800'
                                            }`}>
                                            {user.profilePhotoUrl ? (
                                                <img src={user.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                user.firstName?.[0] || "U"
                                            )}
                                        </div>
                                        <button
                                            onClick={handleEditClick}
                                            className="absolute bottom-4 right-0 p-2 bg-white rounded-full shadow-md text-[#010030] hover:bg-gray-50 transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-6 right-8 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    {user.preferredName && <p className="text-sm text-gray-500 italic mt-0.5">"{user.preferredName}"</p>}
                                    <p className="text-gray-500 font-medium mb-6 mt-1 truncate w-full px-4 text-center" title={user.email}>{user.email}</p>

                                    <div className="w-full flex gap-3 justify-center">
                                        <Button
                                            onClick={handleEditClick}
                                            className="bg-[#010030] text-white hover:bg-[#010030]/90 shadow-lg shadow-blue-900/20 w-full"
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 border-t border-gray-100">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Joined</p>
                                            <p className="font-medium text-gray-900">{joinedDateString}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Membership Card (Sidebar) */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 mt-6 p-6">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                    Membership
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Member Code</span>
                                        <span className="font-mono font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">{user.memberCode || "N/A"}</span>
                                    </div>
                                    <div className="py-2 border-b border-gray-50">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Structure</span>
                                        <span className="font-medium text-gray-900 block truncate" title={user.unitName || user.unitId || "Not assigned"}>
                                            {user.unitName || user.unitId || "Not assigned"}
                                        </span>
                                    </div>
                                    <div className="py-2">
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Role</span>
                                        <span className="font-medium text-gray-900 block truncate capitalize" title={(user.roles || []).join(", ")}>
                                            {(user.roles || []).join(", ")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            {/* Personal Information */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <UserCircle className="w-5 h-5 text-blue-600" />
                                        Personal Profile
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ProfileField label="Full Name" value={`${user.firstName} ${user.otherNames || ""} ${user.lastName}`} />
                                    <ProfileField label="Preferred Name" value={user.preferredName} />
                                    <ProfileField label="Gender" value={user.gender} capitalize />
                                    <ProfileField label="Marital Status" value={user.maritalStatus} capitalize />
                                    <ProfileField label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null} />
                                    <ProfileField label="Age Bracket" value={user.ageBracket || getAgeBracket(user.dateOfBirth || "")} />
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-green-600" />
                                        Contact Information
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ProfileField icon={<Mail className="w-4 h-4" />} label="Email Address" value={user.email} />
                                    <ProfileField icon={<Phone className="w-4 h-4" />} label="Phone Number" value={user.phone} />
                                    <ProfileField icon={<Phone className="w-4 h-4" />} label="WhatsApp Number" value={user.whatsappNumber} />
                                    <ProfileField icon={<Info className="w-4 h-4" />} label="Preferred Contact" value={user.preferredContactMethod} />
                                </div>
                            </div>

                            {/* Academic & Professional */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-purple-600" />
                                        Academic & Professional
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 lg:col-span-1">
                                        <ProfileField label={user.membershipCategory === 'STAFF' ? "Office / Position" : "Occupation"} value={user.occupation} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <ProfileField label="Place of Work" value={user.placeOfWork} />
                                    </div>
                                    <ProfileField label="Institution" value={user.institutionName} />
                                    <ProfileField label="Category" value={user.institutionType} capitalize />
                                    <ProfileField label="Level / Class" value={user.level} />
                                    <ProfileField label="Course" value={user.course} />
                                    <ProfileField label="Graduation Year" value={user.graduationYear} />
                                </div>
                            </div>

                            {/* FCS Context */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-orange-600" />
                                        Church & FCS Information
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ProfileField label="Structure (Branch)" value={user.unitName || user.branch} />
                                    <ProfileField label="Zone / Area" value={user.zone} />
                                    <ProfileField label="State / Chapter" value={user.state} />
                                    <ProfileField label="Year Joined" value={user.yearJoined} />
                                    <ProfileField label="Membership Type" value={user.membershipCategory} capitalize />
                                </div>
                            </div>

                            {/* Emergency & Guardians */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-red-600" />
                                        Security & Next of Kin
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ProfileField label="Emergency Contact" value={user.emergencyContactName} />
                                        <ProfileField label="Emergency Phone" value={user.emergencyContactPhone} />
                                    </div>
                                    {user.guardianName && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-sm font-semibold text-gray-400 uppercase mb-4">Guardian Details (Minors)</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                <ProfileField label="Guardian Name" value={user.guardianName} />
                                                <ProfileField label="Relationship" value={user.guardianRelationship} />
                                                <ProfileField label="Guardian Phone" value={user.guardianPhone} />
                                                <ProfileField label="Guardian Email" value={user.guardianEmail} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden ring-1 ring-white/20">
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-20">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h2>
                                    <p className="text-slate-500 text-sm mt-1">Make changes to your personal and professional details</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto bg-slate-50/50">
                                <div className="p-8 max-w-4xl mx-auto space-y-12">
                                    {/* Photo Upload - Centered & Premium */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100 transition-transform group-hover:scale-[1.02]">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600`}>
                                                        {user.firstName?.[0] || <User className="w-12 h-12" />}
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-xs font-medium">Change</p>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                id="photo-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setImageFile(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setImagePreview(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="photo-upload"
                                                className="absolute bottom-1 right-1 p-2.5 bg-slate-900 text-white rounded-full shadow-lg hover:bg-black transition-colors ring-4 ring-white cursor-pointer"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </label>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-500">Allowed *.jpeg, *.jpg, *.png, *.gif</p>
                                    </div>

                                    {/* Section 1: Personal Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                                                <UserCircle className="w-5 h-5" />
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <Field label="First Name" value={formData.firstName} onChange={(v) => setFormData({ ...formData, firstName: v })} required />
                                            <Field label="Last Name" value={formData.lastName} onChange={(v) => setFormData({ ...formData, lastName: v })} required />
                                            <Field label="Other Names" value={formData.otherNames} onChange={(v) => setFormData({ ...formData, otherNames: v })} />
                                            <Field label="Preferred Name" value={formData.preferredName} onChange={(v) => setFormData({ ...formData, preferredName: v })} placeholder="e.g. 'Danny'" />
                                            <SelectField label="Gender" value={formData.gender} onChange={(v) => setFormData({ ...formData, gender: v })} options={[{ l: 'Male', v: 'MALE' }, { l: 'Female', v: 'FEMALE' }]} />
                                            <SelectField label="Marital Status" value={formData.maritalStatus} onChange={(v) => setFormData({ ...formData, maritalStatus: v })} options={[{ l: 'Single', v: 'SINGLE' }, { l: 'Married', v: 'MARRIED' }, { l: 'Divorced', v: 'DIVORCED' }, { l: 'Widowed', v: 'WIDOWED' }]} />
                                            <Field label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} />
                                            <SelectField label="Age Bracket" value={formData.ageBracket} onChange={(v) => setFormData({ ...formData, ageBracket: v })} options={[{ l: '0-12', v: '0-12' }, { l: '13-17', v: '13-17' }, { l: '18-24', v: '18-24' }, { l: '25-34', v: '25-34' }, { l: '35-44', v: '35-44' }, { l: '45+', v: '45+' }]} />
                                        </div>
                                    </div>

                                    {/* Section 2: Contact Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600">
                                                <Phone className="w-5 h-5" />
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800">Contact Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <Field label="Phone Number" value={formData.phoneNumber} onChange={(v) => setFormData({ ...formData, phoneNumber: v })} required />
                                            <Field label="WhatsApp Number" value={formData.whatsappNumber} onChange={(v) => setFormData({ ...formData, whatsappNumber: v })} />
                                            <SelectField label="Preferred Contact" value={formData.preferredContactMethod} onChange={(v) => setFormData({ ...formData, preferredContactMethod: v })} options={[{ l: 'SMS', v: 'SMS' }, { l: 'WhatsApp', v: 'WHATSAPP' }, { l: 'Email', v: 'EMAIL' }]} />
                                        </div>
                                    </div>

                                    {/* Section 3: Professional Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 text-violet-600">
                                                <GraduationCap className="w-5 h-5" />
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800">Professional & Academic</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <Field label={isStaff ? "Office / Position" : "Occupation"} value={formData.occupation} onChange={(v) => setFormData({ ...formData, occupation: v })} />
                                            {isStaff && (
                                                <Field label="Department / Unit" value={formData.department} onChange={(v) => setFormData({ ...formData, department: v })} required />
                                            )}
                                            <div className="md:col-span-2">
                                                <Field label="Place of Work / School" value={formData.placeOfWork} onChange={(v) => setFormData({ ...formData, placeOfWork: v })} />
                                            </div>
                                            <Field label="Institution Name" value={formData.institutionName} onChange={(v) => setFormData({ ...formData, institutionName: v })} />

                                            <SelectField
                                                label="Institution Type"
                                                value={formData.institutionType}
                                                onChange={(v) => setFormData({ ...formData, institutionType: v })}
                                                options={[
                                                    { l: 'Primary', v: 'PRIMARY' },
                                                    { l: 'Secondary', v: 'SECONDARY' },
                                                    { l: 'Tertiary (General)', v: 'TERTIARY' },
                                                    { l: 'University', v: 'UNIVERSITY' },
                                                    { l: 'Polytechnic', v: 'POLYTECHNIC' },
                                                    { l: 'College of Education', v: 'COLLEGE_OF_EDUCATION' },
                                                    { l: 'Other', v: 'OTHER' }
                                                ]}
                                            />

                                            {isTertiary ? (
                                                <SelectField
                                                    label="Level / Year"
                                                    value={formData.level}
                                                    onChange={(v) => setFormData({ ...formData, level: v })}
                                                    options={[
                                                        { l: '100 / Year 1', v: '100' },
                                                        { l: '200 / Year 2', v: '200' },
                                                        { l: '300 / Year 3', v: '300' },
                                                        { l: '400 / Year 4', v: '400' },
                                                        { l: '500 / Year 5', v: '500' },
                                                        { l: '600+ / Year 6+', v: '600' },
                                                        { l: 'Other', v: 'OTHER' }
                                                    ]}
                                                />
                                            ) : (
                                                <Field label="Level / Class" value={formData.level} onChange={(v) => setFormData({ ...formData, level: v })} />
                                            )}

                                            <Field label="Course of Study" value={formData.course} onChange={(v) => setFormData({ ...formData, course: v })} />
                                            <SelectField
                                                label="Graduation Year"
                                                value={formData.graduationYear}
                                                onChange={(v) => setFormData({ ...formData, graduationYear: v })}
                                                options={[...Array(21)].map((_, i) => {
                                                    const year = new Date().getFullYear() - 10 + i;
                                                    return { l: year.toString(), v: year.toString() };
                                                })}
                                            />
                                        </div>
                                    </div>

                                    {/* Section 4: FCS Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600">
                                                <Landmark className="w-5 h-5" />
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800">FCS Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <Field label="Branch" value={formData.branch} onChange={(v) => setFormData({ ...formData, branch: v })} />
                                            <Field label="Zone" value={formData.zone} onChange={(v) => setFormData({ ...formData, zone: v })} />
                                            <Field label="State / Chapter" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} />
                                            <SelectField label="Membership Category" value={formData.membershipCategory} onChange={(v) => setFormData({ ...formData, membershipCategory: v })} options={[{ l: 'Primary', v: 'PRIMARY' }, { l: 'Secondary', v: 'SECONDARY' }, { l: 'Tertiary', v: 'TERTIARY' }, { l: 'Associate', v: 'ASSOCIATE' }, { l: 'Staff', v: 'STAFF' }]} />
                                            <Field label="Year Joined" type="number" value={formData.yearJoined} onChange={(v) => setFormData({ ...formData, yearJoined: v })} />
                                        </div>
                                    </div>

                                    {/* Section 5: Emergency Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 text-rose-600">
                                                <Shield className="w-5 h-5" />
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800">Emergency & Guardian</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Field label="Emergency Contact Name" value={formData.emergencyContactName} onChange={(v) => setFormData({ ...formData, emergencyContactName: v })} />
                                            <Field label="Emergency Contact Phone" value={formData.emergencyContactPhone} onChange={(v) => setFormData({ ...formData, emergencyContactPhone: v })} />
                                        </div>
                                        {/* Guardian Fields for Minors */}
                                        {isMinor && (
                                            <div className="pt-4 border-t border-slate-100 mt-4">
                                                <p className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-4">Guardian Information (Required for Minors)</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Field label="Guardian Name" value={formData.guardianName} onChange={(v) => setFormData({ ...formData, guardianName: v })} required />
                                                    <Field label="Guardian Phone" value={formData.guardianPhone} onChange={(v) => setFormData({ ...formData, guardianPhone: v })} required />
                                                    <Field label="Guardian Email" value={formData.guardianEmail} onChange={(v) => setFormData({ ...formData, guardianEmail: v })} />
                                                    <SelectField
                                                        label="Relationship"
                                                        value={formData.guardianRelationship}
                                                        onChange={(v) => setFormData({ ...formData, guardianRelationship: v })}
                                                        options={[
                                                            { l: 'Father', v: 'FATHER' },
                                                            { l: 'Mother', v: 'MOTHER' },
                                                            { l: 'Guardian', v: 'GUARDIAN' },
                                                            { l: 'Other', v: 'OTHER' }
                                                        ]}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>

                            {/* Modal Footer */}
                            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 z-20">
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-600 hover:bg-slate-50 hover:text-slate-900">Cancel</Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2 font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

// --------------------
// UI COMPONENTS
// --------------------

function ProfileField({ label, value, capitalize = false, icon = null }: { label: string, value: any, capitalize?: boolean, icon?: React.ReactNode }) {
    return (
        <div className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-1.5 rounded-md bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {icon || <Info className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className={`text-sm font-medium text-slate-900 pl-11 truncate ${capitalize ? 'capitalize' : ''}`} title={value}>
                {value || <span className="text-slate-300 italic">Not set</span>}
            </p>
        </div>
    );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string, value: any, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 block">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <Input
                type={type}
                className="h-11 rounded-lg border-slate-200 bg-white text-slate-900 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options, required = false }: { label: string, value: any, onChange: (v: string) => void, options: { l: string, v: string }[], required?: boolean }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 block">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
                <select
                    className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all cursor-pointer"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                >
                    <option value="">Select an option</option>
                    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
            </div>
        </div>
    );
}
