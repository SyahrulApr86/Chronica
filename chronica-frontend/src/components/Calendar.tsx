"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  LogOut,
  User,
  Calendar as CalendarIcon,
  Sparkles,
  Timer,
} from "lucide-react";
import {
  format,
  isSameDay,
  isToday,
  differenceInMinutes,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { EventDialog } from "./EventDialog";
import { EventList } from "./EventList";
import { AuthDialog } from "./AuthDialog";
import { WeekView } from "./WeekView";
import { EventsListView } from "./EventsListView";
import { useEventStore } from "@/store/eventStore";
import { useAuthStore } from "@/store/authStore";
import useCalendarStore from "@/store/calendarStore";
import { CalendarSelector } from "./CalendarSelector";
import type { CalendarEvent } from "@/types/event";

// Function to calculate total duration for events in a month
const calculateMonthlyDuration = (
  events: CalendarEvent[],
  date: Date
): string => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const monthlyEvents = events.filter((event) => {
    const eventDate = new Date(event.startTime);
    return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
  });

  const totalMinutes = monthlyEvents.reduce((total, event) => {
    if (event.allDay) return total; // Skip all-day events
    const duration = differenceInMinutes(
      new Date(event.endTime),
      new Date(event.startTime)
    );
    return total + duration;
  }, 0);

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    if (hours > 0) {
      return `${days} hari ${hours} jam`;
    }
    return `${days} hari`;
  } else if (hours > 0) {
    if (minutes > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${hours} jam`;
  } else if (minutes > 0) {
    return `${minutes} menit`;
  } else {
    return "0 menit";
  }
};

// ClientOnly component to prevent hydration mismatch
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative group mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
              <CalendarIcon className="h-16 w-16 text-white animate-bounce" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-4">
            Chronica
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
            <span className="ml-2 text-sm">Memuat...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Calendar() {
  // All hooks must be called unconditionally
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(
    undefined
  );
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");

  const { events, fetchEvents, deleteEvent, isLoading } = useEventStore();
  const { user, token, logout } = useAuthStore();
  const {
    calendars,
    selectedCalendar,
    setSelectedCalendar,
    fetchCalendars,
    createCalendar,
    updateCalendar,
    deleteCalendar,
  } = useCalendarStore();

  // Close auth dialog when user logs in
  useEffect(() => {
    if (user && token) {
      setIsAuthDialogOpen(false);
    }
  }, [user, token]);

  // Fetch calendars when user is logged in
  useEffect(() => {
    if (user && token) {
      fetchCalendars(token);
    }
  }, [user, token, fetchCalendars]);

  // Fetch events when user is logged in and calendar is selected
  useEffect(() => {
    if (user && token && selectedCalendar) {
      // Fetch events for selected calendar
      fetchEvents(token, selectedCalendar.id);
    }
  }, [user, token, selectedDate, selectedCalendar, viewMode, fetchEvents]);

  // Don't allow creating events if no calendar selected or no calendars exist
  const canCreateEvent = selectedCalendar !== null && calendars.length > 0;

  const eventsForSelectedDate = events.filter((event) =>
    isSameDay(event.startTime, selectedDate)
  );

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.startTime, date));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreateEvent = () => {
    if (!canCreateEvent || calendars.length === 0) {
      alert("Silakan buat kalender terlebih dahulu sebelum menambah event.");
      return;
    }
    setEditingEvent(undefined);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuthDialogOpen(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    if (!canCreateEvent || calendars.length === 0) {
      alert("Silakan buat kalender terlebih dahulu sebelum menambah event.");
      return;
    }
    const eventDate = new Date(date);
    eventDate.setHours(hour, 0, 0, 0);
    setSelectedDate(eventDate);
    setEditingEvent(undefined);
    setIsEventDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      return;
    }

    try {
      await deleteEvent(token!, eventId);

      // Refresh events after deletion
      if (selectedCalendar) {
        await fetchEvents(token!, selectedCalendar.id);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event. Silakan coba lagi.");
    }
  };

  // Show loading screen while rehydrating
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative group mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
                <CalendarIcon className="h-16 w-16 text-white animate-bounce" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-4">
              Chronica
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-white rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span className="ml-2 text-sm">Memuat...</span>
            </div>
          </div>
        </div>
      </ClientOnly>
    );
  }

  // If not authenticated, show landing page
  if (!user || !token) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Enhanced Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-indigo-900/60"></div>
            <div
              className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_var(--tw-gradient-stops))] from-purple-500/10 via-pink-500/5 to-indigo-500/10 animate-spin"
              style={{ animationDuration: "20s" }}
            ></div>
          </div>

          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/25 to-indigo-400/25 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-float-slow"></div>

          {/* Glass morphism card */}
          <div className="text-center relative z-10 backdrop-blur-xl bg-white/5 p-16 rounded-[2rem] border border-white/10 shadow-2xl max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-[2rem] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-pulse"></div>
                  <div className="relative p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
                    <CalendarIcon className="h-16 w-16 text-white" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-300 animate-bounce" />
                </div>
              </div>

              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-6 tracking-tight">
                Chronica
              </h1>

              <p className="text-xl text-gray-200 mb-12 max-w-lg mx-auto leading-relaxed font-light">
                Revolusi cara Anda mengelola waktu dengan platform kalender yang
                elegan dan powerful
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => setIsAuthDialogOpen(true)}
                  className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 border-0 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <User className="mr-3 h-6 w-6" />
                  <span className="relative z-10">Mulai Sekarang</span>
                </Button>

                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Gratis • Tanpa Batasan • Aman</span>
                </div>
              </div>
            </div>
          </div>

          <AuthDialog
            isOpen={isAuthDialogOpen}
            onClose={() => setIsAuthDialogOpen(false)}
          />
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80 relative overflow-hidden">
        {/* Enhanced Background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-purple-100/30"></div>
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-pink-200/20 to-yellow-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-indigo-200/15 to-purple-200/15 rounded-full mix-blend-multiply filter blur-2xl animate-float-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 p-6">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                  <CalendarIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 tracking-tight">
                  Chronica
                </h1>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                    <span className="font-medium">
                      Selamat datang, {user.name || user.username}!
                    </span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="hidden sm:inline text-sm text-gray-500">
                    Atur jadwal Anda dengan mudah
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="group px-6 py-3 rounded-2xl font-semibold border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
              >
                <LogOut className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>

          {/* Calendar Selector Section - Always visible */}
          <div className="mb-10">
            <CalendarSelector
              calendars={calendars}
              selectedCalendar={selectedCalendar}
              onCalendarSelect={setSelectedCalendar}
              onCalendarCreate={(calendarData) =>
                createCalendar(token!, {
                  ...calendarData,
                  isDefault: calendars.length === 0,
                })
              }
              onCalendarUpdate={(id, calendarData) =>
                updateCalendar(token!, id, calendarData)
              }
              onCalendarDelete={(id) => deleteCalendar(token!, id)}
            />
          </div>

          {/* Show message if no calendars exist */}
          {calendars.length === 0 && (
            <div className="text-center py-16">
              <Card className="max-w-2xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
                <CardContent className="relative p-12">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                      <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
                        <CalendarIcon className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-gray-800 mb-4">
                    Selamat Datang di Chronica!
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                    Untuk memulai menggunakan Chronica, Anda perlu membuat
                    kalender terlebih dahulu. Kalender akan menjadi tempat untuk
                    menyimpan dan mengatur semua event Anda.
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        Klik &ldquo;Tambah&rdquo; di atas untuk memulai
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Show main content only if user has calendars */}
          {calendars.length > 0 && (
            <>
              {/* Statistics & Daily Events Section - Second row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Monthly Statistics Card */}
                <Card className="group shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
                  <CardHeader className="relative pb-6 bg-gradient-to-br from-orange-50/80 to-amber-50/80 backdrop-blur-sm border-b border-white/20">
                    <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-3">
                      <div className="relative group-hover:scale-110 transition-transform duration-300">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl blur-lg opacity-75"></div>
                        <div className="relative p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                          <Timer className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                        Statistik{" "}
                        {format(selectedDate, "MMMM yyyy", {
                          locale: localeId,
                        })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative p-6">
                    <div className="space-y-4">
                      <div className="group flex items-center justify-between p-4 bg-gradient-to-br from-blue-50/80 to-blue-100/50 backdrop-blur-sm rounded-2xl border border-blue-200/30 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                              <CalendarIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <span className="text-base font-bold text-blue-900">
                              Total Events
                            </span>
                            <div className="text-xs text-blue-600 font-medium">
                              Bulan ini
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-blue-600">
                            {events.length}
                          </span>
                          <div className="text-xs text-blue-500 font-medium">
                            events
                          </div>
                        </div>
                      </div>

                      <div className="group flex items-center justify-between p-4 bg-gradient-to-br from-purple-50/80 to-purple-100/50 backdrop-blur-sm rounded-2xl border border-purple-200/30 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                              <Timer className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <span className="text-base font-bold text-purple-900">
                              Total Durasi
                            </span>
                            <div className="text-xs text-purple-600 font-medium">
                              Waktu produktif
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-purple-600">
                            {calculateMonthlyDuration(events, selectedDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-r from-gray-50/80 to-gray-100/50 backdrop-blur-sm rounded-xl border border-gray-200/30">
                        <span className="text-xs text-gray-600 font-medium flex items-center justify-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                          Event sepanjang hari tidak dihitung dalam durasi
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Events Card */}
                <Card className="group shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
                  <CardHeader className="relative pb-6 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border-b border-white/20">
                    <CardTitle className="text-xl font-black text-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative group-hover:scale-110 transition-transform duration-300">
                          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75"></div>
                          <div className="relative p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                            <CalendarIcon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                          {format(selectedDate, "dd MMMM yyyy", {
                            locale: localeId,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all duration-300 ${
                            eventsForSelectedDate.length > 0
                              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50 text-green-700"
                              : "bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-200/50 text-gray-500"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                eventsForSelectedDate.length > 0
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            {eventsForSelectedDate.length} Event
                            {eventsForSelectedDate.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                        <div className="text-gray-500 text-sm">
                          Loading events...
                        </div>
                      </div>
                    ) : (
                      <EventList
                        events={eventsForSelectedDate}
                        onEventEdit={handleEditEvent}
                        onEventDelete={handleDeleteEvent}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Section - Now full width */}
              <div className="w-full">
                {/* Common Header for all view modes */}
                <Card className="group shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
                  <CardHeader className="relative pb-6 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm border-b border-white/20">
                    <CardTitle className="text-4xl font-black text-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                          <CalendarIcon className="h-8 w-8 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                          {viewMode === "list"
                            ? "Daftar Events"
                            : format(
                                selectedDate,
                                viewMode === "month"
                                  ? "MMMM yyyy"
                                  : "d MMMM yyyy",
                                {
                                  locale: localeId,
                                }
                              )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-gray-200">
                          <Button
                            onClick={() => setViewMode("month")}
                            variant={viewMode === "month" ? "default" : "ghost"}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                              viewMode === "month"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            Bulan
                          </Button>
                          <Button
                            onClick={() => setViewMode("week")}
                            variant={viewMode === "week" ? "default" : "ghost"}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                              viewMode === "week"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            Minggu
                          </Button>
                          <Button
                            onClick={() => setViewMode("list")}
                            variant={viewMode === "list" ? "default" : "ghost"}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                              viewMode === "list"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            List
                          </Button>
                        </div>

                        <Button
                          onClick={handleCreateEvent}
                          disabled={!canCreateEvent}
                          className={`group px-6 py-3 rounded-2xl font-semibold shadow-xl transition-all duration-300 transform border-0 ${
                            canCreateEvent
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/25 hover:scale-105"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          title={
                            !canCreateEvent
                              ? "Buat kalender terlebih dahulu"
                              : ""
                          }
                        >
                          <Plus
                            className={`mr-2 h-5 w-5 transition-transform duration-300 ${
                              canCreateEvent ? "group-hover:rotate-90" : ""
                            }`}
                          />
                          Tambah Event
                        </Button>

                        <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-200/50 text-blue-700 rounded-2xl text-sm font-semibold shadow-lg">
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            {events.length} Events
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-200/50 text-purple-700 rounded-2xl text-sm font-semibold shadow-lg">
                          <Timer className="h-4 w-4" />
                          <span>
                            {calculateMonthlyDuration(events, selectedDate)}
                          </span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Content based on view mode */}
                {viewMode === "month" ? (
                  <Card className="group shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
                    <CardContent className="p-12">
                      <CalendarPrimitive
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        locale={localeId}
                        className="w-full max-w-4xl mx-auto"
                        classNames={{
                          months:
                            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-6",
                          caption:
                            "flex justify-center pt-2 relative items-center mb-8",
                          caption_label: "text-2xl font-bold text-gray-700",
                          nav: "space-x-2 flex items-center",
                          nav_button:
                            "h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl",
                          nav_button_previous: "absolute left-2",
                          nav_button_next: "absolute right-2",
                          table: "w-full border-collapse space-y-2",
                          head_row: "flex mb-4",
                          head_cell:
                            "text-gray-600 rounded-xl w-20 h-12 font-bold text-base uppercase tracking-wide flex items-center justify-center",
                          row: "flex w-full mt-3",
                          cell: "text-center text-base p-1 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-20 w-20 p-0 font-semibold aria-selected:opacity-100 hover:bg-blue-50 rounded-2xl transition-all duration-300 hover:scale-110 text-lg",
                          day_selected:
                            "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl scale-110",
                          day_today:
                            "bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-800 font-black border-2 border-orange-400 shadow-lg [&[aria-selected=true]]:bg-gradient-to-br [&[aria-selected=true]]:from-blue-500 [&[aria-selected=true]]:to-purple-600 [&[aria-selected=true]]:border-yellow-400 [&[aria-selected=true]]:border-4",
                          day_outside: "text-gray-300 opacity-50",
                          day_disabled: "text-gray-300 opacity-30",
                        }}
                        components={{
                          DayContent: ({ date }) => {
                            const dayEvents = getEventsForDate(date);
                            const hasEvents = dayEvents.length > 0;
                            const isSelected = isSameDay(date, selectedDate);
                            const isCurrentDay = isToday(date);

                            return (
                              <div className="relative w-full h-full flex flex-col items-center justify-center group">
                                <span
                                  className={`text-lg font-bold ${
                                    isSelected && isCurrentDay
                                      ? "text-yellow-300 drop-shadow-lg"
                                      : isSelected
                                      ? "text-white"
                                      : isCurrentDay
                                      ? "text-orange-800"
                                      : "text-gray-700"
                                  } transition-all duration-300`}
                                >
                                  {format(date, "d")}
                                </span>
                                {hasEvents && (
                                  <div className="flex gap-1.5 mt-2 flex-wrap justify-center absolute -bottom-2">
                                    {dayEvents.slice(0, 4).map((event, idx) => (
                                      <div
                                        key={idx}
                                        className="w-2.5 h-2.5 rounded-full shadow-lg transition-all duration-300 group-hover:scale-150 border border-white/20"
                                        style={{ backgroundColor: event.color }}
                                        title={event.title}
                                      />
                                    ))}
                                    {dayEvents.length > 4 && (
                                      <div
                                        className="w-2.5 h-2.5 rounded-full bg-gray-500 shadow-lg transition-all duration-300 group-hover:scale-150 border border-white/20"
                                        title={`+${dayEvents.length - 4} lagi`}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : viewMode === "week" ? (
                  <Card className="group shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
                    <CardContent className="p-6">
                      <WeekView
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        events={events}
                        onEventClick={handleEventClick}
                        onTimeSlotClick={handleTimeSlotClick}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <EventsListView
                    events={events}
                    selectedDate={selectedDate}
                    onEventEdit={handleEditEvent}
                    onEventDelete={handleDeleteEvent}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Dialogs */}
        <EventDialog
          isOpen={isEventDialogOpen}
          onClose={() => setIsEventDialogOpen(false)}
          event={editingEvent}
          selectedDate={selectedDate}
        />

        <AuthDialog
          isOpen={isAuthDialogOpen}
          onClose={() => setIsAuthDialogOpen(false)}
        />
      </div>
    </ClientOnly>
  );
}
