import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import {
  NO_EVENING,
  NONE,
  toDayLine,
  toDoorHint,
  toMoreEvenings,
  toSlotAside,
  toSlotFigure,
} from '../act-card-copy';
import type { ActCardView } from '../act-card-view';

interface ActCardEveningTileProps {
  view: ActCardView;
  label: string;
  order: number;
  current: boolean;
  onOpen: () => void;
}

export const ActCardEveningTile: FC<ActCardEveningTileProps> = ({
  view,
  label,
  order,
  current,
  onOpen,
}) => {
  const next = view.nextEvening;
  const hint = toDoorHint('evening');
  const door = <KkFacetTile.Door icon="stage" label={label} hint={hint} onOpen={onOpen} />;

  if (next === null) {
    return (
      <KkFacetTile label={label} order={order} current={current}>
        {door}
        <KkFacetTile.Line tone="strong">{NO_EVENING}</KkFacetTile.Line>
        <KkFacetTile.Line>{NONE}</KkFacetTile.Line>
      </KkFacetTile>
    );
  }

  const placed = next.slot.kind === 'placed';
  const figure = toSlotFigure(next.slot, next.startsAt);
  const aside = toSlotAside(next.slot);
  const day = toDayLine(next.startsAt);
  const joined = view.evenings.filter((evening) => evening.appearance !== null).length;
  const more = toMoreEvenings(joined - 1);
  const moreLine = more === null ? null : <KkFacetTile.Line>{more}</KkFacetTile.Line>;

  return (
    <KkFacetTile label={label} order={order} current={current}>
      {door}
      <KkFacetTile.Figure value={figure} aside={aside} tone={placed ? 'ink' : 'muted'} />
      <KkFacetTile.Stack>
        <KkFacetTile.Line tone="strong" lines={2}>
          {next.title}
        </KkFacetTile.Line>
        <KkFacetTile.Line>{day}</KkFacetTile.Line>
        {moreLine}
      </KkFacetTile.Stack>
    </KkFacetTile>
  );
};
