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
import { Event } from "@/types/event";

interface EventsListViewProps {
  events: Event[];
  selectedDate: Date;
  onEventEdit: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
}

export function EventsListView({
  events,
  selectedDate,
  onEventEdit,
  onEventDelete,
}: EventsListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearchTerm =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || event.category === selectedCategory;

      const matchesTime =
        selectedTime === "all" ||
        isWithinInterval(event.startDate, {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        });

      const matchesLocation =
        selectedLocation === "all" || event.location === selectedLocation;

      return (
        matchesSearchTerm && matchesCategory && matchesTime && matchesLocation
      );
    });
  }, [
    events,
    searchTerm,
    selectedCategory,
    selectedTime,
    selectedLocation,
    selectedDate,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select onValueChange={setSelectedCategory} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedTime} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Times</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="afternoon">Afternoon</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedLocation} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="cafe">Cafe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(event.startDate, "MMM dd, HH:mm")} -{" "}
                  {format(event.endDate, "HH:mm")}
                </p>
                <p className="text-sm text-muted-foreground">
                  <MapPin className="inline-block mr-1" /> {event.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEventEdit(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {onEventDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEventDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p>{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
