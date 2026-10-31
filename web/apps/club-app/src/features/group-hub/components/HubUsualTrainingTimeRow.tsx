import { KkFactRow } from '@furria/ui/KkFactRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { UsualTrainingTime } from '../schemas';
import {
  toClockValue,
  toDurationLabel,
  toUsualTimeVenueLine,
  toWeekdayLabel,
} from '../usual-training-time-labels';

const META_SEPARATOR = ' · ';
const USUAL_TIME_ROUTE = '/groups/$groupId/usual-training-times/$usualTrainingTimeId';

interface HubUsualTrainingTimeRowProps {
  groupId: number;
  usualTime: UsualTrainingTime;
  venueIsArchived: boolean;
}

export const HubUsualTrainingTimeRow: FC<HubUsualTrainingTimeRowProps> = ({
  groupId,
  usualTime,
  venueIsArchived,
}) => {
  const meta = [
    toDurationLabel(usualTime.durationMinutes),
    toUsualTimeVenueLine(usualTime.venueName, venueIsArchived),
  ].join(META_SEPARATOR);

  const tone = venueIsArchived ? 'gold' : 'neutral';

  return (
    <KkFactRow
      title={toWeekdayLabel(usualTime.weekday)}
      span={toClockValue(usualTime.startsAt)}
      spanLabel="ab"
      meta={meta}
      tone={tone}
      component={Link}
      to={USUAL_TIME_ROUTE}
      params={{
        groupId: String(groupId),
        usualTrainingTimeId: String(usualTime.usualTrainingTimeId),
      }}
    />
  );
};
