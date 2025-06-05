'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Edit, Trash2, Repeat } from 'lucide-react';
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
      <div className="text-center py-8 text-gray-500">
        <div className="text-lg mb-2">Tidak ada event</div>
        <div className="text-sm">Klik "Tambah Event" untuk membuat event baru</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card key={event.id} className="border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: event.color }}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  {event.isRecurring && (
                    <Repeat className="h-4 w-4 text-blue-600" title="Event berulang" />
                  )}
                </div>
                
                {event.description && (
                  <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {!event.allDay && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                      </span>
                    </div>
                  )}
                  
                  {event.allDay && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Sepanjang hari</span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEventEdit(event)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 