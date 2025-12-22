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
            <div className="min-h-screen bg-gray-50">

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-1">Manage your personal information</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header / Cover */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-[#010030]"></div>

                        <div className="px-6 pb-6">
                            <div className="relative flex items-end -mt-12 mb-6">
                                <div className={`w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md ${user?.gender === 'FEMALE' ? 'bg-pink-600' :
                                    user?.gender === 'MALE' ? 'bg-blue-600' : 'bg-[#010030]'
                                    }`}>
                                    {user.firstName?.[0] || "U"}
                                </div>
                                <div className="ml-4 translate-y-3">
                                    <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                                    <p className="text-gray-500">{user.email}</p>
                                </div>
                                <div className="ml-auto mb-1">
                                    <Button variant="outline" onClick={handleEditClick}>Edit Profile</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Personal Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <UserCircle className="w-5 h-5 text-gray-500" />
                                        Personal Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">Full Name</span>
                                            <span className="font-medium">{user.firstName} {user.lastName}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-500">Gender</span>
                                            <span className="font-medium capitalize">{user.gender || "Not specified"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                        Contact Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <span className="block text-sm text-gray-500">Email</span>
                                                <span className="font-medium">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <span className="block text-sm text-gray-500">Phone Number</span>
                                                <span className="font-medium">{user.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Details</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="block text-xs text-gray-500 uppercase">Member Code</span>
                                        <span className="font-mono font-medium text-blue-600">{user.memberCode || "N/A"}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="block text-xs text-gray-500 uppercase">Unit/Branch</span>
                                        <span className="font-medium">{user.unitId || "Not assigned"}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="block text-xs text-gray-500 uppercase">Role</span>
                                        <span className="font-medium capitalize">{(user.roles || []).join(", ")}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="block text-xs text-gray-500 uppercase">Joined</span>
                                        <span className="font-medium">{joinedDateString}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">First Name</label>
                                        <Input
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                                        <Input
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Input
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
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
