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
exports.CalendarsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let CalendarsService = class CalendarsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCalendar(userId, createCalendarDto) {
        if (createCalendarDto.isDefault) {
            await this.prisma.calendar.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const existingCalendars = await this.prisma.calendar.count({
            where: { userId },
        });
        const isDefault = createCalendarDto.isDefault ?? existingCalendars === 0;
        return this.prisma.calendar.create({
            data: {
                ...createCalendarDto,
                userId,
                isDefault,
            },
            include: {
                _count: {
                    select: { events: true },
                },
            },
        });
    }
    async getUserCalendars(userId) {
        return this.prisma.calendar.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { events: true },
                },
            },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });
    }
    async getCalendarById(id, userId) {
        const calendar = await this.prisma.calendar.findFirst({
            where: { id, userId },
            include: {
                events: true,
                _count: {
                    select: { events: true },
                },
            },
        });
        if (!calendar) {
            throw new common_1.NotFoundException('Calendar not found');
        }
        return calendar;
    }
    async updateCalendar(id, userId, updateCalendarDto) {
        const calendar = await this.prisma.calendar.findFirst({
            where: { id, userId },
        });
        if (!calendar) {
            throw new common_1.NotFoundException('Calendar not found');
        }
        if (updateCalendarDto.isDefault) {
            await this.prisma.calendar.updateMany({
                where: { userId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }
        return this.prisma.calendar.update({
            where: { id },
            data: updateCalendarDto,
            include: {
                _count: {
                    select: { events: true },
                },
            },
        });
    }
    async deleteCalendar(id, userId) {
        const calendar = await this.prisma.calendar.findFirst({
            where: { id, userId },
            include: {
                _count: {
                    select: { events: true },
                },
            },
        });
        if (!calendar) {
            throw new common_1.NotFoundException('Calendar not found');
        }
        if (calendar._count.events > 0) {
            throw new common_1.BadRequestException('Cannot delete calendar with existing events');
        }
        const totalCalendars = await this.prisma.calendar.count({
            where: { userId },
        });
        if (totalCalendars <= 1) {
            throw new common_1.BadRequestException('Cannot delete the last calendar');
        }
        if (calendar.isDefault) {
            const nextCalendar = await this.prisma.calendar.findFirst({
                where: { userId, id: { not: id } },
                orderBy: { createdAt: 'asc' },
            });
            if (nextCalendar) {
                await this.prisma.calendar.update({
                    where: { id: nextCalendar.id },
                    data: { isDefault: true },
                });
            }
        }
        await this.prisma.calendar.delete({
            where: { id },
        });
        return { message: 'Calendar deleted successfully' };
    }
    async getDefaultCalendar(userId) {
        const defaultCalendar = await this.prisma.calendar.findFirst({
            where: { userId, isDefault: true },
        });
        return defaultCalendar;
    }
};
exports.CalendarsService = CalendarsService;
exports.CalendarsService = CalendarsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarsService);
//# sourceMappingURL=calendars.service.js.map