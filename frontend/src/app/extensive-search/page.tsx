"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, User, Mail, Phone, Hash, Sparkles, CheckCircle2 } from 'lucide-react';
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <Search className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Extensive Search
                    </h1>
                    <p className="text-gray-600">
                        Find participant details quickly and easily
                    </p>
                </div>

                {/* Search Card */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="w-6 h-6 text-blue-600" />
                            Find Participant
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800 flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>
                                    Enter at least <strong>two details</strong> to retrieve the FCS Code and participant information.
                                </span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Surname */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Surname
                                </label>
                                <Input
                                    placeholder="Enter surname"
                                    value={formData.surname}
                                    onChange={(e) => handleInputChange('surname', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    Phone Number
                                </label>
                                <Input
                                    placeholder="Enter phone number"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={loading}
                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-5 w-5" /> Search
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Card */}
                <Card className={`border-0 shadow-xl transition-all ${searchResult
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                        : "bg-white/80 backdrop-blur-sm border-dashed border-2 border-gray-300"
                    }`}>
                    <CardContent className="p-6 sm:p-12">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                                <Loader2 className="h-12 w-12 mb-4 animate-spin text-blue-600" />
                                <p className="text-lg font-medium">Searching for participant...</p>
                            </div>
                        ) : searchResult ? (
                            <div className="space-y-6">
                                {/* Success Header */}
                                <div className="flex items-center justify-center mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-semibold">Participant Found!</span>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center gap-6 mb-6 p-6 bg-white rounded-2xl shadow-md">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                            {searchResult.firstName} {searchResult.lastName}
                                        </h3>
                                        <Badge variant="outline" className="font-mono text-base px-3 py-1 bg-blue-50 border-blue-300 text-blue-700">
                                            <Hash className="w-4 h-4 mr-1" />
                                            {searchResult.fcsCode}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {searchResult.email && (
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                                                <p className="text-sm text-gray-900 font-medium truncate">{searchResult.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {searchResult.phoneNumber && (
                                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Phone className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Phone</p>
                                                <p className="text-sm text-gray-900 font-medium">{searchResult.phoneNumber}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Info */}
                                {(searchResult.gender || searchResult.dateOfBirth) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                        {searchResult.gender && (
                                            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Gender</p>
                                                <p className="text-sm text-gray-900 font-medium">{searchResult.gender}</p>
                                            </div>
                                        )}
                                        {searchResult.dateOfBirth && (
                                            <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                                                <p className="text-xs text-gray-500 font-medium mb-1">Date of Birth</p>
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {new Date(searchResult.dateOfBirth).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                                <Search className="h-16 w-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Search results will appear here</p>
                                <p className="text-sm mt-2">Enter participant details above to begin</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
