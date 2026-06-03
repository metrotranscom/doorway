import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../src/services/prisma.service';
import { CronJobService } from '../../../src/services/cron-job.service';
import { ActivityLogCleanupService } from '../../../src/services/activity-log-cleanup.service';

describe('ActivityLogCleanupService', () => {
  let service: ActivityLogCleanupService;
  let prisma: PrismaService;
  let configService: ConfigService;
  let cronJobService: CronJobService;

  const mockCronJobService = {
    startCronJob: jest.fn(),
    markCronJobAsStarted: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogCleanupService,
        PrismaService,
        { provide: CronJobService, useValue: mockCronJobService },
        ConfigService,
        Logger,
      ],
    }).compile();

    service = module.get<ActivityLogCleanupService>(ActivityLogCleanupService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    cronJobService = module.get<CronJobService>(CronJobService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip cleanup if retention days is not set or invalid', async () => {
    configService.get = jest.fn().mockReturnValue(NaN);
    prisma.activityLog.deleteMany = jest.fn();

    const result = await service.cleanup();

    expect(result).toEqual({ success: false });
    expect(prisma.activityLog.deleteMany).not.toHaveBeenCalled();
  });

  it('should delete only auth module entries older than retention days', async () => {
    configService.get = jest.fn().mockImplementation((key) => {
      if (key === 'ACTIVITY_LOG_RETENTION_DAYS') return 30;
      return null;
    });

    const mockDeleteResult = { count: 12 };
    prisma.activityLog.deleteMany = jest
      .fn()
      .mockResolvedValue(mockDeleteResult);

    const result = await service.cleanup();

    expect(result).toEqual({ success: true });
    expect(cronJobService.markCronJobAsStarted).toHaveBeenCalledWith(
      'activity-log-cleanup',
    );
    expect(prisma.activityLog.deleteMany).toHaveBeenCalledWith({
      where: {
        module: 'auth',
        createdAt: {
          lt: expect.any(Date),
        },
      },
    });
  });
});
