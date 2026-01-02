import { Search, X, Calendar, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/client";

interface Event {
    id: string;
    title: string;
    startDate: string;
    participationMode: string;
}

interface EventSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (event: Event) => void;
    selectedEventId?: string;
}

export function EventSelectorModal({ isOpen, onClose, onSelect, selectedEventId }: EventSelectorModalProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (events.length === 0) fetchEvents();
        }
    }, [isOpen]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get<any>("/events");
            const data = response.data?.data || response.data || response || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-100">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Select Event</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search events by name..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3">
                    {loading && events.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            Loading events...
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No events found matching "{searchQuery}"</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredEvents.map(event => {
                                const isSelected = selectedEventId === event.id;
                                return (
                                    <button
                                        key={event.id}
                                        onClick={() => onSelect(event)}
                                        className={`w-full flex items-start text-left p-4 rounded-lg border transition-all group
                        ${isSelected
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <span className={`font-semibold block ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-700'}`}>
                                                {event.title}
                                            </span>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(event.startDate).toLocaleDateString()}
                                                </div>
                                                <span>•</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                            ${event.participationMode === 'ONSITE' ? 'bg-green-100 text-green-700' :
                                                        event.participationMode === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {event.participationMode}
                                                </span>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="text-blue-600">
                                                <Check className="w-5 h-5" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
