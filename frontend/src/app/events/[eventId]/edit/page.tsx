"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/common/route-guards";
import { api } from "@/lib/api/client";
import { Calendar, ArrowLeft, Save, Loader2, X } from "lucide-react";
import Link from "next/link";

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.eventId as string;
    const [loading, setLoading] = useState(false);
    const [fetchingEvent, setFetchingEvent] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        registrationStart: "",
        registrationEnd: "",
        participationMode: "ONSITE" as "ONLINE" | "ONSITE" | "HYBRID",
        imageUrl: "",
    });

    useEffect(() => {
        fetchEventData();
    }, [eventId]);

    const fetchEventData = async () => {
        try {
            setFetchingEvent(true);
            const response = await api.get<any>(`/events/${eventId}`);
            const event = response.data;

            // Convert ISO dates to datetime-local format
            const formatDateForInput = (isoDate: string) => {
                const date = new Date(isoDate);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            setFormData({
                title: event.title || "",
                description: event.description || "",
                startDate: formatDateForInput(event.startDate),
                endDate: formatDateForInput(event.endDate),
                registrationStart: formatDateForInput(event.registrationStart),
                registrationEnd: formatDateForInput(event.registrationEnd),
                participationMode: event.participationMode || "ONSITE",
                imageUrl: event.imageUrl || "",
            });
            if (event.imageUrl) {
                setImagePreview(event.imageUrl);
            }
        } catch (err: any) {
            setError("Failed to load event data");
            console.error(err);
        } finally {
            setFetchingEvent(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const payload = new FormData();
            payload.append("title", formData.title);
            if (formData.description) payload.append("description", formData.description);
            payload.append("startDate", new Date(formData.startDate).toISOString());
            payload.append("endDate", new Date(formData.endDate).toISOString());
            payload.append("registrationStart", new Date(formData.registrationStart).toISOString());
            payload.append("registrationEnd", new Date(formData.registrationEnd).toISOString());
            payload.append("participationMode", formData.participationMode);

            if (imageFile) {
                payload.append("image", imageFile);
            } else if (formData.imageUrl) {
                payload.append("imageUrl", formData.imageUrl);
            }

            await api.put(`/events/${eventId}`, payload);
            alert('Event updated successfully!');
            router.push(`/events/${eventId}`);
        } catch (err: any) {
            setError(err.message || "Failed to update event");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingEvent) {
        return (
            <ProtectedRoute>
                <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Event Details
                    </Link>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="w-8 h-8 text-primary" />
                            <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Describe your event..."
                                />
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="ONSITE">On-site</option>
                                        <option value="ONLINE">Online</option>
                                        <option value="HYBRID">Hybrid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Banner Image
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setImagePreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="event-image-upload"
                                        />
                                        <label
                                            htmlFor="event-image-upload"
                                            className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium border border-gray-300"
                                        >
                                            {imagePreview ? "Change Image" : "Upload Image"}
                                        </label>
                                        {(imageFile || formData.imageUrl) && (
                                            <span className="text-sm text-gray-500 truncate max-w-[200px]">
                                                {imageFile ? imageFile.name : "Current Image"}
                                            </span>
                                        )}
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                    setFormData({ ...formData, imageUrl: "" });
                                                }}
                                                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1 italic">Optional: Upload a banner image (JPG/PNG)</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Update Event
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={`/events/${eventId}`}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
