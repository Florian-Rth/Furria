import { useState } from 'react';
import type { BeerPane } from '../beer-pane';
import { beerPaneKeyOf } from '../beer-pane';

export const useShownPane = (pane: BeerPane | null): BeerPane | null => {
  const [kept, setKept] = useState<BeerPane | null>(pane);

  if (pane !== null && beerPaneKeyOf(pane) !== beerPaneKeyOf(kept)) {
    setKept(pane);
  }

  return pane ?? kept;
};
