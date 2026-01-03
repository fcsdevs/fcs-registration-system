"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { useAuth } from "@/context/auth-context";
import { User, Mail, Phone, Calendar, MapPin, UserCircle, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming Input exists from import in other files? Checked dir list step 842. Yes.
import { membersApi } from "@/lib/api/members";

export default function ProfilePage() {
    const { user, login } = useAuth(); // login is needed to refresh user data? No, login expects credentials. 
    // We might need a way to refresh user data without re-login. 
    // Ideally AuthContext exposes refreshUser(). If not, we might need to manually update local state or reload.
    // user object is immutable from context usually.
    // For now, reload window on success is easiest.

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        phoneNumber: "",
    });

    const handleEditClick = () => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                gender: user.gender || "",
                phoneNumber: user.phone || "",
            });
            setIsEditing(true);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await membersApi.updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender as any,
                // phoneNumber is not updatable via this endpoint usually unless backend allows?
                // Backend Schema allows phoneNumber update.
                phoneNumber: formData.phoneNumber,
            });
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
                                    <div className={`relative w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-white mb-4 ${user?.gender === 'FEMALE' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                                        user?.gender === 'MALE' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                            'bg-gradient-to-br from-gray-600 to-gray-800'
                                        }`}>
                                        {user.firstName?.[0] || "U"}
                                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-gray-500 font-medium mb-6">{user.email}</p>

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
                                        Personal Information
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-100 transition-colors">
                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">First Name</span>
                                        <p className="text-lg font-semibold text-gray-900">{user.firstName}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-100 transition-colors">
                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last Name</span>
                                        <p className="text-lg font-semibold text-gray-900">{user.lastName}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-100 transition-colors">
                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Gender</span>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">{user.gender?.toLowerCase() || "Not specified"}</p>
                                    </div>
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
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-100 transition-colors flex items-start gap-4">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</span>
                                            <p className="text-base font-semibold text-gray-900 break-all">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-100 transition-colors flex items-start gap-4">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone Number</span>
                                            <p className="text-base font-semibold text-gray-900">{user.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal remains largely the same but with better backdrop */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-transform">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                                        <Input
                                            className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                                        <Input
                                            className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                                    <Input
                                        className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
                                    <div className="relative">
                                        <select
                                            className="w-full flex h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-gray-100">Cancel</Button>
                                    <Button type="submit" className="bg-[#010030] hover:bg-[#010030]/90 text-white shadow-lg shadow-blue-900/20" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
