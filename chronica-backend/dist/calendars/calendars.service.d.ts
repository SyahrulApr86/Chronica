import { PrismaService } from '../prisma.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';
export declare class CalendarsService {
    private prisma;
    constructor(prisma: PrismaService);
    createCalendar(userId: string, createCalendarDto: CreateCalendarDto): Promise<{
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserCalendars(userId: string): Promise<({
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
    getCalendarById(id: string, userId: string): Promise<{
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
    updateCalendar(id: string, userId: string, updateCalendarDto: UpdateCalendarDto): Promise<{
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteCalendar(id: string, userId: string): Promise<{
        message: string;
    }>;
    getDefaultCalendar(userId: string): Promise<{
        description: string | null;
        color: string;
        name: string;
        isDefault: boolean;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
