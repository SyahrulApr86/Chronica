"use client";

import { useEffect, useState } from "react";
import {
  format,
  isSameDay,
  differenceInMinutes,
  isWithinInterval,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Plus, Timer, CalendarIcon, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { useAuthStore } from "@/store/authStore";
import useCalendarStore from "@/store/calendarStore";
import useEventStore from "@/store/eventStore";
import { CalendarSelector } from "./CalendarSelector";
import { WeekView } from "./WeekView";
import { EventDialog } from "./EventDialog";
import { AuthDialog } from "./AuthDialog";
import { EventList } from "./EventList";
import { EventsListView } from "./EventsListView";
import type { CalendarEvent } from "@/types/event";

// Function to calculate total duration for events in a month
const calculateMonthlyDuration = (
  events: CalendarEvent[],
  date: Date
): string => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const monthlyEvents = events.filter((event) => {
    const eventDate = new Date(event.startTime);
    return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
  });

  const totalMinutes = monthlyEvents.reduce((total, event) => {
    if (event.allDay) return total;
    return (
      total +
      differenceInMinutes(new Date(event.endTime), new Date(event.startTime))
    );
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours} jam ${minutes} menit`;
};

export function Calendar() {
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(
    undefined
  );
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");

  const { events, fetchEvents, isLoading } = useEventStore();
  const { user, token, logout } = useAuthStore();
  const {
    calendars,
    selectedCalendar,
    setSelectedCalendar,
    createCalendar: createCalendarStore,
    updateCalendar: updateCalendarStore,
    deleteCalendar: deleteCalendarStore,
    fetchCalendars,
  } = useCalendarStore();

  const [, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close auth dialog when user logs in
  useEffect(() => {
    if (user && token) {
      setIsAuthDialogOpen(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (token) {
      fetchCalendars(token);
    }
  }, [token, fetchCalendars]);

  // Fetch events when user is logged in and calendar is selected
  useEffect(() => {
    if (user && token && selectedCalendar) {
      // Fetch events for selected calendar
      fetchEvents(token);
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateEvent = () => {
    if (!canCreateEvent || calendars.length === 0) {
      alert("Silakan buat kalender terlebih dahulu sebelum menambah event.");
      return;
    }
    setSelectedEvent(undefined);
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
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleCreateCalendar = (calendar: {
    name: string;
    description?: string;
    color: string;
  }) => {
    if (!token) return;
    createCalendarStore(token, {
      ...calendar,
      isDefault: calendars.length === 0, // First calendar is default
    });
  };

  const handleUpdateCalendar = (
    id: string,
    calendar: {
      name?: string;
      description?: string;
      color?: string;
      isDefault?: boolean;
    }
  ) => {
    if (!token) return;
    updateCalendarStore(token, id, calendar);
  };

  const handleDeleteCalendar = (id: string) => {
    if (!token) return;
    deleteCalendarStore(token, id);
  };

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

  // Show unauthenticated state with beautiful purple background
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative group mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl">
              <CalendarIcon className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-4">
            Chronica
          </h1>
          <p className="text-gray-300 mb-8 text-lg max-w-md mx-auto">
            Kelola jadwal dan event Anda dengan mudah dan elegan
          </p>
          <Button
            onClick={() => setIsAuthDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg font-semibold hover:scale-105"
          >
            Masuk untuk Memulai
          </Button>
          <div className="flex items-center justify-center gap-2 text-gray-400 mt-6">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm">
              Klik "Masuk untuk Memulai" di atas untuk memulai
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80 relative overflow-hidden">
      {/* Enhanced Background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_500px_at_50%_200px,rgba(255,255,255,0.1),transparent)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Header Section */}
        <div className="p-6 md:p-8 lg:p-10">
          {/* User Authentication Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Chronica
              </h1>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">
                      {user.email}
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gray-100 rounded-2xl shadow-lg"
                  >
                    Keluar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  Masuk
                </Button>
              )}
            </div>
          </div>

          {/* Calendar Selection & Actions */}
          {user && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              {/* Calendar Selector */}
              <CalendarSelector
                calendars={calendars}
                selectedCalendar={selectedCalendar}
                onCalendarSelect={setSelectedCalendar}
                onCalendarCreate={handleCreateCalendar}
                onCalendarUpdate={handleUpdateCalendar}
                onCalendarDelete={handleDeleteCalendar}
              />

              {/* Add Event Button */}
              <Button
                onClick={handleCreateEvent}
                disabled={!canCreateEvent}
                className={`${
                  canCreateEvent
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : "bg-gray-400"
                } text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Plus className="h-5 w-5 mr-2" />
                Tambah
              </Button>
            </div>
          )}

          {/* Show empty state if no calendars */}
          {user && calendars.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Klik &quot;Tambah&quot; di atas untuk memulai
                </span>
              </div>
            </div>
          )}

          {/* Show main content if user has calendars */}
          {user && calendars.length > 0 && (
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
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Calendar View */}
                <Card className="group shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:shadow-3xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
                  <CardContent className="p-6">
                    {viewMode === "month" && (
                      <CalendarPrimitive
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        className="rounded-md"
                        modifiers={{
                          today: (date) => isSameDay(date, new Date()),
                          hasEvents: (date) =>
                            getEventsForDate(date).length > 0,
                        }}
                        modifiersClassNames={{
                          today:
                            "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700",
                          hasEvents:
                            "border-2 border-blue-500 font-bold text-blue-600",
                        }}
                      />
                    )}
                    {viewMode === "week" && (
                      <WeekView
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        events={events}
                        onEventClick={handleEventClick}
                        onTimeSlotClick={handleTimeSlotClick}
                      />
                    )}
                    {viewMode === "list" && (
                      <EventsListView
                        events={events}
                        onEventEdit={handleEditEvent}
                        selectedDate={selectedDate}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
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
  );
}
