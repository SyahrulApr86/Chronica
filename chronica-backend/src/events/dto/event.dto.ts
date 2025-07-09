import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecurrenceFrequency } from '../../../generated/prisma';

export class CreateRecurrenceRuleDto {
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @IsInt()
  @Min(1)
  @IsOptional()
  interval?: number = 1;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  daysOfWeek?: number[];

  @IsInt()
  @Min(1)
  @IsOptional()
  dayOfMonth?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  monthOfYear?: number;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  count?: number;

  @IsArray()
  @IsOptional()
  exceptions?: string[];
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean = false;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  color?: string = '#3b82f6';

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean = false;

  @Type(() => CreateRecurrenceRuleDto)
  @IsOptional()
  recurrenceRule?: CreateRecurrenceRuleDto;

  @IsBoolean()
  @IsOptional()
  allowOverlap?: boolean = false;

  @IsString()
  @IsOptional()
  calendarId?: string;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @Type(() => CreateRecurrenceRuleDto)
  @IsOptional()
  recurrenceRule?: CreateRecurrenceRuleDto;

  @IsBoolean()
  @IsOptional()
  allowOverlap?: boolean;
}
