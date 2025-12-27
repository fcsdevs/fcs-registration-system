"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api/client";
import { Calendar, ArrowLeft, Save, Eye, X, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    unitId: "",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
    participationMode: "ONSITE" as "ONLINE" | "ONSITE" | "HYBRID",
    capacity: "",
  });

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        console.log('Fetching units...');
        const response = await api.get<any>("/units");
        console.log('Units response:', response);

        // Handle different response formats
        let unitsData = [];
        if (response.data) {
          // Check if it's paginated (has data.data property)
          if (response.data.data) {
            unitsData = response.data.data;
          } else {
            unitsData = response.data;
          }
        } else {
          unitsData = response;
        }

        console.log('Extracted units data:', unitsData);
        setUnits(Array.isArray(unitsData) ? unitsData : []);

        if (!Array.isArray(unitsData) || unitsData.length === 0) {
          console.warn('No units found or invalid format');
        }
      } catch (err: any) {
        console.error("Failed to fetch units:", err);
        console.error("Error details:", err.response?.data);
        setError("Failed to load units. Please refresh the page.");
      } finally {
        setLoadingUnits(false);
      }
    };
    fetchUnits();
  }, []);

  const validateDates = (): string | null => {
    const regStart = new Date(formData.registrationStart);
    const regEnd = new Date(formData.registrationEnd);
    const eventStart = new Date(formData.startDate);
    const eventEnd = new Date(formData.endDate);

    if (regEnd <= regStart) {
      return "Registration end date must be after registration start date";
    }

    if (eventEnd <= eventStart) {
      return "Event end date must be after event start date";
    }

    if (eventStart < regStart) {
      return "Event start date should not be before registration start date";
    }

    return null;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate dates
    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    setShowPreview(true);
  };

  const handleConfirmCreate = async () => {
    setError(null);
    setLoading(true);

    try {
      await api.post("/events", {
        title: formData.title,
        description: formData.description || undefined,
        unitId: formData.unitId || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationStart: new Date(formData.registrationStart).toISOString(),
        registrationEnd: new Date(formData.registrationEnd).toISOString(),
        participationMode: formData.participationMode,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });
      router.push("/events");
    } catch (err: any) {
      setError(err.message || "Failed to create event");
      setShowPreview(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSelectedUnit = () => {
    return units.find(u => u.id === formData.unitId);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/events" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePreview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Annual Conference 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your event..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participation Mode *
                  </label>
                  <select
                    required
                    value={formData.participationMode}
                    onChange={(e) => setFormData({ ...formData, participationMode: e.target.value as "ONLINE" | "ONSITE" | "HYBRID" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ONSITE">On-site</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select how participants will attend this event</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of participants (optional)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizing Unit {!loadingUnits && units.length === 0 && "(Optional)"}
                </label>
                <select
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingUnits}
                >
                  <option value="">Select a unit (optional)</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} {unit.code ? `(${unit.code})` : ""}
                    </option>
                  ))}
                </select>
                {loadingUnits && (
                  <p className="text-xs text-gray-500 mt-1">Loading units...</p>
                )}
                {!loadingUnits && units.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ No units available. You can create the event without selecting a unit, or create units first from the Units management page.
                  </p>
                )}
                {!loadingUnits && units.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">The organizational unit hosting this event (e.g., National, State, Center)</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Start *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registrationStart}
                    onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration End *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registrationEnd}
                    onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event End Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-5 h-5" />
                  Preview Event
                </button>
                <Link
                  href="/events"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Review Event Details</h2>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Event Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</label>
                      <p className="text-gray-900 font-medium mt-1">{formData.title}</p>
                    </div>
                    {formData.description && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                        <p className="text-gray-900 mt-1">{formData.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participation Mode</label>
                        <p className="text-gray-900 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formData.participationMode}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Capacity</label>
                        <p className="text-gray-900 mt-1">{formData.capacity || "Unlimited"}</p>
                      </div>
                    </div>
                    {formData.unitId && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Organizing Unit</label>
                        <p className="text-gray-900 mt-1">{getSelectedUnit()?.name || "N/A"}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Period */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Period</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Start</label>
                        <p className="text-gray-900 mt-1">{formatDateTime(formData.registrationStart)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">End</label>
                        <p className="text-gray-900 mt-1">{formatDateTime(formData.registrationEnd)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Period */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Period</h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-green-700 uppercase tracking-wide">Start</label>
                        <p className="text-gray-900 mt-1">{formatDateTime(formData.startDate)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-green-700 uppercase tracking-wide">End</label>
                        <p className="text-gray-900 mt-1">{formatDateTime(formData.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Please review all details carefully. Once created, some event details may be difficult to change.
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  Edit Details
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Confirm & Create Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
