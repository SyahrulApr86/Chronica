'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Edit, Trash2, Repeat, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useEventStore, Event } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';

interface EventListProps {
  events: Event[];
  onEventEdit: (event: Event) => void;
}

export function EventList({ events, onEventEdit }: EventListProps) {
  const { removeEvent, isLoading } = useEventStore();
  const { token } = useAuthStore();

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      try {
        await removeEvent(token, eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <Calendar className="h-10 w-10 text-gray-400" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
        </div>
        <div className="text-lg font-medium text-gray-600 mb-2">Belum ada event</div>
        <div className="text-gray-500">Klik "Tambah Event" untuk membuat jadwal baru</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <Card 
          key={event.id} 
          className="group border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden"
          style={{ 
            borderLeft: `4px solid ${event.color}`,
            animationDelay: `${index * 50}ms`,
          }}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: event.color }}
                  />
                  <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors duration-200">
                    {event.title}
                  </h3>
                  {event.isRecurring && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                      <Repeat className="h-3 w-3" />
                      <span>Berulang</span>
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-500" />
                    {event.allDay ? (
                      <span className="font-medium">Sepanjang hari</span>
                    ) : (
                      <span className="font-medium">
                        {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                      </span>
                    )}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-700 truncate max-w-32">
                        {event.location}
                      </span>
                    </div>
                  )}

                  {!event.allowOverlap && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium">
                      <span>No Overlap</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEventEdit(event)}
                  className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
                  disabled={isLoading}
                  className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 hover:scale-110 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar animation */}
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"
                style={{ backgroundColor: event.color }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 