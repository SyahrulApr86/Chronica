"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventStore, Event, RecurrenceRule } from "@/store/eventStore";
import { useAuthStore } from "@/store/authStore";
import { useCalendarStore } from "@/store/calendarStore";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Palette,
  Repeat,
  Settings,
  Save,
  X,
  CalendarDays,
  Timer,
} from "lucide-react";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  userId: string;
  selectedDate: Date;
}

const colorOptions = [
  {
    value: "#3b82f6",
    label: "Biru Ocean",
    color: "bg-blue-500",
    preview: "from-blue-400 to-blue-600",
  },
  {
    value: "#ef4444",
    label: "Merah Cherry",
    color: "bg-red-500",
    preview: "from-red-400 to-red-600",
  },
  {
    value: "#10b981",
    label: "Hijau Forest",
    color: "bg-emerald-500",
    preview: "from-emerald-400 to-emerald-600",
  },
  {
    value: "#f59e0b",
    label: "Kuning Sunshine",
    color: "bg-amber-500",
    preview: "from-amber-400 to-amber-600",
  },
  {
    value: "#8b5cf6",
    label: "Ungu Galaxy",
    color: "bg-violet-500",
    preview: "from-violet-400 to-violet-600",
  },
  {
    value: "#06b6d4",
    label: "Cyan Ocean",
    color: "bg-cyan-500",
    preview: "from-cyan-400 to-cyan-600",
  },
  {
    value: "#ec4899",
    label: "Pink Bloom",
    color: "bg-pink-500",
    preview: "from-pink-400 to-pink-600",
  },
  {
    value: "#84cc16",
    label: "Lime Fresh",
    color: "bg-lime-500",
    preview: "from-lime-400 to-lime-600",
  },
];

// Helper function to format datetime for input
const formatDateTimeForInput = (date: Date): string => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const remainder = minutes % 15;

  if (remainder !== 0) {
    if (remainder >= 7.5) {
      // Round up
      rounded.setMinutes(minutes + (15 - remainder));
    } else {
      // Round down
      rounded.setMinutes(minutes - remainder);
    }
  }

  rounded.setSeconds(0);
  rounded.setMilliseconds(0);
  return format(rounded, "yyyy-MM-dd'T'HH:mm");
};

