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
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserCalendars(req: any): Promise<({
        _count: {
            events: number;
        };
    } & {
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getDefaultCalendar(req: any): Promise<{
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getCalendarById(req: any, id: string): Promise<{
        events: {
            title: string;
            description: string | null;
            startTime: Date;
            endTime: Date;
            allDay: boolean;
            location: string | null;
            color: string;
            isRecurring: boolean;
            allowOverlap: boolean;
            calendarId: string;
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            parentEventId: string | null;
        }[];
        _count: {
            events: number;
        };
    } & {
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCalendar(req: any, id: string, updateCalendarDto: UpdateCalendarDto): Promise<{
        _count: {
            events: number;
        };
    } & {
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCalendar(req: any, id: string): Promise<{
        message: string;
    }>;
}
