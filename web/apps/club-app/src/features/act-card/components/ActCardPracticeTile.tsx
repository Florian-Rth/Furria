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
} from '../act-card-copy';
import type { ActCardView } from '../act-card-view';

const MUSIC_ASIDE = 'Musik';

interface ActCardPracticeTileProps {
  view: ActCardView;
  label: string;
  order: number;
}

export const ActCardPracticeTile: FC<ActCardPracticeTileProps> = ({ view, label, order }) => {
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

  const player = view.links.play;
  const hint = toDoorHint('practice');
  const figure = toMusicFigure(counts.musicSeconds);
  const facts = toPracticeFacts(counts);
  const parts = toPartsLine(counts.parts);

  return (
    <KkFacetTile label={label} order={order}>
      <KkFacetTile.Door
        icon="play"
        label={label}
        hint={hint}
        component={Link}
        to={player.to}
        params={player.params}
        search={player.search}
      />
      <KkFacetTile.Figure value={figure} aside={MUSIC_ASIDE} />
      <KkFacetTile.Stack>
        <KkFacetTile.Line tone="strong">{facts}</KkFacetTile.Line>
        <KkFacetTile.Line lines={2}>{parts}</KkFacetTile.Line>
      </KkFacetTile.Stack>
      <KkFacetTile.Foot sx={{ justifyContent: 'flex-end' }}>
        <KkFacetTile.Play playable order={order} />
      </KkFacetTile.Foot>
    </KkFacetTile>
  );
};
