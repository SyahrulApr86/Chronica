import { PrismaService } from '../prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { Event } from '../../generated/prisma';
import { CalendarsService } from '../calendars/calendars.service';
export declare class EventsService {
    private prisma;
    private calendarsService;
    constructor(prisma: PrismaService, calendarsService: CalendarsService);
    createEvent(userId: string, createEventDto: CreateEventDto): Promise<Event>;
    getEvents(userId: string, startDate?: Date, endDate?: Date, calendarId?: string): Promise<Event[]>;
    getEventById(userId: string, eventId: string): Promise<Event>;
    updateEvent(userId: string, eventId: string, updateEventDto: UpdateEventDto): Promise<Event>;
    deleteEvent(userId: string, eventId: string): Promise<void>;
    private checkForOverlap;
    private generateRecurringInstances;
    private getNextOccurrence;
}
