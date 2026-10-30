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
} from '../act-c-copy';
import type { ActCView } from '../act-c-view';

interface ActCEveningTileProps {
  view: ActCView;
  label: string;
  order: number;
  current: boolean;
  onOpen: () => void;
}

export const ActCEveningTile: FC<ActCEveningTileProps> = ({
  view,
  label,
  order,
  current,
  onOpen,
}) => {
  const next = view.nextEvening;
  const door = (
    <KkFacetTile.Door icon="stage" label={label} hint={toDoorHint('evening')} onOpen={onOpen} />
  );

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
  const joined = view.evenings.filter((evening) => evening.appearance !== null).length;
  const more = toMoreEvenings(joined - 1);
  const moreLine = more === null ? null : <KkFacetTile.Line>{more}</KkFacetTile.Line>;

  return (
    <KkFacetTile label={label} order={order} current={current}>
      {door}
      <KkFacetTile.Figure
        value={toSlotFigure(next.slot, next.startsAt)}
        aside={toSlotAside(next.slot)}
        tone={placed ? 'ink' : 'muted'}
      />
      <KkFacetTile.Stack>
        <KkFacetTile.Line tone="strong" lines={2}>
          {next.title}
        </KkFacetTile.Line>
        <KkFacetTile.Line>{toDayLine(next.startsAt)}</KkFacetTile.Line>
        {moreLine}
      </KkFacetTile.Stack>
    </KkFacetTile>
  );
};
