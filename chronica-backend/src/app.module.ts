import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { CalendarsModule } from './calendars/calendars.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [EventsModule, AuthModule, CalendarsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
