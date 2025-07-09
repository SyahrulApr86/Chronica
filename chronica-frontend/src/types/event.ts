export interface RecurrenceRule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[];
}

export interface Calendar {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id?: string;
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
  recurringPattern?: string;
  recurringEndDate?: Date;
  recurrenceRule?: RecurrenceRule;
}

export default CalendarEvent;
