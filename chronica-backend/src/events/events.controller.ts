import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Controller('events')
@UseGuards(AuthGuard('jwt'))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req,
  ) {
    return this.eventsService.createEvent(req.user.id, createEventDto);
  }

  @Get()
  async getEvents(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('calendarId') calendarId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.eventsService.getEvents(req.user.id, start, end, calendarId);
  }

  @Get(':id')
  async getEventById(
    @Param('id') eventId: string,
    @Request() req,
  ) {
    return this.eventsService.getEventById(req.user.id, eventId);
  }

  @Put(':id')
  async updateEvent(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventsService.updateEvent(req.user.id, eventId, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(
    @Param('id') eventId: string,
    @Request() req,
  ) {
    return this.eventsService.deleteEvent(req.user.id, eventId);
  }
} 