import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LotteryAuditResponseDto {
  @Expose()
  @ApiProperty()
  workQueueItemID: string;
}
