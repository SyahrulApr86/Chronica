import { Module } from '@nestjs/common';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CalendarsController],
  providers: [CalendarsService, PrismaService],
  exports: [CalendarsService],
})
export class CalendarsModule {}
