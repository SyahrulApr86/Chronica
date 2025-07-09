"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Search,
  Filter,
  List,
} from "lucide-react";
import {
  format,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { CalendarEvent } from "@/types/event";

interface EventsListViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

export function EventsListView({
  events,
  selectedDate,
  onEventEdit,
  onEventDelete,
}: EventsListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"week" | "month" | "all">(
    "month"
  );

  // Filter events based on search term and period
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by period
    if (filterPeriod === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      filtered = filtered.filter((event) =>
        isWithinInterval(new Date(event.startTime), {
          start: weekStart,
          end: weekEnd,
        })
      );
    } else if (filterPeriod === "month") {
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      filtered = filtered.filter((event) =>
        isWithinInterval(new Date(event.startTime), {
          start: monthStart,
          end: monthEnd,
        })
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by start time
    return filtered.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [events, selectedDate, filterPeriod, searchTerm]);

  const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) {
      return "Sepanjang hari";
    }

    const start = format(new Date(event.startTime), "HH:mm", {
      locale: localeId,
    });
    const end = format(new Date(event.endTime), "HH:mm", { locale: localeId });
    return `${start} - ${end}`;
  };

  const formatEventDate = (event: CalendarEvent) => {
    return format(new Date(event.startTime), "dd MMM yyyy", {
      locale: localeId,
    });
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>

      <CardHeader className="relative pb-6 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm border-b border-white/20">
        <CardTitle className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <List className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Daftar Events
          </span>
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={filterPeriod}
              onValueChange={(value: "week" | "month" | "all") =>
                setFilterPeriod(value)
              }
            >
              <SelectTrigger className="w-40 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="all">Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative group mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full blur-lg opacity-50"></div>
              <div className="relative p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Tidak ada events
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Tidak ada events yang sesuai dengan pencarian Anda"
                : "Belum ada events untuk periode yang dipilih"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group p-6 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{ backgroundColor: event.color }}
                      />
                      <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      {event.calendar && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                          {event.calendar.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatEventDate(event)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatEventTime(event)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-32">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => onEventEdit(event)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onEventDelete && (
                      <Button
                        onClick={() => {
                          console.log(
                            "EventsListView: Delete button clicked for event:",
                            event
                          );
                          console.log("EventsListView: Event ID:", event.id);
                          console.log(
                            "EventsListView: onEventDelete function:",
                            onEventDelete
                          );

                          if (!event.id) {
                            console.error(
                              "EventsListView: Event ID is missing!"
                            );
                            alert("Error: Event ID tidak ditemukan");
                            return;
                          }

                          onEventDelete(event.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Menampilkan {filteredEvents.length} dari {events.length} events
          </div>
        )}
      </CardContent>
    </Card>
  );
}
