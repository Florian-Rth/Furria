import { KkPassCard } from '@furria/ui/KkPassCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PassSlot } from '../pass-act';
import { NO_EVENING_LABEL, NO_EVENING_VALUE, POINT_EVENING_LABEL, toPointLine } from '../pass-copy';
import { eveningLinkOf } from '../pass-paths';

interface PassCardPointProps {
  slot: PassSlot;
}

export const PassCardPoint: FC<PassCardPointProps> = ({ slot }) => {
  if (slot.kind === 'none') {
    return <KkPassCard.Fact label={NO_EVENING_LABEL} value={NO_EVENING_VALUE} />;
  }

  const link = eveningLinkOf(slot.eventId);

  return (
    <KkPassCard.Fact
      label={POINT_EVENING_LABEL}
      value={toPointLine(slot)}
      component={Link}
      to={link.to}
      params={link.params}
    />
  );
};
