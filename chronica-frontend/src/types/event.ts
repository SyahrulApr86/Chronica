export interface RecurrenceRule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[];
}

export interface Event {
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

export default Event; 