import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { useBeerStockQuery } from '@/features/manage-beer-list/api';
import { deskStockNoteOf } from '@/features/manage-beer-list/beer-hub-copy';
import type { StartBeerDeskPanel } from '../schemas';
import { START_BEER_CRATES_SHEET } from '../start-sheets';

export interface BeerDeskTileView {
  stockNote: string | null;
  book: () => void;
}

export const useBeerDeskTile = (panel: StartBeerDeskPanel): BeerDeskTileView => {
  const sheet = useKkSheetCommands();
  const drinks = useBeerStockQuery(panel.beerPotId).data?.drinks;

  return {
    stockNote: drinks === undefined ? null : deskStockNoteOf(drinks),
    book: () => {
      sheet.open(START_BEER_CRATES_SHEET);
    },
  };
};
