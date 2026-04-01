"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api/client";
import { X, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Event } from "@/types/api";

export function RegistrationPromptModal() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unregisteredEvents, setUnregisteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    let mounted = true;

    const checkEvents = async () => {
      // Small debounce to avoid hydration mismatch flashes
      if (!isAuthenticated || !user) return;
      
      const hasSeenPrompt = sessionStorage.getItem("hasSeenRegistrationPrompt");
      if (hasSeenPrompt) {
        return;
      }

      try {
        const userRes = await api.get<any>('/auth/me');
        const currentUser = userRes.data || userRes;
        
        if (!currentUser?.member?.id) {
          return;
        }

        let eventsResponse;
        if (user.unitId) {
            eventsResponse = await api.get<any>(`/events?unitId=${user.unitId}&isPublished=true`);
        } else {
            eventsResponse = await api.get<any>(`/events?isPublished=true`);
        }
        
        const fetchedEventsRaw = eventsResponse.data?.docs || eventsResponse.data || [];
        const fetchedEvents: Event[] = Array.isArray(fetchedEventsRaw) ? fetchedEventsRaw : [];

        const regsResponse = await api.get<any>(`/registrations?memberId=${currentUser.member.id}`);
        const regsData = regsResponse.data?.docs || regsResponse.data?.data || regsResponse.data || [];
        const registrations: any[] = Array.isArray(regsData) ? regsData : [];

        const now = new Date();
        const availableEvents = fetchedEvents.filter((event) => {
            // Already registered?
            const isRegistered = registrations.some(r => r.event?.id === event.id || r.eventId === event.id);
            if (isRegistered) return false;
            
            // Check registration window
            const regStart = new Date(event.registrationStart);
            const regEnd = new Date(event.registrationEnd);
            
            return now >= regStart && now <= regEnd;
        });

        if (availableEvents.length > 0) {
            if (mounted) {
                setUnregisteredEvents(availableEvents);
                setIsOpen(true);
            }
        } else {
            sessionStorage.setItem("hasSeenRegistrationPrompt", "true");
        }
      } catch (error) {
        console.error("Failed to fetch events for prompt:", error);
      }
    };

    const timer = setTimeout(() => {
        checkEvents();
    }, 2000);

    return () => {
        mounted = false;
        clearTimeout(timer);
    };
  }, [isAuthenticated, user]);

  const handleClose = () => {
      setIsOpen(false);
      sessionStorage.setItem("hasSeenRegistrationPrompt", "true");
  };

  if (!isOpen || unregisteredEvents.length === 0) return null;

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#010030] to-blue-900 p-6 sm:p-8 relative shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">Upcoming Events</h2>
                <p className="text-blue-100 font-medium mt-1 text-sm sm:text-base">
                  You haven't registered for these events yet!
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-4 bg-gray-50 flex-1 relative z-10">
            {unregisteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-4 sm:items-center">
                 <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#060CCD] transition-colors truncate">
                        {event.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1 font-medium bg-blue-50/50 px-2 py-1 rounded-md text-blue-700">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                            {event.participationMode}
                        </span>
                    </div>
                 </div>
                 <Link 
                    href={`/my-events/${event.id}/register`}
                    onClick={handleClose}
                    className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#060CCD] text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-900/10 hover:-translate-y-0.5"
                 >
                    Register Now
                    <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-100 flex justify-center shrink-0">
              <button 
                onClick={handleClose}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
               >
                  Maybe Later
              </button>
          </div>
        </div>
      </div>
  );
}
