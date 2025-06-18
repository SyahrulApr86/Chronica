import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { CalendarsModule } from '../calendars/calendars.module';

@Module({
  imports: [CalendarsModule],
  controllers: [EventsController],
  providers: [EventsService, PrismaService],
})
export class EventsModule {} 