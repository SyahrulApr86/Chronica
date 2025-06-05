'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEventStore, Event, RecurrenceRule } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  userId: string;
  selectedDate: Date;
}

const colorOptions = [
  { value: '#3b82f6', label: 'Biru', color: 'bg-blue-500' },
  { value: '#ef4444', label: 'Merah', color: 'bg-red-500' },
  { value: '#10b981', label: 'Hijau', color: 'bg-green-500' },
  { value: '#f59e0b', label: 'Kuning', color: 'bg-yellow-500' },
  { value: '#8b5cf6', label: 'Ungu', color: 'bg-purple-500' },
  { value: '#06b6d4', label: 'Cyan', color: 'bg-cyan-500' },
];

export function EventDialog({ isOpen, onClose, event, userId, selectedDate }: EventDialogProps) {
  const { createEvent, editEvent } = useEventStore();
  const { token } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    location: '',
    color: '#3b82f6',
    isRecurring: false,
    allowOverlap: false,
  });

  const [recurrenceRule, setRecurrenceRule] = useState<Partial<RecurrenceRule>>({
    frequency: 'WEEKLY' as const,
    interval: 1,
    daysOfWeek: [],
    endDate: undefined,
    count: undefined,
  });

  const [endType, setEndType] = useState<'never' | 'date' | 'count'>('never');

  useEffect(() => {
    if (event) {
      // Edit mode
      setFormData({
        title: event.title,
        description: event.description || '',
        startTime: format(event.startTime, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(event.endTime, "yyyy-MM-dd'T'HH:mm"),
        allDay: event.allDay,
        location: event.location || '',
        color: event.color,
        isRecurring: event.isRecurring,
        allowOverlap: event.allowOverlap,
      });
      
      if (event.recurrenceRule) {
        setRecurrenceRule(event.recurrenceRule);
        if (event.recurrenceRule.endDate) {
          setEndType('date');
        } else if (event.recurrenceRule.count) {
          setEndType('count');
        } else {
          setEndType('never');
        }
      }
    } else {
      // Create mode
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = new Date(selectedDate);
      defaultEnd.setHours(10, 0, 0, 0);
      
      setFormData({
        title: '',
        description: '',
        startTime: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
        allDay: false,
        location: '',
        color: '#3b82f6',
        isRecurring: false,
        allowOverlap: false,
      });
      
      setRecurrenceRule({
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: [],
        endDate: undefined,
        count: undefined,
      });
      setEndType('never');
    }
  }, [event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      console.error('No authentication token');
      return;
    }
    
    const eventData = {
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      recurrenceRule: formData.isRecurring ? {
        ...recurrenceRule,
        endDate: endType === 'date' ? recurrenceRule.endDate : undefined,
        count: endType === 'count' ? recurrenceRule.count : undefined,
      } as RecurrenceRule : undefined,
    };

    try {
      if (event) {
        await editEvent(token, event.id, eventData);
      } else {
        await createEvent(token, eventData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDayOfWeekToggle = (day: number) => {
    const currentDays = recurrenceRule.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    setRecurrenceRule({ ...recurrenceRule, daysOfWeek: newDays });
  };

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Tambah Event Baru'}
          </DialogTitle>
          <DialogDescription>
            {event 
              ? 'Ubah detail event yang sudah ada atau atur pengulangan event.'
              : 'Buat event baru dengan detail lengkap dan atur pengulangan jika diperlukan.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Event *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul event"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi event (opsional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Lokasi event (opsional)"
              />
            </div>
          </div>

          {/* Time Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData({ ...formData, allDay: !!checked })}
              />
              <Label htmlFor="allDay">Sepanjang hari</Label>
            </div>

            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Waktu Mulai</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Waktu Selesai</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <Label>Warna Event</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: option.value })}
                  className={`w-8 h-8 rounded-full border-2 ${option.color} ${
                    formData.color === option.value ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          {/* Overlap Settings */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowOverlap"
              checked={formData.allowOverlap}
              onCheckedChange={(checked) => setFormData({ ...formData, allowOverlap: !!checked })}
            />
            <Label htmlFor="allowOverlap">Izinkan overlap dengan event lain</Label>
          </div>

          {/* Recurrence Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: !!checked })}
              />
              <Label htmlFor="isRecurring">Event berulang</Label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frekuensi</Label>
                    <Select
                      value={recurrenceRule.frequency}
                      onValueChange={(value: any) => setRecurrenceRule({ ...recurrenceRule, frequency: value })}
                    >
                      <SelectTrigger>
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
                  
                  <div>
                    <Label>Interval</Label>
                    <Input
                      type="number"
                      min="1"
                      value={recurrenceRule.interval}
                      onChange={(e) => setRecurrenceRule({ ...recurrenceRule, interval: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {recurrenceRule.frequency === 'WEEKLY' && (
                  <div>
                    <Label>Hari dalam seminggu</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dayNames.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDayOfWeekToggle(index)}
                          className={`px-3 py-1 rounded text-sm ${
                            recurrenceRule.daysOfWeek?.includes(index)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Berakhir</Label>
                  <Select value={endType} onValueChange={(value: any) => setEndType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Tidak pernah</SelectItem>
                      <SelectItem value="date">Pada tanggal</SelectItem>
                      <SelectItem value="count">Setelah berapa kali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {endType === 'date' && (
                  <div>
                    <Label>Tanggal berakhir</Label>
                    <Input
                      type="date"
                      value={recurrenceRule.endDate ? format(recurrenceRule.endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setRecurrenceRule({ 
                        ...recurrenceRule, 
                        endDate: e.target.value ? new Date(e.target.value) : undefined 
                      })}
                    />
                  </div>
                )}

                {endType === 'count' && (
                  <div>
                    <Label>Jumlah pengulangan</Label>
                    <Input
                      type="number"
                      min="1"
                      value={recurrenceRule.count || ''}
                      onChange={(e) => setRecurrenceRule({ 
                        ...recurrenceRule, 
                        count: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {event ? 'Update Event' : 'Buat Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 