"use client";

import { useState, useEffect, useRef } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
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
  ChevronRight,
  Eye,
  MoreVertical,
  Shield,
  Trash2,
  UserCog
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MemberPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterGender, setFilterGender] = useState<"all" | "MALE" | "FEMALE" | "OTHER">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await api.get<any>(`/members?${params.toString()}`);
      // Backend returns { data: [...], pagination: {...} } OR just [...] depending on previous fix
      // My previous fix unwrapped it to just the array or object. 
      // Let's handle both cases robustly.

      let membersData = [];
      if (Array.isArray(response)) {
        membersData = response;
      } else if (response && Array.isArray(response.data)) {
        membersData = response.data;
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        membersData = [];
      }

      setMembers(membersData);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1); // Reset to page 1 on new search
    fetchMembers();
  };

  // Debounce search or just use enter key (current implementation uses Enter or manually triggering fetch)
  // Let's attach to Enter key in the input

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
    try {
      await api.delete(`/members/${id}`);
      fetchMembers(); // Refresh list
    } catch (error) {
      console.error("Failed to delete member:", error);
      alert("Failed to delete member");
    }
  };

  const stats = {
    total: members.length, // accurate only if we fetched all, but with pagination this is just page count. 
    // Ideally we'd get stats from a separate endpoint or the pagination metadata.
    // For now keep as is or just hide if inaccurate. 
    // Let's assume pagination metadata gives total if available, otherwise just count visible.
    active: members.filter(m => m.isActive).length,
    inactive: members.filter(m => !m.isActive).length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Members</h1>
              <p className="text-gray-600 mt-1">Manage church members and their information</p>
            </div>
            {/* Add Member button removed as per request */}
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Members List (Table) */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-600">
                  {searchQuery ? "Try adjusting your search or filters" : "No members available"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                              <div className="text-xs text-gray-500">{member.fcsCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {member.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{member.email}</span>
                              </div>
                            )}
                            {member.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{member.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.state && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{member.state}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 relative">
                            {/* Eye Icon - View Details */}
                            <Link
                              href={`/members/${member.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>

                            {/* More Menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === member.id ? null : member.id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${openMenuId === member.id ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {openMenuId === member.id && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link
                                    href={`/members/${member.id}/roles`}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    <Shield className="w-4 h-4" />
                                    Manage Roles (Admin)
                                  </Link>
                                  <Link
                                    href={`/members/${member.id}/roles?action=registrar`}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    <UserCog className="w-4 h-4" />
                                    Make Registrar
                                  </Link>
                                  <div className="h-px bg-gray-100 my-1" />
                                  <button
                                    onClick={() => {
                                      handleDelete(member.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Member
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination remains mostly same */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
