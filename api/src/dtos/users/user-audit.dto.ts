import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityLogAction } from '../../enums/shared/activity-log-action-enum';

export class AuditLogEntryDto {
  @Expose()
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Expose()
  @ApiProperty({ enum: ActivityLogAction, enumName: 'ActivityLogAction' })
  @IsString()
  action: ActivityLogAction;

  @Expose()
  @ApiPropertyOptional()
  metadata?: any;
}

export class AppSubmissionDto {
  @Expose()
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  submissionDate: Date;

  @Expose()
  @ApiProperty()
  @IsString()
  listingName: string;

  @Expose()
  @ApiProperty()
  @IsString()
  confirmationCode: string;

  @Expose()
  @ApiPropertyOptional()
  ranking?: number;
}

export class UserAuditDto {
  @Expose()
  @ApiProperty({ type: AuditLogEntryDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuditLogEntryDto)
  loginAttempts: AuditLogEntryDto[];

  @Expose()
  @ApiProperty({ type: AppSubmissionDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppSubmissionDto)
  appSubmissions: AppSubmissionDto[];

  @Expose()
  @ApiProperty({ type: AuditLogEntryDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuditLogEntryDto)
  passwordChanges: AuditLogEntryDto[];
}
