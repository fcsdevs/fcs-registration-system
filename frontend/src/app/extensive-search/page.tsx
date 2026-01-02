"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function ExtensiveSearchPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Extensive Search</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Find Participant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-sm text-gray-500">
                        Enter at least two details to retrieve the FCS Code.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Surname</label>
                            <Input placeholder="Enter surname" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                            <Input placeholder="Enter email" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number</label>
                            <Input placeholder="Enter phone" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">First Name / Full Name</label>
                            <Input placeholder="Enter name" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button className="w-full md:w-auto">
                            <Search className="mr-2 h-4 w-4" /> Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-dashed bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center p-12 text-gray-500">
                    <Search className="h-10 w-10 mb-4 opacity-50" />
                    <p>Search results will appear here</p>
                </CardContent>
            </Card>
        </div>
    );
}
