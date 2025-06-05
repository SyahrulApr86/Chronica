import { PrismaService } from '../prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { Event } from '../../generated/prisma';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    createEvent(userId: string, createEventDto: CreateEventDto): Promise<Event>;
    getEvents(userId: string, startDate?: Date, endDate?: Date): Promise<Event[]>;
    getEventById(userId: string, eventId: string): Promise<Event>;
    updateEvent(userId: string, eventId: string, updateEventDto: UpdateEventDto): Promise<Event>;
    deleteEvent(userId: string, eventId: string): Promise<void>;
    private checkForOverlap;
    private generateRecurringInstances;
    private getNextOccurrence;
}
