import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaModule } from './prisma.module';
import { CronJobService } from '../services/cron-job.service';
import { ActivityLogCleanupService } from '../services/activity-log-cleanup.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [],
  providers: [
    CronJobService,
    ActivityLogCleanupService,
    Logger,
    SchedulerRegistry,
  ],
  exports: [CronJobService],
})
export class CronJobModule {}
