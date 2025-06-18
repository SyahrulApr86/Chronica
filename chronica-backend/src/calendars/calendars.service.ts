import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';

@Injectable()
export class CalendarsService {
  constructor(private prisma: PrismaService) {}

  async createCalendar(userId: string, createCalendarDto: CreateCalendarDto) {
    // If this is marked as default, unset other default calendars
    if (createCalendarDto.isDefault) {
      await this.prisma.calendar.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the user's first calendar, make it default
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
    });
  }

  async getUserCalendars(userId: string) {
    return this.prisma.calendar.findMany({
      where: { userId },
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async getCalendarById(id: string, userId: string) {
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
      throw new NotFoundException('Calendar not found');
    }

    return calendar;
  }

  async updateCalendar(id: string, userId: string, updateCalendarDto: UpdateCalendarDto) {
    const calendar = await this.prisma.calendar.findFirst({
      where: { id, userId },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    // If setting as default, unset other default calendars
    if (updateCalendarDto.isDefault) {
      await this.prisma.calendar.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.calendar.update({
      where: { id },
      data: updateCalendarDto,
    });
  }

  async deleteCalendar(id: string, userId: string) {
    const calendar = await this.prisma.calendar.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    // Prevent deletion if calendar has events
    if (calendar._count.events > 0) {
      throw new BadRequestException('Cannot delete calendar with existing events');
    }

    // Prevent deletion of the last calendar
    const totalCalendars = await this.prisma.calendar.count({
      where: { userId },
    });

    if (totalCalendars <= 1) {
      throw new BadRequestException('Cannot delete the last calendar');
    }

    // If deleting default calendar, set another calendar as default
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

  async getDefaultCalendar(userId: string) {
    const defaultCalendar = await this.prisma.calendar.findFirst({
      where: { userId, isDefault: true },
    });

    return defaultCalendar;
  }
} 