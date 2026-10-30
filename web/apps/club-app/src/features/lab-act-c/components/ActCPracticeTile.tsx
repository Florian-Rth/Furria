import { KkFacetTile } from '@furria/ui/KkFacetTile';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  NO_MUSIC,
  toAskLine,
  toDoorHint,
  toMusicFigure,
  toPartsLine,
  toPracticeFacts,
} from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { playerLinkOf } from '../lab-act-c-paths';

const MUSIC_ASIDE = 'Musik';

interface ActCPracticeTileProps {
  view: ActCView;
  label: string;
  order: number;
}

export const ActCPracticeTile: FC<ActCPracticeTileProps> = ({ view, label, order }) => {
  const counts = view.counts;

  const ask = toAskLine(view.ask);

  if (!view.playable || counts === null) {
    return (
      <KkFacetTile label={label} order={order}>
        <KkFacetTile.Door icon="play" label={label} />
        <KkFacetTile.Line tone="strong" lines={2}>
          {NO_MUSIC}
        </KkFacetTile.Line>
        <KkFacetTile.Line lines={3}>{ask}</KkFacetTile.Line>
        <KkFacetTile.Foot>
          <KkFacetTile.Play playable={false} order={order} />
        </KkFacetTile.Foot>
      </KkFacetTile>
    );
  }

  const player = playerLinkOf(view.actId);

  return (
    <KkFacetTile label={label} order={order}>
      <KkFacetTile.Door
        icon="play"
        label={label}
        hint={toDoorHint('practice')}
        component={Link}
        to={player.to}
        params={player.params}
      />
      <KkFacetTile.Figure value={toMusicFigure(counts.musicSeconds)} aside={MUSIC_ASIDE} />
      <KkFacetTile.Stack>
        <KkFacetTile.Line tone="strong">{toPracticeFacts(counts)}</KkFacetTile.Line>
        <KkFacetTile.Line lines={2}>{toPartsLine(counts.parts)}</KkFacetTile.Line>
      </KkFacetTile.Stack>
      <KkFacetTile.Foot sx={{ justifyContent: 'flex-end' }}>
        <KkFacetTile.Play playable order={order} />
      </KkFacetTile.Foot>
    </KkFacetTile>
  );
};
