/**
 * Public Registration Dashboard
 * After registration, users land here with their unique access token
 * NO LOGIN REQUIRED - token-based access
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    Users,
    Edit2,
    Printer,
    UserPlus,
    CheckCircle,
    AlertCircle,
    Download,
    QrCode,
    ShieldCheck,
    ChevronRight,
    ArrowRight,
    Sparkles,
    Lock,
    Trophy,
    BadgeCheck,
    Scan
} from 'lucide-react';
import { QRCodeDisplay } from '@/components/ui/qr-code-display';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Registration {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    participationMode: string;
    qrCode?: string;
    sac?: string;
    event: {
        id: string;
        title: string;
        description: string;
        startDate: string;
        endDate: string;
        participationMode: string;
    };
    center?: {
        id: string;
        name: string;
        address: string;
    };
    group?: {
        id: string;
        name: string;
    };
}

export default function PublicRegistrationDashboard() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const registrationId = params.registrationId as string;
    const token = searchParams.get('token');

    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'badge' | 'profile'>('badge');
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [editData, setEditData] = useState({
        firstName: '',
        lastName: '',
    });

    useEffect(() => {
        if (!token) {
            return;
        }
        fetchRegistration();
    }, [registrationId, token]);

    const fetchRegistration = async () => {
        try {
            setLoading(true);
            const response = await api.get<{ data: Registration }>(
                `/registrations/public/${registrationId}?token=${token}`
            );
            setRegistration(response.data);
            setEditData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
            });
        } catch (error) {
            console.error('Failed to fetch registration:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            await api.put(`/registrations/public/${registrationId}?token=${token}`, {
                firstName: editData.firstName,
                lastName: editData.lastName,
            });

            if (registration) {
                setRegistration({
                    ...registration,
                    firstName: editData.firstName,
                    lastName: editData.lastName,
                });
            }

            setEditMode(false);
            setSuccessMessage('Credential Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            alert(error.message || 'Verification Error: System sync failed');
        } finally {
            setSaving(false);
        }
    };

    const handleRegisterOthers = () => {
        router.push(`/events/register/${registration?.event.id}/others?primaryToken=${token}`);
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-10 rounded-[40px] border-none shadow-2xl text-center">
                    <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-600">
                        <Lock className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0F172A] mb-2 uppercase tracking-tight">Access Restricted</h2>
                    <p className="text-slate-500 font-medium text-sm mb-8">Valid portal authentication token required. Reference your confirmation email.</p>
                    <Button asChild className="w-full h-14 rounded-2xl bg-[#060CCD] hover:bg-[#010030] font-bold">
                        <Link href="/">Back to Entry</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-spin mb-6">
                    <QrCode className="h-10 w-10 text-[#060CCD]" />
                </div>
                <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-widest">Compiling Dashboard</h2>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-10 rounded-[40px] border-none shadow-2xl text-center">
                    <div className="h-20 w-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0F172A] mb-2 uppercase tracking-tight">Dossier Missing</h2>
                    <p className="text-slate-500 font-medium text-sm mb-8">The requested registration profile could not be located in the secure registry.</p>
                </Card>
            </div>
        );
    }

    const qrCode = registration.qrCode || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' width='200' height='200'/%3E%3Cg fill='%23000000'%3E%3Crect x='20' y='20' width='20' height='20'/%3E%3Crect x='60' y='20' width='20' height='20'/%3E%3C/g%3E%3C/svg%3E`;
    const sac = registration.sac || registration.id.substring(0, 8).toUpperCase();

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Cinematic Background */}
            <div className="h-[450px] bg-gradient-to-br from-[#060CCD] via-[#010030] to-[#010030] absolute top-0 left-0 right-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-24">
                {/* Success Announcement */}
                <div className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-white/10 backdrop-blur-3xl border border-white/20 p-8 md:p-12 rounded-[48px] shadow-2xl">
                    <div className="h-24 w-24 bg-emerald-400 rounded-[32px] flex items-center justify-center shadow-[0_20px_40px_-5px_rgba(52,211,153,0.4)]">
                        <CheckCircle className="h-12 w-12 text-[#010030]" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <Badge className="mb-4 h-7 px-4 py-0 bg-emerald-500/20 text-emerald-400 border-none rounded-full font-black uppercase text-[10px] tracking-widest">
                            Registration Confirmed
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter leading-tight">
                            Identity Authorized
                        </h1>
                        <p className="text-white/70 font-bold uppercase tracking-widest text-[11px]">Session: {registration.event.title}</p>
                    </div>

                    {searchParams.get('fcsCode') && (
                        <div className="bg-[#010030]/80 rounded-3xl p-6 border border-white/10 shadow-inner min-w-[280px]">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Permanent FCS Anchor</p>
                            <div className="flex flex-col gap-2">
                                <code className="text-4xl font-black text-white bg-white/5 p-4 rounded-2xl block border border-white/10 text-center tracking-tighter">
                                    {searchParams.get('fcsCode')}
                                </code>
                                <p className="text-[10px] font-medium text-white/50 text-center italic mt-2 underline decoration-blue-500/50 underline-offset-4">Capture this credential for future access</p>
                            </div>
                        </div>
                    )}
                </div>

                {successMessage && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-[#060CCD] text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 font-bold uppercase text-xs tracking-widest">
                            <Sparkles size={18} /> {successMessage}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Primary Content Zone */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Tab Navigation */}
                        <div className="flex p-2 bg-slate-100 rounded-[28px] max-w-md">
                            <button
                                onClick={() => setActiveTab('badge')}
                                className={`flex-1 flex items-center justify-center gap-3 h-14 rounded-[22px] font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'badge' ? 'bg-white shadow-xl text-[#060CCD]' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Scan size={18} /> Digital Badge
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 flex items-center justify-center gap-3 h-14 rounded-[22px] font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white shadow-xl text-[#060CCD]' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <User size={18} /> Participant ID
                            </button>
                        </div>

                        {/* Content Area */}
                        <Card className="rounded-[48px] border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] bg-white overflow-hidden p-10 min-h-[500px]">
                            {activeTab === 'badge' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-12 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2 leading-none">Access Credential</h2>
                                            <p className="text-slate-500 font-medium text-sm">Dynamic identification for session entry</p>
                                        </div>
                                        <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                            <QrCode className="text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 flex flex-col items-center">
                                        <QRCodeDisplay
                                            qrCode={qrCode}
                                            sac={sac}
                                            eventName={registration.event.title}
                                            participantName={`${registration.firstName} ${registration.lastName}`}
                                            showDownload={true}
                                            showPrint={true}
                                        />
                                    </div>

                                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-[#060CCD]/5 border border-[#060CCD]/10 rounded-[32px] flex gap-4">
                                            <div className="h-10 w-10 bg-[#060CCD] text-white rounded-xl flex flex-shrink-0 items-center justify-center">
                                                <Trophy size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#060CCD] uppercase tracking-widest mb-1">Entry Protocol</p>
                                                <p className="text-xs font-bold text-[#0F172A] leading-relaxed">Present this encrypted identifier at the perimeter checkpoint for rapid validation.</p>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] flex gap-4">
                                            <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex flex-shrink-0 items-center justify-center">
                                                <BadgeCheck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Status: Active</p>
                                                <p className="text-xs font-bold text-[#0F172A] leading-relaxed">System scan verified. Identity link active across all registered centers.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="mb-12 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight mb-2 leading-none">Dossier Details</h2>
                                            <p className="text-slate-500 font-medium text-sm">Review anchored participant information</p>
                                        </div>
                                        {!editMode ? (
                                            <Button
                                                onClick={() => setEditMode(true)}
                                                className="h-12 px-6 rounded-2xl bg-[#060CCD]/10 text-[#060CCD] hover:bg-[#060CCD]/20 border-none font-bold shadow-none"
                                            >
                                                <Edit2 size={16} className="mr-2" /> Modify Profile
                                            </Button>
                                        ) : (
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setEditMode(false)}
                                                    className="h-12 rounded-2xl border-slate-200"
                                                >
                                                    Discard
                                                </Button>
                                                <Button
                                                    onClick={handleSaveProfile}
                                                    disabled={saving}
                                                    className="h-12 rounded-2xl bg-[#060CCD] text-white shadow-xl shadow-blue-100"
                                                >
                                                    {saving ? 'Syncing...' : 'Commit Changes'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">First Name Identity</label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={editData.firstName}
                                                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 font-bold focus:ring-2 focus:ring-[#060CCD] outline-none"
                                                    />
                                                ) : (
                                                    <div className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center font-bold text-[#0F172A]">
                                                        {registration.firstName}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name Identity</label>
                                                {editMode ? (
                                                    <input
                                                        type="text"
                                                        value={editData.lastName}
                                                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 font-bold focus:ring-2 focus:ring-[#060CCD] outline-none"
                                                    />
                                                ) : (
                                                    <div className="h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center font-bold text-[#0F172A]">
                                                        {registration.lastName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between px-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Mail Anchor</label>
                                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Locked Aspect</span>
                                            </div>
                                            <div className="h-14 px-6 rounded-2xl bg-slate-100/50 border border-slate-200 flex items-center font-bold text-[#64748B]">
                                                <Mail size={16} className="mr-3 text-slate-300" /> {registration.email}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between px-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voice ID Protocol</label>
                                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Locked Aspect</span>
                                            </div>
                                            <div className="h-14 px-6 rounded-2xl bg-slate-100/50 border border-slate-200 flex items-center font-bold text-[#64748B]">
                                                <Phone size={16} className="mr-3 text-slate-300" /> {registration.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Secondary Navigation (Sidebar) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Event Core Stats */}
                        <Card className="rounded-[40px] border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] bg-white p-8">
                            <h3 className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Session Context</h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#060CCD]">
                                        <Calendar size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Launch Date</p>
                                        <p className="text-sm font-black text-[#0F172A]">{new Date(registration.event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Participation</p>
                                        <Badge className={`mt-1 bg-slate-100 border-none font-black text-[9px] uppercase tracking-widest py-1 ${registration.participationMode === 'ONLINE' ? 'text-blue-600' : 'text-amber-600'
                                            }`}>
                                            {registration.participationMode} Protocol
                                        </Badge>
                                    </div>
                                </div>

                                {registration.center && (
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <MapPin size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precinct Location</p>
                                            <p className="text-sm font-black text-[#0F172A] leading-tight mb-1">{registration.center.name}</p>
                                            <p className="text-[10px] font-medium text-slate-500 italic">{registration.center.address}</p>
                                        </div>
                                    </div>
                                )}

                                {registration.group && (
                                    <div className="flex items-start gap-4 pt-4 border-t border-slate-50">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                                            <Users size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Affiliation Group</p>
                                            <p className="text-sm font-black text-[#0F172A]">{registration.group.name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Social Registration Action */}
                        <div className="bg-gradient-to-br from-[#060CCD] to-[#010030] rounded-[40px] p-8 shadow-[0_30px_60px_-15px_rgba(6,12,205,0.3)] relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <UserPlus size={160} className="text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-white mb-2 leading-none">Register Unit</h3>
                                <p className="text-white/60 text-xs font-bold leading-relaxed mb-8">Extend event authorization to additional members of your unit or household.</p>
                                <Button
                                    onClick={handleRegisterOthers}
                                    className="w-full h-14 rounded-2xl bg-white text-[#010030] hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest shadow-xl"
                                >
                                    Initiate Process <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>

                        {/* Security Reminder */}
                        <div className="p-8 bg-slate-100 rounded-[40px] border border-slate-200 shadow-inner">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck size={14} /> Critical Protocol
                            </h4>
                            <p className="text-xs font-bold text-[#475569] leading-relaxed">Ensure this URL is bookmarked or secured in your vault. This portal provides exclusive access to your digital credentials.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
