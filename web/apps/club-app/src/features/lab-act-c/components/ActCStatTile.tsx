import { KkFacetTile } from '@furria/ui/KkFacetTile';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { DetailTile } from '../detail-tiles';

interface ActCStatTileProps {
  tile: DetailTile;
  order: number;
}

export const ActCStatTile: FC<ActCStatTileProps> = ({ tile, order }) => {
  const lines = tile.lines.map((line) => (
    <KkFacetTile.Line key={line} lines={2}>
      {line}
    </KkFacetTile.Line>
  ));
  const door =
    tile.link === null ? (
      <KkFacetTile.Door icon={tile.icon} label={tile.label} />
    ) : (
      <KkFacetTile.Door
        icon={tile.icon}
        label={tile.label}
        hint={tile.hint}
        component={Link}
        to={tile.link.to}
        params={tile.link.params}
        search={tile.link.search}
      />
    );

  return (
    <KkFacetTile label={tile.label} order={order} density="compact">
      {door}
      <KkFacetTile.Figure value={tile.value} aside={tile.aside} size="medium" tone={tile.tone} />
      {lines}
    </KkFacetTile>
  );
};
