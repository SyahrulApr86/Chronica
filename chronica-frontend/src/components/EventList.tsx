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

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  color: string;
  isRecurring: boolean;
}

interface EventListProps {
  events: Event[];
  onEventEdit: (event: Event) => void;
}

const formatDuration = (startTime: Date, endTime: Date): string => {
  const minutes = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} menit`;
  } else if (remainingMinutes === 0) {
    return `${hours} jam`;
  } else {
    return `${hours} jam ${remainingMinutes} menit`;
  }
};

export function EventList({ events, onEventEdit }: EventListProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteEvent } = useEventStore();

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
      setEventToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="relative inline-block mb-4">
          <div className="relative p-4 bg-gray-100 rounded-2xl">
            <Calendar className="h-10 w-10 text-gray-400" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
        </div>
        <div className="text-lg font-medium text-gray-600 mb-2">
          Belum ada event
        </div>
        <div className="text-gray-500">
          Klik &quot;Tambah Event&quot; untuk membuat jadwal baru
        </div>
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
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
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
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
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
                        {format(event.startTime, "HH:mm")} -{" "}
                        {format(event.endTime, "HH:mm")}
                      </span>
                    )}
                  </div>

                  {!event.allDay && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                      <Timer className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-purple-700">
                        {formatDuration(event.startTime, event.endTime)}
                      </span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-700">
                        {event.location}
                      </span>
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
                  onClick={() => handleDeleteClick(event)}
                  disabled={isDeleting}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md p-0 bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogTitle className="sr-only">Konfirmasi Hapus Event</DialogTitle>
          <div className="relative">
            {/* Header with red gradient */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Hapus Event</h2>
                  <p className="text-red-100 text-sm">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Yakin ingin menghapus event ini?
                  </h3>
                  {eventToDelete && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: eventToDelete.color }}
                        />
                        <span className="font-semibold text-gray-900">
                          {eventToDelete.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {eventToDelete.allDay ? (
                          <span>Sepanjang hari</span>
                        ) : (
                          <span>
                            {format(eventToDelete.startTime, "HH:mm")} -{" "}
                            {format(eventToDelete.endTime, "HH:mm")}
                          </span>
                        )}
                      </div>
                      {eventToDelete.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{eventToDelete.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-gray-600 leading-relaxed">
                    Event ini akan dihapus secara permanen dari kalender Anda.
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <Button
                  onClick={handleCancelDelete}
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-11"
                  disabled={isDeleting}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl h-11 shadow-lg shadow-red-500/25"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
