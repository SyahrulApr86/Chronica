"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const prisma_1 = require("../../generated/prisma");
const calendars_service_1 = require("../calendars/calendars.service");
let EventsService = class EventsService {
    prisma;
    calendarsService;
    constructor(prisma, calendarsService) {
        this.prisma = prisma;
        this.calendarsService = calendarsService;
    }
    async createEvent(userId, createEventDto) {
        const startTime = new Date(createEventDto.startTime);
        const endTime = new Date(createEventDto.endTime);
        const calendarId = createEventDto.calendarId;
        if (!calendarId) {
            throw new BadRequestException('Calendar ID is required. Please select a calendar first.');
        }
        if (!createEventDto.allowOverlap) {
            await this.checkForOverlap(userId, startTime, endTime, undefined, calendarId);
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
                            endDate: createEventDto.recurrenceRule.endDate ? new Date(createEventDto.recurrenceRule.endDate) : undefined,
                            count: createEventDto.recurrenceRule.count,
                            exceptions: createEventDto.recurrenceRule.exceptions?.map(date => new Date(date)) || [],
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
    async getEvents(userId, startDate, endDate, calendarId) {
        const where = { userId };
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
        const expandedEvents = [];
        for (const event of events) {
            if (event.isRecurring && event.recurrenceRule) {
                const instances = this.generateRecurringInstances(event, startDate, endDate);
                expandedEvents.push(...instances);
            }
            else {
                expandedEvents.push(event);
            }
        }
        return expandedEvents;
    }
    async getEventById(userId, eventId) {
        const event = await this.prisma.event.findFirst({
            where: {
                id: eventId,
                userId,
            },
            include: {
                recurrenceRule: true,
                user: true,
            },
        });
        if (!event) {
            throw new common_1.NotFoundException('Event not found');
        }
        return event;
    }
    async updateEvent(userId, eventId, updateEventDto) {
        const existingEvent = await this.getEventById(userId, eventId);
        const startTime = updateEventDto.startTime ? new Date(updateEventDto.startTime) : existingEvent.startTime;
        const endTime = updateEventDto.endTime ? new Date(updateEventDto.endTime) : existingEvent.endTime;
        if (updateEventDto.allowOverlap === false || (!updateEventDto.allowOverlap && !existingEvent.allowOverlap)) {
            if (updateEventDto.startTime || updateEventDto.endTime) {
                await this.checkForOverlap(userId, startTime, endTime, eventId);
            }
        }
        const event = await this.prisma.event.update({
            where: { id: eventId },
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
                                endDate: updateEventDto.recurrenceRule.endDate ? new Date(updateEventDto.recurrenceRule.endDate) : undefined,
                                count: updateEventDto.recurrenceRule.count,
                                exceptions: updateEventDto.recurrenceRule.exceptions?.map(date => new Date(date)) || [],
                            },
                            update: {
                                frequency: updateEventDto.recurrenceRule.frequency,
                                interval: updateEventDto.recurrenceRule.interval || 1,
                                daysOfWeek: updateEventDto.recurrenceRule.daysOfWeek || [],
                                dayOfMonth: updateEventDto.recurrenceRule.dayOfMonth,
                                monthOfYear: updateEventDto.recurrenceRule.monthOfYear,
                                endDate: updateEventDto.recurrenceRule.endDate ? new Date(updateEventDto.recurrenceRule.endDate) : undefined,
                                count: updateEventDto.recurrenceRule.count,
                                exceptions: updateEventDto.recurrenceRule.exceptions?.map(date => new Date(date)) || [],
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
    async deleteEvent(userId, eventId) {
        const event = await this.getEventById(userId, eventId);
        await this.prisma.event.delete({
            where: { id: eventId },
        });
    }
    async checkForOverlap(userId, startTime, endTime, excludeEventId, calendarId) {
        const overlappingEvents = await this.prisma.event.findMany({
            where: {
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
                        AND: [
                            { startTime: { lt: endTime } },
                            { endTime: { gte: endTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { gte: startTime } },
                            { endTime: { lte: endTime } },
                        ],
                    },
                ],
            },
        });
        if (overlappingEvents.length > 0) {
            throw new common_1.ConflictException('Event overlaps with existing events that do not allow overlap');
        }
    }
    generateRecurringInstances(event, startDate, endDate) {
        if (!event.recurrenceRule)
            return [event];
        const instances = [];
        const rule = event.recurrenceRule;
        const eventDuration = event.endTime.getTime() - event.startTime.getTime();
        let currentDate = new Date(event.startTime);
        const maxDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        const minDate = startDate || new Date(0);
        let count = 0;
        const maxCount = rule.count || 1000;
        while (currentDate <= maxDate && count < maxCount) {
            if (currentDate >= minDate) {
                const isException = rule.exceptions.some((exception) => exception.toDateString() === currentDate.toDateString());
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
            currentDate = this.getNextOccurrence(currentDate, rule);
            count++;
            if (rule.endDate && currentDate > rule.endDate) {
                break;
            }
        }
        return instances;
    }
    getNextOccurrence(currentDate, rule) {
        const nextDate = new Date(currentDate);
        switch (rule.frequency) {
            case prisma_1.RecurrenceFrequency.DAILY:
                nextDate.setDate(nextDate.getDate() + rule.interval);
                break;
            case prisma_1.RecurrenceFrequency.WEEKLY:
                if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
                    const currentDay = nextDate.getDay();
                    const sortedDays = rule.daysOfWeek.sort((a, b) => a - b);
                    let nextDay = sortedDays.find((day) => day > currentDay);
                    if (!nextDay) {
                        nextDay = sortedDays[0];
                        nextDate.setDate(nextDate.getDate() + (7 * rule.interval));
                    }
                    const daysToAdd = nextDay - currentDay;
                    nextDate.setDate(nextDate.getDate() + daysToAdd);
                }
                else {
                    nextDate.setDate(nextDate.getDate() + (7 * rule.interval));
                }
                break;
            case prisma_1.RecurrenceFrequency.MONTHLY:
                if (rule.dayOfMonth) {
                    nextDate.setMonth(nextDate.getMonth() + rule.interval);
                    nextDate.setDate(rule.dayOfMonth);
                }
                else {
                    nextDate.setMonth(nextDate.getMonth() + rule.interval);
                }
                break;
            case prisma_1.RecurrenceFrequency.YEARLY:
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        calendars_service_1.CalendarsService])
], EventsService);
//# sourceMappingURL=events.service.js.map