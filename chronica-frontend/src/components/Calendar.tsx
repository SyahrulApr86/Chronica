'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarPrimitive } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogOut, User } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chronica</h1>
          <p className="text-gray-600 mb-8">Kelola jadwal Anda dengan mudah</p>
          <Button 
            onClick={() => setIsAuthDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Chronica</h1>
            <p className="text-gray-600">
              Selamat datang, {user.name || user.username}!
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateEvent}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Event
            </Button>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-200 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-gray-900">
                  {format(selectedDate, 'MMMM yyyy', { locale: localeId })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarPrimitive
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={localeId}
                  className="w-full"
                  components={{
                    DayContent: ({ date }) => {
                      const dayEvents = getEventsForDate(date);
                      const hasEvents = dayEvents.length > 0;
                      const isSelected = isSameDay(date, selectedDate);
                      const isCurrentDay = isToday(date);

                      return (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                          <span className={`text-sm ${isSelected ? 'font-bold' : ''}`}>
                            {format(date, 'd')}
                          </span>
                          {hasEvents && (
                            <div className="flex gap-1 mt-1 flex-wrap justify-center">
                              {dayEvents.slice(0, 3).map((event, idx) => (
                                <div
                                  key={idx}
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: event.color }}
                                  title={event.title}
                                />
                              ))}
                              {dayEvents.length > 3 && (
                                <div className="w-2 h-2 rounded-full bg-gray-400" title={`+${dayEvents.length - 3} lagi`} />
                              )}
                            </div>
                          )}
                          {isCurrentDay && !isSelected && (
                            <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
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
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center justify-between">
                  <span>
                    {format(selectedDate, 'dd MMMM yyyy', { locale: localeId })}
                  </span>
                  <span className="text-sm font-normal text-gray-500">
                    {eventsForSelectedDate.length} event
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading events...
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