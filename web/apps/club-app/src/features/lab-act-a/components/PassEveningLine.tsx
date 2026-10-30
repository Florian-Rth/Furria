import { KkDensePanel } from '@furria/ui/KkDensePanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PassEveningLine as PassEveningLineModel } from '../pass-act';
import { toEveningLineLabel, toEveningLineMeta, toEveningStamp, toShortDay } from '../pass-copy';
import { eveningLinkOf } from '../pass-paths';

interface PassEveningLineProps {
  evening: PassEveningLineModel;
}

export const PassEveningLine: FC<PassEveningLineProps> = ({ evening }) => {
  const link = eveningLinkOf(evening.eventId);
  const anchor = (
    <KkDensePanel.Stamp
      eyebrow={toShortDay(evening.startsAt)}
      eyebrowTone="plain"
      time={toEveningStamp(evening.position)}
    />
  );

  return (
    <KkDensePanel.Line
      anchor={anchor}
      title={evening.title}
      meta={toEveningLineMeta(evening.position, evening.stageStartsAt)}
      accessibleLabel={toEveningLineLabel(
        evening.title,
        evening.startsAt,
        evening.position,
        evening.stageStartsAt,
      )}
      component={Link}
      to={link.to}
      params={link.params}
    />
  );
};
