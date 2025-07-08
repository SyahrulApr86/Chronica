import { CalendarsService } from './calendars.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';
export declare class CalendarsController {
    private calendarsService;
    constructor(calendarsService: CalendarsService);
    createCalendar(req: any, createCalendarDto: CreateCalendarDto): Promise<{
        _count: {
            events: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        color: string;
        isDefault: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserCalendars(req: any): Promise<({
        _count: {
            events: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        color: string;
        isDefault: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getDefaultCalendar(req: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        color: string;
        isDefault: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getCalendarById(req: any, id: string): Promise<{
        events: {
            id: string;
            description: string | null;
            color: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            startTime: Date;
            endTime: Date;
            allDay: boolean;
            location: string | null;
            isRecurring: boolean;
            allowOverlap: boolean;
            calendarId: string;
            parentEventId: string | null;
        }[];
        _count: {
            events: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        color: string;
        isDefault: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCalendar(req: any, id: string, updateCalendarDto: UpdateCalendarDto): Promise<{
        _count: {
            events: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        color: string;
        isDefault: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCalendar(req: any, id: string): Promise<{
        message: string;
    }>;
}
