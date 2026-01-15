"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Lock, Bell, User, Save, Shield, CheckCircle2, UserCog, Mail, Phone, Smartphone, AlertTriangle } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { membersApi } from "@/lib/api/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
            <p className="text-gray-500 mt-2">Manage your profile, security preferences, and notification settings.</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-white p-1 rounded-xl border shadow-sm">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium">
                <User className="w-4 h-4 mr-2" /> Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium">
                <Shield className="w-4 h-4 mr-2" /> Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium">
                <Bell className="w-4 h-4 mr-2" /> Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProfileSettings user={user} onUpdate={setUser} />
            </TabsContent>

            <TabsContent value="security" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <NotificationSettings user={user} onUpdate={setUser} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ProfileSettings({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      toast.error("First and last name are required");
      return;
    }

    try {
      setSaving(true);
      await membersApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        preferredContactMethod: user?.preferredContactMethod || "EMAIL",
      });
      // Optimistically update local state
      onUpdate({ ...user, ...formData });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and contact information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-gray-50/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-500" /> Email Address
              </label>
              <Input
                value={formData.email}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400">Email cannot be changed directly due to security policies.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-500" /> Phone Number
              </label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="bg-gray-50/50"
                placeholder="+234..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);

  const passwordStrength = passwords.new.length > 0 ? (
    passwords.new.length < 8 ? "Weak" :
      passwords.new.match(/[A-Z]/) && passwords.new.match(/[0-9]/) ? "Strong" : "Medium"
  ) : null;

  const strengthColor = {
    "Weak": "text-red-500",
    "Medium": "text-yellow-600",
    "Strong": "text-green-600"
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSaving(true);
      await authApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm
      });
      toast.success("Password changed successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password. check current password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Password & Authentication</CardTitle>
        <CardDescription>Ensure your account is secure with a strong password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="pl-9 bg-gray-50/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  New Password
                  {passwordStrength && (
                    <span className={`text-xs font-bold ${strengthColor[passwordStrength as keyof typeof strengthColor]}`}>
                      {passwordStrength}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="pl-9 bg-gray-50/50"
                    placeholder="Min. 8 characters"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="pl-9 bg-gray-50/50"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={saving || !passwords.current || !passwords.new}
              className="bg-gray-900 hover:bg-black text-white w-full sm:w-auto"
            >
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationSettings({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [method, setMethod] = useState<"EMAIL" | "SMS" | "WHATSAPP">(user?.preferredContactMethod || "EMAIL");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await membersApi.updateProfile({
        preferredContactMethod: method,
      });
      onUpdate({ ...user, preferredContactMethod: method });
      toast.success("Notification preferences updated");
    } catch (error: any) {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const methods = [
    {
      id: "EMAIL",
      title: "Email Notifications",
      description: "Receive badges, updates, and receipts via email.",
      icon: Mail,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "SMS",
      title: "SMS Alerts",
      description: "Get urgent updates and reminders as text messages.",
      icon: Smartphone,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "WHATSAPP",
      title: "WhatsApp",
      description: "Receive updates through our official WhatsApp channel.",
      icon: Phone,
      color: "bg-green-100 text-green-600" // WhatsApp green-ish
    }
  ];

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Contact Preferences</CardTitle>
        <CardDescription>How should we contact you regarding your registrations?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {methods.map((m) => (
            <div
              key={m.id}
              onClick={() => setMethod(m.id as any)}
              className={`relative flex items-center space-x-4 rounded-xl border p-4 cursor-pointer transition-all ${method === m.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className={`p-3 rounded-full ${m.id === "WHATSAPP" ? "bg-[#25D366]/20 text-[#25D366]" : m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{m.title}</h4>
                <p className="text-xs text-gray-500">{m.description}</p>
              </div>
              {method === m.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
