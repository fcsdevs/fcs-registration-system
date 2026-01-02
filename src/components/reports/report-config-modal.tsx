import { useState, useEffect } from "react";
import { Download, X, Calendar, FileText } from "lucide-react";
import { EventSelectorModal } from "@/components/events/event-selector-modal";
import { api } from "@/lib/api/client";

interface ReportConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: {
        title: string;
        description: string;
        requiresEvent?: boolean;
        endpointGenerator?: (params: any) => string;
    } | null;
}

export function ReportConfigModal({ isOpen, onClose, reportType }: ReportConfigModalProps) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [format, setFormat] = useState("csv");

    // Reset state when reportType changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedEvent(null);
            setIsGenerating(false);
        }
    }, [isOpen, reportType]);

    if (!isOpen || !reportType) return null;

    const handleGenerate = async () => {
        if (reportType.requiresEvent && !selectedEvent) {
            alert("Please select an event");
            return;
        }

        setIsGenerating(true);
        try {
            const url = reportType.endpointGenerator
                ? reportType.endpointGenerator({ eventId: selectedEvent?.id, format })
                : "";

            if (!url) {
                // Fallback or alert if no endpoint
                alert("Report generation not fully configured");
                return;
            }

            const blob = await api.getBlob(url);
            // const blob = new Blob([response.data], { type: 'text/csv' }); // Not needed if returning blob directly
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${reportType.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            onClose();
        } catch (error) {
            console.error("Report generation failed", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xl font-bold text-gray-900">{reportType.title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                    </div>

                    <div className="p-6 space-y-6">
                        <p className="text-gray-600">{reportType.description}</p>

                        {reportType.requiresEvent && (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">Select Event scope</label>
                                {!selectedEvent ? (
                                    <button
                                        onClick={() => setIsEventSelectorOpen(true)}
                                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Choose an Event
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-blue-900">{selectedEvent.title}</p>
                                                <p className="text-xs text-blue-700 font-medium opacity-80">{new Date(selectedEvent.startDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsEventSelectorOpen(true)} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline px-2">Change</button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Export Format</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setFormat('csv')}
                                    className={`py-3 px-4 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all
                   ${format === 'csv'
                                            ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500 shadow-sm'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    CSV (Excel)
                                </button>
                                <button
                                    disabled
                                    className="py-3 px-4 rounded-xl border border-gray-100 text-gray-400 text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed bg-gray-50"
                                >
                                    <FileText className="w-4 h-4" />
                                    PDF (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (reportType.requiresEvent && !selectedEvent)}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
                        >
                            {isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Download className="w-4 h-4" />}
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            <EventSelectorModal
                isOpen={isEventSelectorOpen}
                onClose={() => setIsEventSelectorOpen(false)}
                onSelect={(e) => { setSelectedEvent(e); setIsEventSelectorOpen(false); }}
            />
        </>
    );
}
