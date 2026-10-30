import { KkPassCard } from '@furria/ui/KkPassCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PassSlot } from '../pass-act';
import {
  NEXT_EVENING_EYEBROW,
  NO_EVENING_LABEL,
  NO_EVENING_VALUE,
  NUMBER_LABEL,
  PENDING_LABEL,
  toEveningWhen,
  toPlaceNumber,
  toSlotTime,
} from '../pass-copy';
import { eveningLinkOf } from '../pass-paths';

interface PassCardSlotProps {
  slot: PassSlot;
}

export const PassCardSlot: FC<PassCardSlotProps> = ({ slot }) => {
  if (slot.kind === 'none') {
    return <KkPassCard.Fact label={NO_EVENING_LABEL} value={NO_EVENING_VALUE} />;
  }

  const link = eveningLinkOf(slot.eventId);
  const placed = slot.kind === 'placed';
  const number = placed ? toPlaceNumber(slot.position) : null;
  const time = placed ? toSlotTime(slot.position, slot.stageStartsAt) : null;

  return (
    <KkPassCard.Slot
      eyebrow={NEXT_EVENING_EYEBROW}
      numberLabel={NUMBER_LABEL}
      number={number}
      pendingLabel={PENDING_LABEL}
      time={time}
      title={slot.title}
      when={toEveningWhen(slot.startsAt)}
      component={Link}
      to={link.to}
      params={link.params}
    />
  );
};
