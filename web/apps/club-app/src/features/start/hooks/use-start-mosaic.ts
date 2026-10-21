import { useIsMobile } from '@furria/ui';
import type { StartPanel } from '../schemas';
import type { MosaicTile, TileSpan } from '../start-mosaic';
import { toMosaic } from '../start-mosaic';
import type { StartBoard } from './use-start-view';

export interface PlacedTile {
  panel: StartPanel;
  order: number;
  span: TileSpan;
}

export interface SideTile extends PlacedTile {
  grows: boolean;
}

export interface StartMosaic {
  lead: PlacedTile | null;
  side: SideTile[];
  sideSpan: TileSpan;
  rest: PlacedTile[];
}

const placedOf =
  (board: StartBoard, stacked: boolean) =>
  (tile: MosaicTile): PlacedTile[] => {
    const panel = board.start.panels.find((candidate) => candidate.kind === tile.kind);

    if (panel === undefined) {
      return [];
    }

    const shown =
      stacked || tile.shownCount === null ? panel : { ...panel, shownCount: tile.shownCount };

    return [{ panel: shown, order: tile.order, span: tile.span }];
  };

export const useStartMosaic = (board: StartBoard): StartMosaic => {
  const mosaic = toMosaic(board.start);
  const stacked = useIsMobile();
  const place = placedOf(board, stacked);

  return {
    lead: mosaic.lead === null ? null : (place(mosaic.lead)[0] ?? null),
    side: mosaic.side
      .flatMap(place)
      .map((tile, index, all) => ({ ...tile, grows: index === all.length - 1 })),
    rest: mosaic.rest.flatMap(place),
    sideSpan: mosaic.sideSpan,
  };
};