export function EventDialog({
  isOpen,
  onClose,
  event,
  userId,
  selectedDate,
}: EventDialogProps) {
  const { createEvent, editEvent, fetchEvents, fetchAllEvents } =
    useEventStore();
  const { token } = useAuthStore();
  const { calendars, selectedCalendar, fetchCalendars } = useCalendarStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startHour: "09",
    startMinute: "00",
    endDate: "",
    endHour: "10",
    endMinute: "00",
    allDay: false,
    location: "",
    color: "#3b82f6",
    isRecurring: false,
    allowOverlap: false,
    calendarId: "",
  });

  const [recurrenceRule, setRecurrenceRule] = useState<Partial<RecurrenceRule>>(
    {
      frequency: "WEEKLY" as const,
      interval: 1,
      daysOfWeek: [],
      endDate: undefined,
      count: undefined,
    }
  );

  const [endType, setEndType] = useState<"never" | "date" | "count">("never");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<any[]>([]);

  // Function to convert technical errors to user-friendly messages
  const formatErrorMessage = (error: string): string => {
    if (error.includes("overlaps with existing events")) {
      return "Event ini bertabrakan dengan event lain yang tidak mengizinkan tumpang tindih. Silakan pilih waktu yang berbeda atau ubah pengaturan overlap.";
    }
    if (error.includes("authentication") || error.includes("token")) {
      return "Sesi Anda telah berakhir. Silakan login kembali.";
    }
    if (error.includes("calendar not found")) {
      return "Kalender tidak ditemukan. Silakan pilih kalender yang valid.";
    }
    if (error.includes("invalid date")) {
      return "Format tanggal tidak valid. Silakan periksa kembali tanggal dan waktu.";
    }
    if (error.includes("title is required")) {
      return "Judul event wajib diisi.";
    }
    if (error.includes("end time must be after start time")) {
      return "Waktu selesai harus setelah waktu mulai.";
    }

    // Default fallback for unknown errors
    return "Terjadi kesalahan saat menyimpan event. Silakan coba lagi atau hubungi administrator.";
  };

  // Helper options for dropdowns
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const minuteOptions = [
    { value: "00", label: "00" },
    { value: "15", label: "15" },
    { value: "30", label: "30" },
    { value: "45", label: "45" },
  ];

  // Helper function to combine date and time
  const combineDateTime = (
    date: string,
    hour: string,
    minute: string
  ): Date => {
    // Create a proper ISO string and then create Date object
    const isoString = `${date}T${hour}:${minute}:00.000`;
    const dateObj = new Date(isoString);

    // Validate the date
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date created from: ${date}, ${hour}:${minute}`);
    }

    return dateObj;
  };

  // Helper function to format date for input
  const formatDateForInput = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  useEffect(() => {
    if (event) {
      // Edit mode
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);

      // Round minutes to nearest 15-minute interval for display
      const roundMinutes = (minutes: number) => {
        const rounded = Math.round(minutes / 15) * 15;
        return rounded.toString().padStart(2, "0");
      };

      setFormData({
        title: event.title,
        description: event.description || "",
        startDate: formatDateForInput(startTime),
        startHour: startTime.getHours().toString().padStart(2, "0"),
        startMinute: roundMinutes(startTime.getMinutes()),
        endDate: formatDateForInput(endTime),
        endHour: endTime.getHours().toString().padStart(2, "0"),
        endMinute: roundMinutes(endTime.getMinutes()),
        allDay: event.allDay,
        location: event.location || "",
        color: event.color,
        isRecurring: event.isRecurring,
        allowOverlap: event.allowOverlap,
        calendarId: event.calendarId,
      });

      if (event.recurrenceRule) {
        setRecurrenceRule(event.recurrenceRule);
        if (event.recurrenceRule.endDate) {
          setEndType("date");
        } else if (event.recurrenceRule.count) {
          setEndType("count");
        } else {
          setEndType("never");
        }
      }
    } else {
      // Create mode
      const today = formatDateForInput(selectedDate);

      setFormData({
        title: "",
        description: "",
        startDate: today,
        startHour: "09",
        startMinute: "00",
        endDate: today,
        endHour: "10",
        endMinute: "00",
        allDay: false,
        location: "",
        color: "#3b82f6",
        isRecurring: false,
        allowOverlap: false,
        calendarId:
          selectedCalendar?.id || (calendars.length > 0 ? calendars[0].id : ""),
      });

      setRecurrenceRule({
        frequency: "WEEKLY",
        interval: 1,
        daysOfWeek: [],
        endDate: undefined,
        count: undefined,
      });
      setEndType("never");
    }
  }, [event, selectedDate, selectedCalendar, calendars]);

  // Reset error message when dialog opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);
      setShowErrorModal(false);
      setShowOverlapModal(false);
      setOverlappingEvents([]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (!token) {
      setErrorMessage("Sesi Anda telah berakhir. Silakan login kembali.");
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    // Ensure we have a calendar ID - use selected calendar or first available
    const calendarId =
      formData.calendarId ||
      selectedCalendar?.id ||
      (calendars.length > 0 ? calendars[0].id : "");

    if (!calendarId) {
      setErrorMessage(
        "Silakan buat kalender terlebih dahulu sebelum menambah event"
      );
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    // Ensure we have valid dates
    if (!formData.startDate || !formData.endDate) {
      setErrorMessage("Tanggal mulai dan selesai harus diisi");
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    const startTime = combineDateTime(
      formData.startDate,
      formData.startHour,
      formData.startMinute
    );
    const endTime = combineDateTime(
      formData.endDate,
      formData.endHour,
      formData.endMinute
    );

    const eventData = {
      title: formData.title,
      description: formData.description,
      startTime,
      endTime,
      allDay: formData.allDay,
      location: formData.location,
      color: formData.color,
      isRecurring: formData.isRecurring,
      allowOverlap: formData.allowOverlap,
      calendarId: calendarId,
      recurrenceRule: formData.isRecurring
        ? ({
            ...recurrenceRule,
            endDate: endType === "date" ? recurrenceRule.endDate : undefined,
            count: endType === "count" ? recurrenceRule.count : undefined,
          } as RecurrenceRule)
        : undefined,
    };

    try {
      if (event) {
        await editEvent(token, event.id, eventData);
      } else {
        await createEvent(token, eventData);
      }

      // Refresh events list and calendars
      if (token && selectedCalendar) {
        const startOfMonth = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        const endOfMonth = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        );
        await fetchEvents(token, startOfMonth, endOfMonth, selectedCalendar.id);
        await fetchAllEvents(token, startOfMonth, endOfMonth);
        await fetchCalendars(token); // Refresh calendar data to update event counter
      }

      // Only close dialog if everything succeeded
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      const errorMessage = (error as Error).message;

      // Check if it's an overlap error
      if (errorMessage.includes("overlaps with existing events")) {
        // Show overlap modal - no need to log this error as it's handled by UI
        setOverlappingEvents([]);
        setShowOverlapModal(true);
      } else {
        // Handle other errors with the error modal
        console.error("Error saving event:", error);
        const friendlyMessage = formatErrorMessage(errorMessage);
        setErrorMessage(friendlyMessage);
        setShowErrorModal(true);
      }

      setIsSubmitting(false);
      // Don't close the dialog so user can fix the issue
    }
  };

  const handleDayOfWeekToggle = (day: number) => {
    const currentDays = recurrenceRule.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();

    setRecurrenceRule({ ...recurrenceRule, daysOfWeek: newDays });
  };

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] h-[95vh] max-w-none max-h-none overflow-y-auto p-0 bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-3xl">
        <div className="relative">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-12 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {event ? "Edit Event" : "Buat Event Baru"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    {event
                      ? "Perbarui detail event yang sudah ada"
                      : "Tambahkan event baru ke kalender Anda"}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-10 w-10 p-0 rounded-xl hover:bg-white/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Left Column - Basic Information */}
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Informasi Dasar
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700"
                    >
                      Judul Event *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Masukkan judul event yang menarik"
                      className="h-16 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-lg px-6"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Kalender
                    </Label>
                    <Select
                      value={
                        formData.calendarId ||
                        selectedCalendar?.id ||
                        (calendars.length > 0 ? calendars[0].id : "")
                      }
                      onValueChange={(value) =>
                        setFormData({ ...formData, calendarId: value })
                      }
                    >
                      <SelectTrigger className="h-16 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Pilih kalender" />
                      </SelectTrigger>
                      <SelectContent>
                        {calendars.map((calendar) => (
                          <SelectItem key={calendar.id} value={calendar.id}>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: calendar.color }}
                              />
                              <span>{calendar.name}</span>
                              {calendar.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Deskripsi
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Deskripsikan event Anda dengan detail..."
                      rows={5}
                      className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none px-6 py-4"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Lokasi
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Dimana event ini akan berlangsung?"
                      className="h-16 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-6"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Time Settings & Recurrence */}
              <div className="space-y-8">
                {/* Time Settings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Timer className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Waktu & Durasi
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      Interval 15 menit
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-5 bg-gray-50 rounded-xl">
                    <Checkbox
                      id="allDay"
                      checked={formData.allDay}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allDay: !!checked })
                      }
                    />
                    <Label
                      htmlFor="allDay"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Event sepanjang hari
                    </Label>
                  </div>

                  {!formData.allDay && (
                    <div className="space-y-6">
                      {/* Start Time */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-800">
                          Waktu Mulai
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-3">
                            <Label
                              htmlFor="startDate"
                              className="text-xs font-medium text-gray-600"
                            >
                              Tanggal
                            </Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  startDate: e.target.value,
                                })
                              }
                              className="h-16 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-4"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="startHour"
                              className="text-xs font-medium text-gray-600"
                            >
                              Jam
                            </Label>
                            <Select
                              value={formData.startHour}
                              onValueChange={(value: any) =>
                                setFormData({ ...formData, startHour: value })
                              }
                            >
                              <SelectTrigger className="h-16 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {hourOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="startMinute"
                              className="text-xs font-medium text-gray-600"
                            >
                              Menit
                            </Label>
                            <Select
                              value={formData.startMinute}
                              onValueChange={(value: any) =>
                                setFormData({ ...formData, startMinute: value })
                              }
                            >
                              <SelectTrigger className="h-16 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {minuteOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* End Time */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-800">
                          Waktu Selesai
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="endDate"
                              className="text-xs font-medium text-gray-600"
                            >
                              Tanggal
                            </Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  endDate: e.target.value,
                                })
                              }
                              className="h-16 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 px-4"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="endHour"
                              className="text-xs font-medium text-gray-600"
                            >
                              Jam
                            </Label>
                            <Select
                              value={formData.endHour}
                              onValueChange={(value: any) =>
                                setFormData({ ...formData, endHour: value })
                              }
                            >
                              <SelectTrigger className="h-16 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {hourOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="endMinute"
                              className="text-xs font-medium text-gray-600"
                            >
                              Menit
                            </Label>
                            <Select
                              value={formData.endMinute}
                              onValueChange={(value: any) =>
                                setFormData({ ...formData, endMinute: value })
                              }
                            >
                              <SelectTrigger className="h-16 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {minuteOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Color & Settings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                    <div className="p-2 bg-pink-50 rounded-lg">
                      <Palette className="h-5 w-5 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Tampilan & Pengaturan
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Warna Event
                    </Label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, color: option.value })
                          }
                          className={`group relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            formData.color === option.value
                              ? "border-gray-800 shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.preview} mx-auto mb-2 shadow-sm`}
                          />
                          <span className="text-xs font-medium text-gray-600 text-center block">
                            {option.label.split(" ")[1]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-5 bg-yellow-50 rounded-xl">
                    <Checkbox
                      id="allowOverlap"
                      checked={formData.allowOverlap}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allowOverlap: !!checked })
                      }
                    />
                    <Label
                      htmlFor="allowOverlap"
                      className="text-sm font-medium text-gray-700"
                    >
                      Izinkan overlap dengan event lain
                    </Label>
                  </div>
                </div>

                {/* Recurrence Settings */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 p-5 bg-blue-50 rounded-xl">
                    <Checkbox
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isRecurring: !!checked })
                      }
                    />
                    <Label
                      htmlFor="isRecurring"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Repeat className="h-4 w-4" />
                      Event berulang
                    </Label>
                  </div>

                  {formData.isRecurring && (
                    <div className="space-y-6 p-6 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Settings className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          Pengaturan Pengulangan
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Frekuensi
                          </Label>
                          <Select
                            value={recurrenceRule.frequency}
                            onValueChange={(value: any) =>
                              setRecurrenceRule({
                                ...recurrenceRule,
                                frequency: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-16 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DAILY">Harian</SelectItem>
                              <SelectItem value="WEEKLY">Mingguan</SelectItem>
                              <SelectItem value="MONTHLY">Bulanan</SelectItem>
                              <SelectItem value="YEARLY">Tahunan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Interval
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={recurrenceRule.interval}
                            onChange={(e) =>
                              setRecurrenceRule({
                                ...recurrenceRule,
                                interval: parseInt(e.target.value),
                              })
                            }
                            className="h-16 rounded-xl px-6"
                          />
                        </div>
                      </div>

                      {recurrenceRule.frequency === "WEEKLY" && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            Hari dalam seminggu
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {dayNames.map((day, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleDayOfWeekToggle(index)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  recurrenceRule.daysOfWeek?.includes(index)
                                    ? "bg-blue-600 text-white shadow-lg scale-105"
                                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Berakhir
                        </Label>
                        <Select
                          value={endType}
                          onValueChange={(value: any) => setEndType(value)}
                        >
                          <SelectTrigger className="h-16 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Tidak pernah</SelectItem>
                            <SelectItem value="date">Pada tanggal</SelectItem>
                            <SelectItem value="count">
                              Setelah berapa kali
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {endType === "date" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Tanggal berakhir
                          </Label>
                          <Input
                            type="date"
                            value={
                              recurrenceRule.endDate
                                ? format(recurrenceRule.endDate, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              setRecurrenceRule({
                                ...recurrenceRule,
                                endDate: e.target.value
                                  ? new Date(e.target.value)
                                  : undefined,
                              })
                            }
                            className="h-16 rounded-xl px-6"
                          />
                        </div>
                      )}

                      {endType === "count" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Jumlah pengulangan
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={recurrenceRule.count || ""}
                            onChange={(e) =>
                              setRecurrenceRule({
                                ...recurrenceRule,
                                count: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              })
                            }
                            className="h-16 rounded-xl px-6"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-16 rounded-xl border-gray-200 hover:bg-gray-50 text-xl"
              >
                <X className="h-6 w-6 mr-3" />
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-6 w-6 mr-3" />
                    {event ? "Update Event" : "Buat Event"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md p-0 bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogTitle className="sr-only">Error Message</DialogTitle>
          <div className="relative">
            {/* Header with red gradient */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Oops!</h2>
                  <p className="text-red-100 text-sm">Terjadi kesalahan</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Gagal Menyimpan Event
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowErrorModal(false)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 rounded-xl h-11 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Mengerti
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overlap Detection Modal */}
      <Dialog open={showOverlapModal} onOpenChange={setShowOverlapModal}>
        <DialogContent className="max-w-lg p-0 bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogTitle className="sr-only">Event Overlap Detection</DialogTitle>
          <div className="relative">
            {/* Header with orange gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Waktu Bentrok!</h2>
                  <p className="text-orange-100 text-sm">
                    Event bertabrakan dengan jadwal lain
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Event Berbenturan
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Waktu event yang Anda pilih bertabrakan dengan event lain
                    yang tidak mengizinkan tumpang tindih.
                  </p>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <h4 className="font-medium text-orange-800 mb-2">
                      💡 Solusi yang bisa dilakukan:
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Pilih waktu yang berbeda untuk event</li>
                      <li>• Ubah durasi event agar tidak bentrok</li>
                      <li>• Reschedule salah satu event yang konflik</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <Button
                onClick={() => setShowOverlapModal(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 rounded-xl h-11 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Mengerti, Pilih Waktu Lain
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
