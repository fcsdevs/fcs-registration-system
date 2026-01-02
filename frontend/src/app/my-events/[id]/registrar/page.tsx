"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegistrarDashboardPage() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        if (params.id) {
            router.replace(`/my-events/${params.id}/register-others`);
        }
    }, [params.id, router]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="mt-2 text-gray-500">Redirecting...</p>
            </div>
        </div>
    );
}
