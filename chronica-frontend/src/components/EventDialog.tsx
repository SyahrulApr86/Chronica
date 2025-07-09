"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Repeat,
  Settings,
  Save,
  X,
  Palette,
} from "lucide-react";
import useEventStore from "@/store/eventStore";
import useCalendarStore from "@/store/calendarStore";
import { useAuthStore } from "@/store/authStore";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  selectedDate: Date;
}

interface Event {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  color: string;
  calendarId: string;
  allowOverlap: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: Date;
  recurrenceRule?: RecurrenceRule;
}

interface RecurrenceRule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[];
}

export function EventDialog({
  isOpen,
  onClose,
  event,
  selectedDate,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState<Date>(selectedDate);
  const [endTime, setEndTime] = useState<Date>(selectedDate);
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [allowOverlap, setAllowOverlap] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<Partial<RecurrenceRule>>(
    {
      frequency: "DAILY",
      interval: 1,
    }
  );

  const { createEvent, updateEvent } = useEventStore();
  const { selectedCalendar } = useCalendarStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartTime(new Date(event.startTime));
      setEndTime(new Date(event.endTime));
      setAllDay(event.allDay);
      setLocation(event.location || "");
      setColor(event.color);
      setAllowOverlap(event.allowOverlap);
      setIsRecurring(event.isRecurring);
      if (event.recurrenceRule) {
        setRecurrenceRule(event.recurrenceRule);
      }
    } else {
      setTitle("");
      setDescription("");
      setStartTime(selectedDate);
      setEndTime(selectedDate);
      setAllDay(false);
      setLocation("");
      setColor("#3B82F6");
      setAllowOverlap(true);
      setIsRecurring(false);
      setRecurrenceRule({
        frequency: "DAILY",
        interval: 1,
      });
    }
  }, [event, selectedDate]);

  const handleSubmit = async () => {
    if (!selectedCalendar || !token) return;

    const eventData = {
      title,
      description: description || undefined,
      startTime,
      endTime,
      allDay,
      location: location || undefined,
      color,
      calendarId: selectedCalendar.id,
      allowOverlap,
      isRecurring,
      ...(isRecurring && {
        recurrenceRule: {
          ...recurrenceRule,
          endDate: recurrenceRule.endDate,
          count: recurrenceRule.count,
          daysOfWeek: recurrenceRule.daysOfWeek,
        },
      }),
    };

    try {
      if (event) {
        await updateEvent(token, event.id!, eventData);
      } else {
        await createEvent(token, eventData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white/80 backdrop-blur-xl rounded-[2rem] border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-[2rem] pointer-events-none"></div>
        <div className="relative">
          <DialogTitle className="text-2xl font-black text-gray-800 mb-6">
            {event ? "Edit Event" : "Tambah Event"}
          </DialogTitle>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Judul
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
                placeholder="Masukkan judul event"
              />
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Deskripsi
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                placeholder="Masukkan deskripsi event (opsional)"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="startTime"
                  className="text-sm font-medium text-gray-700"
                >
                  Waktu Mulai
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={format(startTime, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setStartTime(new Date(e.target.value))}
                    className="pl-10"
                    disabled={allDay}
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="endTime"
                  className="text-sm font-medium text-gray-700"
                >
                  Waktu Selesai
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={format(endTime, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setEndTime(new Date(e.target.value))}
                    className="pl-10"
                    disabled={allDay}
                  />
                </div>
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(checked as boolean)}
              />
              <Label
                htmlFor="allDay"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Sepanjang hari
              </Label>
            </div>

            {/* Location */}
            <div>
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700"
              >
                Lokasi
              </Label>
              <div className="mt-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  placeholder="Masukkan lokasi (opsional)"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <Label
                htmlFor="color"
                className="text-sm font-medium text-gray-700"
              >
                Warna
              </Label>
              <div className="mt-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Palette className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Allow Overlap */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowOverlap"
                checked={allowOverlap}
                onCheckedChange={(checked) =>
                  setAllowOverlap(checked as boolean)
                }
              />
              <Label
                htmlFor="allowOverlap"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Izinkan tumpang tindih dengan event lain
              </Label>
            </div>

            {/* Recurrence */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) =>
                    setIsRecurring(checked as boolean)
                  }
                />
                <Label
                  htmlFor="isRecurring"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Event berulang
                </Label>
              </div>

              {isRecurring && (
                <div className="pl-6 space-y-4">
                  {/* Frequency */}
                  <div>
                    <Label
                      htmlFor="frequency"
                      className="text-sm font-medium text-gray-700"
                    >
                      Frekuensi
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Repeat className="h-4 w-4 text-gray-400" />
                      </div>
                      <Select
                        value={recurrenceRule.frequency}
                        onValueChange={(value) =>
                          setRecurrenceRule({
                            ...recurrenceRule,
                            frequency: value as RecurrenceRule["frequency"],
                          })
                        }
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Pilih frekuensi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Harian</SelectItem>
                          <SelectItem value="WEEKLY">Mingguan</SelectItem>
                          <SelectItem value="MONTHLY">Bulanan</SelectItem>
                          <SelectItem value="YEARLY">Tahunan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Interval */}
                  <div>
                    <Label
                      htmlFor="interval"
                      className="text-sm font-medium text-gray-700"
                    >
                      Interval
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Settings className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="interval"
                        type="number"
                        min={1}
                        value={recurrenceRule.interval}
                        onChange={(e) =>
                          setRecurrenceRule({
                            ...recurrenceRule,
                            interval: parseInt(e.target.value),
                          })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <Label
                      htmlFor="endDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tanggal Berakhir
                    </Label>
                    <div className="mt-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="endDate"
                        type="date"
                        value={
                          recurrenceRule.endDate
                            ? format(
                                new Date(recurrenceRule.endDate),
                                "yyyy-MM-dd"
                              )
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
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl shadow-lg"
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
