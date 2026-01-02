"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Shield } from "lucide-react";
import Link from "next/link";

function InviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteId = searchParams.get('id');
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid' | 'accepted' | 'error'>('verifying');
    const [inviteDetails, setInviteDetails] = useState<any>(null);

    useEffect(() => {
        if (!inviteId || !token) {
            setStatus('invalid');
            return;
        }

        const verifyInvite = async () => {
            try {
                // Mock verification endpoint
                // In real app: GET /invites/verify?id=...&token=...
                // For demo, we'll simulate a valid invite
                await new Promise(r => setTimeout(r, 1000));

                setInviteDetails({
                    role: 'Admin',
                    unitName: 'Lagos State Chapter',
                    inviterName: 'National Admin'
                });
                setStatus('valid');
            } catch (err) {
                console.error("Verification failed", err);
                setStatus('invalid');
            }
        };

        verifyInvite();
    }, [inviteId, token]);

    const handleAccept = async () => {
        setStatus('verifying'); // Reuse loading state
        try {
            // Mock acceptance
            // POST /invites/accept
            await new Promise(r => setTimeout(r, 1500));
            setStatus('accepted');
        } catch (err) {
            setStatus('error');
        }
    };

    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-gray-500">Verifying invitation...</p>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="text-center p-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
                <p className="text-gray-600 mb-6">This invite link is expired or invalid.</p>
                <Link href="/">
                    <Button variant="outline">Return Home</Button>
                </Link>
            </div>
        );
    }

    if (status === 'accepted') {
        return (
            <div className="text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome Aboard!</h2>
                <p className="text-gray-600 mb-6">You have successfully accepted the admin role.</p>
                <Link href="/auth/login">
                    <Button className="w-full">Proceed to Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Invitation</h2>
                <p className="text-gray-600 mt-2">
                    You have been invited to become an administrator for <br />
                    <span className="font-semibold text-gray-900">{inviteDetails?.unitName}</span>
                </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-600">
                <p><strong>Role:</strong> {inviteDetails?.role}</p>
                <p><strong>Invited By:</strong> {inviteDetails?.inviterName}</p>
            </div>

            <div className="space-y-3 pt-4">
                <Button onClick={handleAccept} className="w-full bg-primary text-white text-lg h-12">
                    Accept Invitation
                </Button>
                <p className="text-xs text-center text-gray-500">
                    By accepting, you agree to the admin terms of service.
                </p>
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                        <InviteContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
