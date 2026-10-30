import { KkFacetTile } from '@furria/ui/KkFacetTile';
import type { FC } from 'react';
import { TEXT_SOON, TEXT_SOON_LINE } from '../act-c-copy';

interface ActCTextTileProps {
  label: string;
  order: number;
}

export const ActCTextTile: FC<ActCTextTileProps> = ({ label, order }) => (
  <KkFacetTile label={label} order={order} quiet>
    <KkFacetTile.Door icon="paragraph" label={label} />
    <KkFacetTile.Line tone="strong">{TEXT_SOON}</KkFacetTile.Line>
    <KkFacetTile.Line lines={2}>{TEXT_SOON_LINE}</KkFacetTile.Line>
  </KkFacetTile>
);
