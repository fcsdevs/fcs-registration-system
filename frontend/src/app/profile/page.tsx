"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAuth } from "@/context/auth-context";
import {
    User, Mail, Phone, Calendar, MapPin, UserCircle, X, Save, Loader2, Camera,
    Briefcase, GraduationCap, Building, Shield, Heart, Info, Landmark, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { membersApi } from "@/lib/api/members";

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
    });

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
            });
            setImageFile(null);
            setImagePreview(user.profilePhotoUrl || null);
            setIsEditing(true);
        }
    };

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
            // Refresh page to get new data
            window.location.reload();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
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
                            <img
                                src="/fcs_logo.png"
                                alt="FCS"
                                className="h-56 w-auto opacity-40 grayscale sepia hue-rotate-190 saturate-200 brightness-110 contrast-125"
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
                                    <p className="text-gray-500 font-medium mb-6 mt-1">{user.email}</p>

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
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Structure</span>
                                        <span className="font-medium text-gray-900">{user.unitName || user.unitId || "Not assigned"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-gray-500">Role</span>
                                        <span className="font-medium text-gray-900 capitalize">{(user.roles || []).join(", ")}</span>
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
                                    <ProfileField label="Age Bracket" value={user.ageBracket} />
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
                                        <ProfileField label="Occupation" value={user.occupation} />
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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden transform scale-100 transition-transform">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 sticky top-0 z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Edit Complete Profile</h3>
                                    <p className="text-sm text-gray-500">Update your personal, academic, and church information</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-10">
                                {/* Photo Upload Section */}
                                <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-100 group/upload">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                    <User className="w-12 h-12" />
                                                </div>
                                            )}
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
                                        <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-2.5 bg-[#010030] text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                            <Camera className="w-4 h-4" />
                                        </label>
                                    </div>
                                    <p className="mt-4 text-sm font-semibold text-[#010030]">Click button to change profile photo</p>
                                    <p className="text-xs text-gray-500 mt-1">Recommended: Square image, max 2MB</p>
                                </div>

                                {/* Section 1: Basic Identity */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-blue-800 pb-2 border-b border-blue-100">
                                        <UserCircle className="w-5 h-5" />
                                        <h4 className="font-bold uppercase text-sm tracking-wider">Basic Identity</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Field label="First Name" value={formData.firstName} onChange={(v) => setFormData({ ...formData, firstName: v })} required />
                                        <Field label="Other Names" value={formData.otherNames} onChange={(v) => setFormData({ ...formData, otherNames: v })} />
                                        <Field label="Last Name" value={formData.lastName} onChange={(v) => setFormData({ ...formData, lastName: v })} required />
                                        <Field label="Preferred Name" value={formData.preferredName} onChange={(v) => setFormData({ ...formData, preferredName: v })} placeholder="Nick name" />
                                        <SelectField label="Gender" value={formData.gender} onChange={(v) => setFormData({ ...formData, gender: v })} options={[{ l: 'Male', v: 'MALE' }, { l: 'Female', v: 'FEMALE' }]} />
                                        <SelectField label="Marital Status" value={formData.maritalStatus} onChange={(v) => setFormData({ ...formData, maritalStatus: v })} options={[{ l: 'Single', v: 'SINGLE' }, { l: 'Married', v: 'MARRIED' }, { l: 'Divorced', v: 'DIVORCED' }, { l: 'Widowed', v: 'WIDOWED' }]} />
                                        <Field label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} />
                                        <SelectField label="Age Bracket" value={formData.ageBracket} onChange={(v) => setFormData({ ...formData, ageBracket: v })} options={[{ l: '0-12', v: '0-12' }, { l: '13-17', v: '13-17' }, { l: '18-24', v: '18-24' }, { l: '25-34', v: '25-34' }, { l: '35-44', v: '35-44' }, { l: '45+', v: '45+' }]} />
                                    </div>
                                </div>

                                {/* Section 2: Contact Methods */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-green-800 pb-2 border-b border-green-100">
                                        <Phone className="w-5 h-5" />
                                        <h4 className="font-bold uppercase text-sm tracking-wider">Contact Details</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Primary Phone" value={formData.phoneNumber} onChange={(v) => setFormData({ ...formData, phoneNumber: v })} required />
                                        <Field label="WhatsApp Number" value={formData.whatsappNumber} onChange={(v) => setFormData({ ...formData, whatsappNumber: v })} />
                                        <SelectField label="Preferred Contact Method" value={formData.preferredContactMethod} onChange={(v) => setFormData({ ...formData, preferredContactMethod: v })} options={[{ l: 'SMS', v: 'SMS' }, { l: 'WhatsApp', v: 'WHATSAPP' }, { l: 'Email', v: 'EMAIL' }]} />
                                    </div>
                                </div>

                                {/* Section 3: Academic & Professional */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-purple-800 pb-2 border-b border-purple-100">
                                        <GraduationCap className="w-5 h-5" />
                                        <h4 className="font-bold uppercase text-sm tracking-wider">Academic & Professional</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Occupation" value={formData.occupation} onChange={(v) => setFormData({ ...formData, occupation: v })} />
                                        <Field label="Place of Work" value={formData.placeOfWork} onChange={(v) => setFormData({ ...formData, placeOfWork: v })} />
                                        <Field label="Institution" value={formData.institutionName} onChange={(v) => setFormData({ ...formData, institutionName: v })} />
                                        <SelectField label="Category" value={formData.institutionType} onChange={(v) => setFormData({ ...formData, institutionType: v })} options={[{ l: 'Primary', v: 'PRIMARY' }, { l: 'Secondary', v: 'SECONDARY' }, { l: 'Tertiary', v: 'TERTIARY' }]} />
                                        <Field label="Level / Class" value={formData.level} onChange={(v) => setFormData({ ...formData, level: v })} />
                                        <Field label="Course / Major" value={formData.course} onChange={(v) => setFormData({ ...formData, course: v })} />
                                        <Field label="Graduation Year" type="number" value={formData.graduationYear} onChange={(v) => setFormData({ ...formData, graduationYear: v })} />
                                    </div>
                                </div>

                                {/* Section 4: FCS Context */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-orange-800 pb-2 border-b border-orange-100">
                                        <Landmark className="w-5 h-5" />
                                        <h4 className="font-bold uppercase text-sm tracking-wider">FCS & Church</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="FCS Branch" value={formData.branch} onChange={(v) => setFormData({ ...formData, branch: v })} />
                                        <Field label="Zone / Area" value={formData.zone} onChange={(v) => setFormData({ ...formData, zone: v })} />
                                        <Field label="State / Chapter" value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} />
                                        <Field label="Year Joined" type="number" value={formData.yearJoined} onChange={(v) => setFormData({ ...formData, yearJoined: v })} />
                                        <SelectField label="Membership Category" value={formData.membershipCategory} onChange={(v) => setFormData({ ...formData, membershipCategory: v })} options={[{ l: 'Primary', v: 'PRIMARY' }, { l: 'Secondary', v: 'SECONDARY' }, { l: 'Tertiary', v: 'TERTIARY' }, { l: 'Associate', v: 'ASSOCIATE' }]} />
                                    </div>
                                </div>

                                {/* Section 5: Emergency */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-red-800 pb-2 border-b border-red-100">
                                        <Shield className="w-5 h-5" />
                                        <h4 className="font-bold uppercase text-sm tracking-wider">Emergency Contact</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Emergency Contact Name" value={formData.emergencyContactName} onChange={(v) => setFormData({ ...formData, emergencyContactName: v })} />
                                        <Field label="Emergency Contact Phone" value={formData.emergencyContactPhone} onChange={(v) => setFormData({ ...formData, emergencyContactPhone: v })} />
                                    </div>
                                </div>
                            </form>

                            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-gray-200">Discard Changes</Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-[#010030] hover:bg-[#010030]/90 text-white shadow-xl shadow-blue-900/20 px-8 h-12 rounded-xl flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Save Profile Updates
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

// Helper Components for the Profile Page
function ProfileField({ label, value, capitalize = false, icon = null }: { label: string, value: any, capitalize?: boolean, icon?: React.ReactNode }) {
    return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-100 transition-all group/field">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</span>
            <div className="flex items-center gap-2">
                {icon && <div className="text-blue-500 opacity-60 group-hover/field:opacity-100 transition-opacity">{icon}</div>}
                <p className={`text-base font-semibold text-gray-800 ${capitalize ? 'capitalize' : ''}`}>
                    {value || <span className="text-gray-300 font-normal italic">Not provided</span>}
                </p>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string, value: any, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <Input
                type={type}
                className="h-11 bg-white border-gray-200 focus:border-[#010030] focus:ring-[#010030]/10 transition-all rounded-xl shadow-sm"
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
                <select
                    className="w-full flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus:border-[#010030] focus:ring-4 focus:ring-[#010030]/5 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none shadow-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                >
                    <option value="">Select {label}</option>
                    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
            </div>
        </div>
    );
}
