import { RecurrenceFrequency } from '../../../generated/prisma';
export declare class CreateRecurrenceRuleDto {
    frequency: RecurrenceFrequency;
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    monthOfYear?: number;
    endDate?: string;
    count?: number;
    exceptions?: string[];
}
export declare class CreateEventDto {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    allDay?: boolean;
    location?: string;
    color?: string;
    isRecurring?: boolean;
    recurrenceRule?: CreateRecurrenceRuleDto;
    allowOverlap?: boolean;
    calendarId?: string;
}
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    location?: string;
    color?: string;
    isRecurring?: boolean;
    recurrenceRule?: CreateRecurrenceRuleDto;
    allowOverlap?: boolean;
}
