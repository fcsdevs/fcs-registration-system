"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, User, Mail, Phone, Hash } from 'lucide-react';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function ExtensiveSearchPage() {
    const [formData, setFormData] = useState({
        surname: '',
        email: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = async () => {
        // Validate that at least 2 fields are filled
        const filledFields = Object.values(formData).filter(val => val.trim() !== '').length;

        if (filledFields < 2) {
            toast.error('Please enter at least two details to search');
            return;
        }

        setLoading(true);
        setSearchResult(null);

        try {
            // Build search query
            const searchParams = new URLSearchParams();
            if (formData.surname) searchParams.append('lastName', formData.surname);
            if (formData.email) searchParams.append('email', formData.email);
            if (formData.phoneNumber) searchParams.append('phoneNumber', formData.phoneNumber);

            const response = await api.get<any>(`/members/search?${searchParams.toString()}`);
            const members = response.data || response || [];

            if (Array.isArray(members) && members.length > 0) {
                setSearchResult(members[0]);
                toast.success('Member found!');
            } else {
                toast.error('No member found matching your criteria');
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Extensive Search</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Find Participant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-gray-500">
                        Enter at least two details to retrieve the FCS Code.
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Surname</label>
                            <Input
                                placeholder="Enter surname"
                                value={formData.surname}
                                onChange={(e) => handleInputChange('surname', e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Email Address</label>
                            <Input
                                type="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Phone Number</label>
                            <Input
                                placeholder="Enter phone"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            className="w-full sm:w-auto"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" /> Search
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className={searchResult ? "border-green-200 bg-green-50/50" : "border-dashed bg-gray-50"}>
                <CardContent className="p-6 sm:p-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <Loader2 className="h-10 w-10 mb-4 animate-spin" />
                            <p>Searching...</p>
                        </div>
                    ) : searchResult ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {searchResult.firstName} {searchResult.lastName}
                                    </h3>
                                    <Badge variant="outline" className="mt-1 font-mono">
                                        <Hash className="w-3 h-3 mr-1" />
                                        {searchResult.fcsCode}
                                    </Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                                {searchResult.email && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm break-all">{searchResult.email}</span>
                                    </div>
                                )}
                                {searchResult.phoneNumber && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{searchResult.phoneNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <Search className="h-10 w-10 mb-4 opacity-50" />
                            <p>Search results will appear here</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
