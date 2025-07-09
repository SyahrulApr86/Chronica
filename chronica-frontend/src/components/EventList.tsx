"use client";

import React from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { CalendarEvent } from "@/types/event";

interface EventListProps {
  events: CalendarEvent[];
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

export function EventList({
  events,
  onEventEdit,
  onEventDelete,
}: EventListProps) {
  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) {
      return "Sepanjang hari";
    }
    const start = format(new Date(event.startTime), "HH:mm");
    const end = format(new Date(event.endTime), "HH:mm");
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm">Tidak ada event</div>
        </div>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            className="group flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-12 rounded-full"
                style={{ backgroundColor: event.color }}
              ></div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {event.title}
                </h3>
                <div className="text-sm text-gray-600">
                  {formatEventTime(event)}
                </div>
                {event.description && (
                  <div className="text-sm text-gray-500 mt-1">
                    {event.description}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-xl hover:bg-blue-50"
                onClick={() => onEventEdit(event)}
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
              {onEventDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl hover:bg-red-50"
                  onClick={() => onEventDelete(event.id!)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
