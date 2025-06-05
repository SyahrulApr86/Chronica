'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarPrimitive } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogOut, User, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { format, isSameDay, isToday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { EventDialog } from './EventDialog';
import { EventList } from './EventList';
import { AuthDialog } from './AuthDialog';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { events, fetchEvents, isLoading } = useEventStore();
  const { user, token, logout } = useAuthStore();

  // Show auth dialog if not logged in
  useEffect(() => {
    if (!user || !token) {
      setIsAuthDialogOpen(true);
    }
  }, [user, token]);

  // Fetch events when user is logged in
  useEffect(() => {
    if (user && token) {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      fetchEvents(token, startOfMonth, endOfMonth);
    }
  }, [user, token, selectedDate, fetchEvents]);

  const eventsForSelectedDate = events.filter(event =>
    isSameDay(event.startTime, selectedDate)
  );

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.startTime, date));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuthDialogOpen(true);
  };

  // If not authenticated, only show auth dialog
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20"></div>
        </div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        <div className="text-center relative z-10 backdrop-blur-sm bg-white/10 p-12 rounded-3xl border border-white/20 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <CalendarIcon className="h-16 w-16 text-white mb-4" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Chronica
          </h1>
          <p className="text-purple-100 mb-8 text-lg max-w-md mx-auto leading-relaxed">
            Kelola jadwal Anda dengan mudah dan elegan. Mulai perjalanan produktivitas Anda hari ini.
          </p>
          <Button 
            onClick={() => setIsAuthDialogOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
          >
            <User className="mr-2 h-5 w-5" />
            Masuk / Daftar
          </Button>
        </div>
        
        <AuthDialog 
          isOpen={isAuthDialogOpen} 
          onClose={() => {}} // Don't allow closing if not authenticated
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-200/30 to-yellow-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-1">
                Chronica
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Selamat datang, {user.name || user.username}!</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tambah Event
            </Button>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-200 hover:bg-gray-50 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-between">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {format(selectedDate, 'MMMM yyyy', { locale: localeId })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {events.length} Events
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <CalendarPrimitive
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={localeId}
                  className="w-full"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-lg font-semibold text-gray-700",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex mb-2",
                    head_cell: "text-gray-500 rounded-md w-12 font-medium text-sm uppercase tracking-wide",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-12 w-12 p-0 font-medium aria-selected:opacity-100 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105",
                    day_selected: "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg",
                    day_today: "bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-700 font-bold border-2 border-orange-300",
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
                          <span className={`text-sm ${isSelected ? 'font-bold' : ''} transition-all duration-200`}>
                            {format(date, 'd')}
                          </span>
                          {hasEvents && (
                            <div className="flex gap-1 mt-1 flex-wrap justify-center absolute -bottom-1">
                              {dayEvents.slice(0, 3).map((event, idx) => (
                                <div
                                  key={idx}
                                  className="w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-200 group-hover:scale-125"
                                  style={{ backgroundColor: event.color }}
                                  title={event.title}
                                />
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 shadow-sm transition-all duration-200 group-hover:scale-125" title={`+${dayEvents.length - 3} lagi`} />
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
          </div>

          {/* Events Section */}
          <div className="space-y-6">
            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {format(selectedDate, 'dd MMMM yyyy', { locale: localeId })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      eventsForSelectedDate.length > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {eventsForSelectedDate.length} Event{eventsForSelectedDate.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <div className="text-gray-500">Loading events...</div>
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
        </div>
      </div>

      {/* Dialogs */}
      <EventDialog
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        event={editingEvent}
        userId={user.id}
        selectedDate={selectedDate}
      />
      
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </div>
  );
} 