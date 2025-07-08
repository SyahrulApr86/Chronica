import { PrismaService } from '../prisma.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';
export declare class CalendarsService {
    private prisma;
    constructor(prisma: PrismaService);
    createCalendar(userId: string, createCalendarDto: CreateCalendarDto): Promise<{
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
    getUserCalendars(userId: string): Promise<({
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
    getCalendarById(id: string, userId: string): Promise<{
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
    updateCalendar(id: string, userId: string, updateCalendarDto: UpdateCalendarDto): Promise<{
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
    deleteCalendar(id: string, userId: string): Promise<{
        message: string;
    }>;
    getDefaultCalendar(userId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        color: string;
        isDefault: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
