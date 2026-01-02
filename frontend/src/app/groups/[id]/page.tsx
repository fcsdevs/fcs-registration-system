"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import {
    Users,
    ArrowLeft,
    Search,
    UserMinus,
    Calendar,
    MoreVertical,
    Trash2,
    Edit
} from "lucide-react";
import Link from "next/link";

interface GroupMember {
    id: string;
    firstName: string;
    lastName: string;
    fcsCode: string;
    email: string;
    phoneNumber: string;
    profilePhotoUrl?: string;
    memberId: string; // ID for API actions if different
}

interface GroupDetails {
    id: string;
    name: string;
    description: string;
    type: string;
    capacity?: number;
    memberCount: number;
    event: {
        id: string;
        title: string;
    };
    createdAt: string;
    updatedAt: string;
}

export default function GroupDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [removingMember, setRemovingMember] = useState<string | null>(null);

    const fetchGroupDetails = useCallback(async () => {
        try {
            const response = await api.get<any>(`/groups/${groupId}`);
            setGroup(response.data || response);
        } catch (error) {
            console.error("Failed to fetch group details:", error);
            // alert("Failed to load group details");
        }
    }, [groupId]);

    const fetchMembers = useCallback(async () => {
        try {
            const response = await api.get<any>(`/groups/${groupId}/members`);
            const payload = response.data || response;
            const membersList = payload.members || payload || [];
            setMembers(Array.isArray(membersList) ? membersList : []);
        } catch (error) {
            console.error("Failed to fetch group members:", error);
        }
    }, [groupId]);

    useEffect(() => {
        if (groupId) {
            setLoading(true);
            Promise.all([fetchGroupDetails(), fetchMembers()])
                .finally(() => setLoading(false));
        }
    }, [groupId, fetchGroupDetails, fetchMembers]);

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm("Are you sure you want to remove this member from the group?")) return;

        setRemovingMember(memberId);
        try {
            await api.delete(`/groups/${groupId}/members/${memberId}`);
            await Promise.all([fetchMembers(), fetchGroupDetails()]);
        } catch (error) {
            console.error("Failed to remove member:", error);
            alert("Failed to remove member");
        } finally {
            setRemovingMember(null);
        }
    };

    const filteredMembers = members.filter(member => {
        const term = searchQuery.toLowerCase();
        return (
            member.firstName?.toLowerCase().includes(term) ||
            member.lastName?.toLowerCase().includes(term) ||
            member.fcsCode?.toLowerCase().includes(term) ||
            member.email?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!group) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 p-8 text-center">
                    <h2 className="text-xl font-bold text-gray-900">Group not found</h2>
                    <Link href="/groups" className="text-blue-600 hover:underline mt-4 inline-block">
                        Back to Groups
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/groups"
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Groups
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${group.type === 'BIBLE_STUDY' ? 'bg-blue-100 text-blue-800' :
                                            group.type === 'WORKSHOP' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {group.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2 max-w-2xl">{group.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Event: {group.event?.title || 'Unknown Event'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Future: Edit Button */}
                                <Link
                                    href={`/groups/${groupId}/edit`}
                                    className="px-4 py-2 bg-blue-600 border border-transparent text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Group
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Assigned Members</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-1">{members.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-100 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Capacity</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {group.capacity ? group.capacity : '∞'}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-600">%</span>
                                </div>
                            </div>
                            {group.capacity && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${members.length >= group.capacity ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min((members.length / group.capacity) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {Math.round((members.length / group.capacity) * 100)}% Full
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Can add more stats here */}
                    </div>

                    {/* Members List */}
                    <div className="bg-white rounded-lg shadow flex-1 flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-gray-900">Group Members</h2>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                {searchQuery ? 'No members match your search' : 'No members assigned to this group yet'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                                {member.firstName?.[0]}{member.lastName?.[0]}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                                            <div className="text-sm text-gray-500">{member.fcsCode}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                                    <div className="text-sm text-gray-900">{member.email}</div>
                                                    <div className="text-sm text-gray-500">{member.phoneNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Member
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        disabled={removingMember === member.id}
                                                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50 disabled:opacity-50"
                                                        title="Remove from group"
                                                    >
                                                        <UserMinus className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <p className="text-xs text-gray-500 text-center">
                                To add members, go to the Registrations page or check-in flow.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
