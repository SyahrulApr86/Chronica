// Event where condition interfaces
export interface EventWhereCondition {
  userId: string;
  calendarId?: string;
  OR?: Array<{
    startTime?: {
      gte?: Date;
      lte?: Date;
    };
    endTime?: {
      gte?: Date;
      lte?: Date;
    };
    AND?: Array<{
      startTime?: { lte: Date };
      endTime?: { gte: Date };
    }>;
  }>;
}

// Recurrence rule interface
export interface RecurrenceRule {
  id: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  endDate?: Date | null;
  count?: number | null;
  daysOfWeek?: number[] | null;
  dayOfMonth?: number | null;
  monthOfYear?: number | null;
  exceptions?: Date[] | null;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event with recurrence rule type
export interface EventWithRecurrence {
  id: string;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string | null;
  color: string;
  isRecurring: boolean;
  allowOverlap: boolean;
  userId: string;
  calendarId: string;
  recurrenceRule?: RecurrenceRule | null;
  parentEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
