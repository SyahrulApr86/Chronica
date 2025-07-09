import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { Event, RecurrenceFrequency } from '../../generated/prisma';
import { CalendarsService } from '../calendars/calendars.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private calendarsService: CalendarsService,
  ) {}

  async createEvent(
    userId: string,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    const startTime = new Date(createEventDto.startTime);
    const endTime = new Date(createEventDto.endTime);

    // Get calendar ID - use provided or throw error if none
    const calendarId = createEventDto.calendarId;
    if (!calendarId) {
      throw new BadRequestException(
        'Calendar ID is required. Please select a calendar first.',
      );
    }

    // Check for overlapping events if overlap is not allowed
    if (!createEventDto.allowOverlap) {
      await this.checkForOverlap(
        userId,
        startTime,
        endTime,
        undefined,
        calendarId,
      );
    }

    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        startTime,
        endTime,
        allDay: createEventDto.allDay || false,
        location: createEventDto.location,
        color: createEventDto.color || '#3b82f6',
        isRecurring: createEventDto.isRecurring || false,
        allowOverlap: createEventDto.allowOverlap || false,
        userId,
        calendarId,
        recurrenceRule: createEventDto.recurrenceRule
          ? {
              create: {
                frequency: createEventDto.recurrenceRule.frequency,
                interval: createEventDto.recurrenceRule.interval || 1,
                daysOfWeek: createEventDto.recurrenceRule.daysOfWeek || [],
                dayOfMonth: createEventDto.recurrenceRule.dayOfMonth,
                monthOfYear: createEventDto.recurrenceRule.monthOfYear,
                endDate: createEventDto.recurrenceRule.endDate
                  ? new Date(createEventDto.recurrenceRule.endDate)
                  : undefined,
                count: createEventDto.recurrenceRule.count,
                exceptions:
                  createEventDto.recurrenceRule.exceptions?.map(
                    (date) => new Date(date),
                  ) || [],
              },
            }
          : undefined,
      },
      include: {
        recurrenceRule: true,
        user: true,
      },
    });

    return event;
  }

  async getEvents(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    calendarId?: string,
  ): Promise<Event[]> {
    const where: any = { userId };

    if (calendarId) {
      where.calendarId = calendarId;
    }

    if (startDate && endDate) {
      where.OR = [
        {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          endTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          AND: [
            { startTime: { lte: startDate } },
            { endTime: { gte: endDate } },
          ],
        },
      ];
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        recurrenceRule: true,
        user: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Generate recurring event instances
    const expandedEvents: Event[] = [];
    for (const event of events) {
      if (event.isRecurring && event.recurrenceRule) {
        const instances = this.generateRecurringInstances(
          event,
          startDate,
          endDate,
        );
        expandedEvents.push(...instances);
      } else {
        expandedEvents.push(event);
      }
    }

    return expandedEvents;
  }

  async getAllEvents(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Event[]> {
    const where: any = { userId };

    if (startDate && endDate) {
      where.OR = [
        {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          endTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          AND: [
            { startTime: { lte: startDate } },
            { endTime: { gte: endDate } },
          ],
        },
      ];
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        recurrenceRule: true,
        user: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Generate recurring event instances
    const expandedEvents: Event[] = [];
    for (const event of events) {
      if (event.isRecurring && event.recurrenceRule) {
        const instances = this.generateRecurringInstances(
          event,
          startDate,
          endDate,
        );
        expandedEvents.push(...instances);
      } else {
        expandedEvents.push(event);
      }
    }

    return expandedEvents;
  }

  async getEventById(userId: string, eventId: string): Promise<Event> {
    // Handle recurring event instances
    let actualEventId = eventId;

    // If this is a recurring event instance (contains underscore), extract the original event ID
    if (eventId.includes('_')) {
      actualEventId = eventId.split('_')[0];
    }

    const event = await this.prisma.event.findFirst({
      where: {
        id: actualEventId,
        userId,
      },
      include: {
        recurrenceRule: true,
        user: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async updateEvent(
    userId: string,
    eventId: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    // Handle recurring event instances
    let actualEventId = eventId;

    // If this is a recurring event instance (contains underscore), extract the original event ID
    if (eventId.includes('_')) {
      actualEventId = eventId.split('_')[0];
    }

    const existingEvent = await this.getEventById(userId, actualEventId);

    const startTime = updateEventDto.startTime
      ? new Date(updateEventDto.startTime)
      : existingEvent.startTime;
    const endTime = updateEventDto.endTime
      ? new Date(updateEventDto.endTime)
      : existingEvent.endTime;

    // Check for overlapping events if overlap is not allowed
    if (
      updateEventDto.allowOverlap === false ||
      (!updateEventDto.allowOverlap && !existingEvent.allowOverlap)
    ) {
      if (updateEventDto.startTime || updateEventDto.endTime) {
        await this.checkForOverlap(
          userId,
          startTime,
          endTime,
          actualEventId,
          existingEvent.calendarId,
        );
      }
    }

    const event = await this.prisma.event.update({
      where: { id: actualEventId },
      data: {
        title: updateEventDto.title,
        description: updateEventDto.description,
        startTime,
        endTime,
        allDay: updateEventDto.allDay,
        location: updateEventDto.location,
        color: updateEventDto.color,
        isRecurring: updateEventDto.isRecurring,
        allowOverlap: updateEventDto.allowOverlap,
        recurrenceRule: updateEventDto.recurrenceRule
          ? {
              upsert: {
                create: {
                  frequency: updateEventDto.recurrenceRule.frequency,
                  interval: updateEventDto.recurrenceRule.interval || 1,
                  daysOfWeek: updateEventDto.recurrenceRule.daysOfWeek || [],
                  dayOfMonth: updateEventDto.recurrenceRule.dayOfMonth,
                  monthOfYear: updateEventDto.recurrenceRule.monthOfYear,
                  endDate: updateEventDto.recurrenceRule.endDate
                    ? new Date(updateEventDto.recurrenceRule.endDate)
                    : undefined,
                  count: updateEventDto.recurrenceRule.count,
                  exceptions:
                    updateEventDto.recurrenceRule.exceptions?.map(
                      (date) => new Date(date),
                    ) || [],
                },
                update: {
                  frequency: updateEventDto.recurrenceRule.frequency,
                  interval: updateEventDto.recurrenceRule.interval || 1,
                  daysOfWeek: updateEventDto.recurrenceRule.daysOfWeek || [],
                  dayOfMonth: updateEventDto.recurrenceRule.dayOfMonth,
                  monthOfYear: updateEventDto.recurrenceRule.monthOfYear,
                  endDate: updateEventDto.recurrenceRule.endDate
                    ? new Date(updateEventDto.recurrenceRule.endDate)
                    : undefined,
                  count: updateEventDto.recurrenceRule.count,
                  exceptions:
                    updateEventDto.recurrenceRule.exceptions?.map(
                      (date) => new Date(date),
                    ) || [],
                },
              },
            }
          : undefined,
      },
      include: {
        recurrenceRule: true,
        user: true,
      },
    });

    return event;
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    // Handle recurring event instances
    let actualEventId = eventId;

    // If this is a recurring event instance (contains underscore), extract the original event ID
    if (eventId.includes('_')) {
      actualEventId = eventId.split('_')[0];
    }

    const event = await this.getEventById(userId, actualEventId);

    await this.prisma.event.delete({
      where: { id: actualEventId },
    });
  }

  private async checkForOverlap(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeEventId?: string,
    calendarId?: string,
  ): Promise<void> {
    const whereClause: any = {
      userId,
      id: excludeEventId ? { not: excludeEventId } : undefined,
      allowOverlap: false,
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    };

    // Only check for overlap within the same calendar
    if (calendarId) {
      whereClause.calendarId = calendarId;
    }

    const overlappingEvents = await this.prisma.event.findMany({
      where: whereClause,
    });

    if (overlappingEvents.length > 0) {
      throw new ConflictException(
        'Event overlaps with existing events that do not allow overlap',
      );
    }
  }

  private generateRecurringInstances(
    event: any,
    startDate?: Date,
    endDate?: Date,
  ): Event[] {
    if (!event.recurrenceRule) return [event];

    const instances: Event[] = [];
    const rule = event.recurrenceRule;
    const eventDuration = event.endTime.getTime() - event.startTime.getTime();

    let currentDate = new Date(event.startTime);
    const maxDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    const minDate = startDate || new Date(0);

    let count = 0;
    const maxCount = rule.count || 1000; // Prevent infinite loops

    while (currentDate <= maxDate && count < maxCount) {
      if (currentDate >= minDate) {
        // Check if this date is not in exceptions
        const isException = rule.exceptions.some(
          (exception: Date) =>
            exception.toDateString() === currentDate.toDateString(),
        );

        if (!isException) {
          const instanceStart = new Date(currentDate);
          const instanceEnd = new Date(currentDate.getTime() + eventDuration);

          instances.push({
            ...event,
            id: `${event.id}_${currentDate.toISOString()}`,
            startTime: instanceStart,
            endTime: instanceEnd,
          });
        }
      }

      // Calculate next occurrence
      currentDate = this.getNextOccurrence(currentDate, rule);
      count++;

      if (rule.endDate && currentDate > rule.endDate) {
        break;
      }
    }

    return instances;
  }

  private getNextOccurrence(currentDate: Date, rule: any): Date {
    const nextDate = new Date(currentDate);

    switch (rule.frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + rule.interval);
        break;

      case RecurrenceFrequency.WEEKLY:
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          // Find next day of week
          const currentDay = nextDate.getDay();
          const sortedDays = rule.daysOfWeek.sort(
            (a: number, b: number) => a - b,
          );

          let nextDay = sortedDays.find((day: number) => day > currentDay);
          if (!nextDay) {
            nextDay = sortedDays[0];
            nextDate.setDate(nextDate.getDate() + 7 * rule.interval);
          }

          const daysToAdd = nextDay - currentDay;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else {
          nextDate.setDate(nextDate.getDate() + 7 * rule.interval);
        }
        break;

      case RecurrenceFrequency.MONTHLY:
        if (rule.dayOfMonth) {
          nextDate.setMonth(nextDate.getMonth() + rule.interval);
          nextDate.setDate(rule.dayOfMonth);
        } else {
          nextDate.setMonth(nextDate.getMonth() + rule.interval);
        }
        break;

      case RecurrenceFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + rule.interval);
        if (rule.monthOfYear) {
          nextDate.setMonth(rule.monthOfYear - 1);
        }
        if (rule.dayOfMonth) {
          nextDate.setDate(rule.dayOfMonth);
        }
        break;
    }

    return nextDate;
  }
}
