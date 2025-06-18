'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Calendar as CalendarIcon, Edit, Trash2, Check } from 'lucide-react';

interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  _count: {
    events: number;
  };
}

interface CalendarSelectorProps {
  calendars: Calendar[];
  selectedCalendar: Calendar | null;
  onCalendarSelect: (calendar: Calendar) => void;
  onCalendarCreate: (calendar: { name: string; description?: string; color: string }) => void;
  onCalendarUpdate: (id: string, calendar: { name?: string; description?: string; color?: string; isDefault?: boolean }) => void;
  onCalendarDelete: (id: string) => void;
}

const CALENDAR_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
];

export function CalendarSelector({
  calendars,
  selectedCalendar,
  onCalendarSelect,
  onCalendarCreate,
  onCalendarUpdate,
  onCalendarDelete,
}: CalendarSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  const handleCreateCalendar = () => {
    if (formData.name.trim()) {
      onCalendarCreate(formData);
      setFormData({ name: '', description: '', color: '#3b82f6' });
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditCalendar = () => {
    if (editingCalendar && formData.name.trim()) {
      onCalendarUpdate(editingCalendar.id, formData);
      setIsEditDialogOpen(false);
      setEditingCalendar(null);
      setFormData({ name: '', description: '', color: '#3b82f6' });
    }
  };

  const openEditDialog = (calendar: Calendar) => {
    setEditingCalendar(calendar);
    setFormData({
      name: calendar.name,
      description: calendar.description || '',
      color: calendar.color,
    });
    setIsEditDialogOpen(true);
  };

  const handleSetDefault = (calendar: Calendar) => {
    onCalendarUpdate(calendar.id, { isDefault: true });
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent pointer-events-none"></div>
      <CardHeader className="relative pb-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border-b border-white/20">
        <CardTitle className="text-xl font-black text-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Kalender Saya
            </span>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Buat Kalender Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Kalender</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama kalender"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deskripsi kalender"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Warna</Label>
                  <div className="flex gap-2 mt-2">
                    {CALENDAR_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateCalendar} className="flex-1">
                    Buat Kalender
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {calendars.map((calendar) => (
            <div
              key={calendar.id}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg ${
                selectedCalendar?.id === calendar.id
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md'
                  : 'bg-white/60 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onCalendarSelect(calendar)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: calendar.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{calendar.name}</span>
                    {calendar.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{calendar._count.events} events</span>
                    {calendar.description && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{calendar.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!calendar.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(calendar);
                    }}
                    className="h-8 w-8 p-0 hover:bg-green-100"
                    title="Set as default"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(calendar);
                  }}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>
                {calendars.length > 1 && calendar._count.events === 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCalendarDelete(calendar.id);
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kalender</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Kalender</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama kalender"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi (Opsional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi kalender"
                rows={3}
              />
            </div>
            <div>
              <Label>Warna</Label>
              <div className="flex gap-2 mt-2">
                {CALENDAR_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditCalendar} className="flex-1">
                Simpan Perubahan
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 