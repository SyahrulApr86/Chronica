'use client';

import React from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Event } from '@/types/event';

interface WeekViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: Event[];
  onEventClick?: (event: Event) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WeekView({ selectedDate, onDateChange, events, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const startOfSelectedWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startOfSelectedWeek, i));

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => onDateChange(subWeeks(selectedDate, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM yyyy', { locale: localeId })}
        </h2>
        <Button variant="ghost" onClick={() => onDateChange(addWeeks(selectedDate, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-4 flex-grow">
        {daysOfWeek.map((day) => (
          <div key={day.toISOString()} className="flex flex-col">
            <div className="text-center font-semibold mb-2">{format(day, 'EEE', { locale: localeId })}</div>
            <div className="flex flex-col h-full">
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className={`h-12 border-b border-gray-200 cursor-pointer ${
                    isToday(day) && hour === new Date().getHours() ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => onTimeSlotClick?.(day, hour)}
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4 mt-4">
        {daysOfWeek.map((day) => (
          <div key={day.toISOString()} className="flex flex-col">
            <div className="text-center font-semibold mb-2">{format(day, 'EEE', { locale: localeId })}</div>
            <div className="flex flex-col h-full">
              {events
                .filter((event) => isSameDay(event.start, day))
                .map((event) => (
                  <Card
                    key={event.id}
                    className="mb-1 cursor-pointer hover:bg-gray-100"
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="text-sm font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500">{format(event.start, 'HH:mm')}</div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 