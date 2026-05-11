import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { CronJobService } from './cron-job.service';
import dayjs from 'dayjs';
import { SuccessDTO } from '../dtos/shared/success.dto';

@Injectable()
export class ActivityLogCleanupService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private cronJobService: CronJobService,
    private configService: ConfigService,
    @Inject(Logger)
    private logger = new Logger(ActivityLogCleanupService.name),
  ) {}

  async onModuleInit() {
    this.logger.log('Registering ActivityLog cleanup cron job');
    // Default to daily at 2am if not specified
    await this.cronJobService.startCronJob(
      'activity-log-cleanup',
      this.configService.get<string>(
        'ACTIVITY_LOG_CLEANUP_CRON_STRING',
        '0 2 * * *',
      ),
      () => this.cleanup(),
    );
  }

  async cleanup(): Promise<SuccessDTO> {
    const retentionDays = this.configService.get<number>(
      'ACTIVITY_LOG_RETENTION_DAYS',
    );
    if (isNaN(retentionDays) || retentionDays <= 0) {
      this.logger.warn(
        'ACTIVITY_LOG_RETENTION_DAYS is not set or invalid. Skipping cleanup.',
      );
      return { success: false };
    }

    this.logger.log(
      `Cleaning up ActivityLog entries older than ${retentionDays} days`,
    );
    await this.cronJobService.markCronJobAsStarted('activity-log-cleanup');

    const result = await this.prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: dayjs().subtract(retentionDays, 'days').toDate(),
        },
      },
    });

    this.logger.log(`Deleted ${result.count} ActivityLog entries`);
    return { success: true };
  }
}
