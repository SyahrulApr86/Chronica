"use client";

import React from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { Event } from "@/types/event";

interface WeekViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: Event[];
  onEventClick?: (event: Event) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WeekView({
  selectedDate,
  onDateChange,
  events,
  onEventClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { locale: localeId });
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    onDateChange(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    onDateChange(addWeeks(selectedDate, 1));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startTime), date));
  };

  const getEventPosition = (event: Event) => {
    const startHour = new Date(event.startTime).getHours();
    const startMinute = new Date(event.startTime).getMinutes();
    const endHour = new Date(event.endTime).getHours();
    const endMinute = new Date(event.endTime).getMinutes();

    const top = (startHour + startMinute / 60) * 60; // 60px per hour
    const height =
      (endHour + endMinute / 60 - (startHour + startMinute / 60)) * 60;

    return { top, height: Math.max(height, 30) }; // Minimum height 30px
  };

  const formatEventTime = (event: Event) => {
    const start = format(new Date(event.startTime), "HH:mm");
    const end = format(new Date(event.endTime), "HH:mm");
    return `${start} - ${end}`;
  };

  return (
    <div className="w-full">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {format(weekStart, "MMMM yyyy", { locale: localeId })}
          </h2>
          <div className="text-sm text-gray-600">
            {format(weekStart, "dd MMM", { locale: localeId })} -{" "}
            {format(addDays(weekStart, 6), "dd MMM", { locale: localeId })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevWeek}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleNextWeek}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week view container */}
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <div className="p-6">
          {/* Days header */}
          <div className="grid grid-cols-8 gap-0 border-b border-gray-200">
            <div className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Waktu
            </div>
            {days.map((day, index) => (
              <div
                key={index}
                className={`p-4 text-center border-l border-gray-200 ${
                  isToday(day) ? "bg-blue-50" : ""
                }`}
              >
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {format(day, "EEE", { locale: localeId })}
                </div>
                <div
                  className={`text-lg font-bold mt-1 ${
                    isToday(day) ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots and events */}
          <div className="relative">
            <div className="grid grid-cols-8 gap-0">
              {/* Time column */}
              <div className="border-r border-gray-200">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-15 border-b border-gray-100 p-2 text-xs text-gray-500 text-right"
                    style={{ height: "60px" }}
                  >
                    {hour === 0
                      ? "00:00"
                      : `${hour.toString().padStart(2, "0")}:00`}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="relative border-r border-gray-200"
                >
                  {/* Time slots */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-15 border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors duration-200"
                      style={{ height: "60px" }}
                      onClick={() => onTimeSlotClick?.(day, hour)}
                    />
                  ))}

                  {/* Events */}
                  <div className="absolute inset-0 pointer-events-none">
                    {getEventsForDay(day).map((event) => {
                      const { top, height } = getEventPosition(event);
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded-lg shadow-sm border border-white/20 pointer-events-auto cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: event.color,
                            minHeight: "30px",
                          }}
                          onClick={() => onEventClick?.(event)}
                        >
                          <div className="p-2 h-full overflow-hidden">
                            <div className="text-white text-xs font-semibold truncate">
                              {event.title}
                            </div>
                            {height > 40 && (
                              <div className="text-white/90 text-xs mt-1">
                                {formatEventTime(event)}
                              </div>
                            )}
                            {height > 60 && event.description && (
                              <div className="text-white/80 text-xs mt-1 truncate">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
