import { ListingEventsTypeEnum } from '@prisma/client';
import { ListingUpdate } from '../dtos/listings/listing-update.dto';
import { ListingEventCreate } from '../dtos/listings/listing-event-create.dto';
import { ListingEvent } from '../dtos/listings/listing-event.dto';

export const checkIfDatesChanged = (
  lotteryEvent: ListingEventCreate,
  storedLotteryEvent: ListingEvent,
  dto: ListingUpdate,
  storedApplicationDueDate: string,
) => {
  const isPublicLotteryEvent =
    lotteryEvent?.type === ListingEventsTypeEnum.publicLottery;

  const isSameStartDate =
    lotteryEvent?.startDate?.toISOString() ===
    storedLotteryEvent?.startDate?.toISOString();
  const isSameStartTime =
    lotteryEvent?.startTime?.toISOString() ===
    storedLotteryEvent?.startTime?.toISOString();
  const isSameEndTime =
    lotteryEvent?.endTime?.toISOString() ===
    storedLotteryEvent?.endTime?.toISOString();

  const isDifferentEventType = lotteryEvent?.type !== storedLotteryEvent?.type;
  const isDifferentApplicationDueDate =
    dto.applicationDueDate?.toISOString() !== storedApplicationDueDate;
  const isDifferentLotteryEventTimes =
    isPublicLotteryEvent &&
    !(isSameStartDate && isSameStartTime && isSameEndTime);

  return (
    isDifferentEventType ||
    isDifferentLotteryEventTimes ||
    isDifferentApplicationDueDate
  );
};
