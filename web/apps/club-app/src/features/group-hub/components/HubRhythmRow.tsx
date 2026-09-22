import { KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toClockValue, toDurationLabel, toSlotVenueLine, toWeekdayLabel } from '../rhythm-labels';
import type { TrainingSlot } from '../schemas';

const META_SEPARATOR = ' · ';
const SLOT_ROUTE = '/groups/$groupId/slots/$slotId';

interface HubRhythmRowProps {
  groupId: number;
  slot: TrainingSlot;
  venueIsArchived: boolean;
}

export const HubRhythmRow: FC<HubRhythmRowProps> = ({ groupId, slot, venueIsArchived }) => {
  const meta = [
    toDurationLabel(slot.durationMinutes),
    toSlotVenueLine(slot.venueName, venueIsArchived),
  ].join(META_SEPARATOR);

  const tone = venueIsArchived ? 'gold' : 'neutral';

  return (
    <KkFactRow
      title={toWeekdayLabel(slot.weekday)}
      span={toClockValue(slot.startsAt)}
      spanLabel="ab"
      meta={meta}
      tone={tone}
      component={Link}
      to={SLOT_ROUTE}
      params={{ groupId: String(groupId), slotId: String(slot.groupTrainingSlotId) }}
    />
  );
};
