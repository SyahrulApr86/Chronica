"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Repeat,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import useEventStore from "@/store/eventStore";
import { Event } from "@/types/event";

interface EventListProps {
  events: Event[];
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (eventId: string) => void;
}

export function EventList({
  events,
  onEventEdit,
  onEventDelete,
}: EventListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { deleteEvent } = useEventStore();

  const handleDelete = (eventId: string) => {
    deleteEvent(eventId);
    if (onEventDelete) {
      onEventDelete(eventId);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
    if (onEventEdit) {
      onEventEdit(event);
    }
  };

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardContent className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-600">
                {format(new Date(event.date), "MMM dd, yyyy")}
              </p>
              <p className="text-sm text-gray-600">
                {event.time && format(new Date(event.time), "HH:mm")}
              </p>
              <p className="text-sm text-gray-600">
                <MapPin className="inline-block mr-1" />
                {event.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(event)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>
            {selectedEvent ? "Edit Event" : "Add Event"}
          </DialogTitle>
          {/* Event form or edit form goes here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
