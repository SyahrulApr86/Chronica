export interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  isDefault: boolean;
  _count?: {
    events: number;
  };
}

export interface RecurrenceRule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  endDate?: Date;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  monthsOfYear?: number[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  color: string;
  calendarId: string;
  calendar?: Calendar;
  allowOverlap: boolean;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  parentEventId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
