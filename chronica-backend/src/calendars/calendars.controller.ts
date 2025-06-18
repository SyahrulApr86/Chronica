import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';

@Controller('calendars')
@UseGuards(AuthGuard('jwt'))
export class CalendarsController {
  constructor(private calendarsService: CalendarsService) {}

  @Post()
  async createCalendar(@Request() req, @Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarsService.createCalendar(req.user.id, createCalendarDto);
  }

  @Get()
  async getUserCalendars(@Request() req) {
    return this.calendarsService.getUserCalendars(req.user.id);
  }

  @Get('default')
  async getDefaultCalendar(@Request() req) {
    return this.calendarsService.getDefaultCalendar(req.user.id);
  }

  @Get(':id')
  async getCalendarById(@Request() req, @Param('id') id: string) {
    return this.calendarsService.getCalendarById(id, req.user.id);
  }

  @Put(':id')
  async updateCalendar(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    return this.calendarsService.updateCalendar(id, req.user.id, updateCalendarDto);
  }

  @Delete(':id')
  async deleteCalendar(@Request() req, @Param('id') id: string) {
    return this.calendarsService.deleteCalendar(id, req.user.id);
  }
} 