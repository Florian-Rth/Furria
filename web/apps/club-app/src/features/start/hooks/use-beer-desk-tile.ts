import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useBeerStockQuery } from '@/features/manage-beer-list/api';
import { cratesLabel } from '@/features/manage-beer-list/beer-hub-copy';
import type { StartBeerDeskPanel } from '../schemas';
import { START_BEER_CRATES_SHEET } from '../start-sheets';

export interface BeerDeskTileView {
  stockNote: string | null;
  book: () => void;
}

export const useBeerDeskTile = (panel: StartBeerDeskPanel): BeerDeskTileView => {
  const sheet = useKkSheetCommands();
  const stock = useBeerStockQuery(panel.beerPotId).data?.crates;

  return {
    stockNote: stock === undefined ? null : `Bestand ${cratesLabel(stock)}`,
    book: () => {
      sheet.open(START_BEER_CRATES_SHEET);
    },
  };
};
