import { KkFacetTileBand } from './internal/layout/KkFacetTileBand';
import { KkFacetTileFoot } from './internal/layout/KkFacetTileFoot';
import { KkFacetTileRoot } from './internal/layout/KkFacetTileRoot';
import { KkFacetTileStack } from './internal/layout/KkFacetTileStack';
import { KkFacetTileDoor } from './internal/ui/KkFacetTileDoor';
import { KkFacetTileFigure } from './internal/ui/KkFacetTileFigure';
import { KkFacetTileKeys } from './internal/ui/KkFacetTileKeys';
import { KkFacetTileLine } from './internal/ui/KkFacetTileLine';
import { KkFacetTilePlay } from './internal/ui/KkFacetTilePlay';

export const KkFacetTile = Object.assign(KkFacetTileRoot, {
  Door: KkFacetTileDoor,
  Figure: KkFacetTileFigure,
  Line: KkFacetTileLine,
  Keys: KkFacetTileKeys,
  Play: KkFacetTilePlay,
  Stack: KkFacetTileStack,
  Foot: KkFacetTileFoot,
  Band: KkFacetTileBand,
});
