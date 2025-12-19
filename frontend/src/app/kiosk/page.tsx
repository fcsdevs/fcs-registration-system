"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { Smartphone, QrCode, CheckCircle, XCircle, Search } from "lucide-react";

export default function KioskPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);
    setSearchResult(null);

    try {
      const response = await api.get<any>(`/members/search?q=${encodeURIComponent(searchQuery)}`);
      const members = response.data || response || [];
      
      if (Array.isArray(members) && members.length > 0) {
        setSearchResult(members[0]);
      } else {
        setMessage({ type: "error", text: "Member not found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!searchResult) return;

    try {
      setLoading(true);
      // Implement check-in logic here
      setMessage({ type: "success", text: "Check-in successful!" });
      setTimeout(() => {
        setSearchQuery("");
        setSearchResult(null);
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Check-in failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Self Check-In Kiosk</h1>
            <p className="text-gray-600 text-lg">Search by name, phone, or FCS code</p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter your name, phone number, or FCS code..."
                    className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Messages */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            {/* Search Result */}
            {searchResult && (
              <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {searchResult.firstName?.[0]}{searchResult.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {searchResult.firstName} {searchResult.lastName}
                    </h3>
                    <p className="text-gray-600">{searchResult.fcsCode}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {searchResult.email && (
                    <p className="text-gray-700">📧 {searchResult.email}</p>
                  )}
                  {searchResult.phoneNumber && (
                    <p className="text-gray-700">📱 {searchResult.phoneNumber}</p>
                  )}
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="w-full py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Checking In..." : "✓ Check In"}
                </button>
              </div>
            )}
          </div>

          {/* QR Code Option */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Have a QR Code?</h3>
            <p className="text-gray-600 mb-4">Scan your QR code for instant check-in</p>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Scan QR Code
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
