"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { Member } from "@/types/api";
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  UserCheck,
  UserX,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function MemberPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterGender, setFilterGender] = useState<"all" | "MALE" | "FEMALE" | "OTHER">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, filterStatus, filterGender]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      });

      if (filterStatus !== "all") {
        params.append("isActive", (filterStatus === "active").toString());
      }
      if (filterGender !== "all") {
        params.append("gender", filterGender);
      }

      const response = await api.get<any>(`/members?${params.toString()}`);
      // Backend returns { data: [...], pagination: {...} }
      const membersData = response.data || response || [];
      setMembers(Array.isArray(membersData) ? membersData : []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]); // Ensure members is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMembers();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<any>(`/members/search?q=${encodeURIComponent(searchQuery)}`);
      const searchResults = response.data || response || [];
      setMembers(Array.isArray(searchResults) ? searchResults : []);
    } catch (error) {
      console.error("Search failed:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = Array.isArray(members) ? members.filter((member) => {
    const matchesSearch = 
      member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.fcsCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phoneNumber?.includes(searchQuery);

    return matchesSearch;
  }) : [];

  const stats = {
    total: Array.isArray(members) ? members.length : 0,
    active: Array.isArray(members) ? members.filter(m => m.isActive).length : 0,
    inactive: Array.isArray(members) ? members.filter(m => !m.isActive).length : 0,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Members</h1>
                <p className="text-gray-600 mt-1">Manage church members and their information</p>
              </div>
              <Link
                href="/members/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Member
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Members</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Members</p>
                  <p className="text-3xl font-bold text-gray-400 mt-1">{stats.inactive}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <UserX className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, FCS code, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Gender Filter */}
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Members Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? "Try adjusting your search or filters" : "Get started by adding your first member"}
              </p>
              <Link
                href="/members/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Member
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{member.fcsCode}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>

                    <div className="space-y-2">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{member.phoneNumber}</span>
                        </div>
                      )}
                      {member.state && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{member.state}</span>
                        </div>
                      )}
                      {member.dateOfBirth && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(member.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {member.gender && (
                        <span className="text-xs text-gray-500">{member.gender}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
