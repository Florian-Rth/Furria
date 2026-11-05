import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import { FORM_TITLES } from '@/features/manage-beer-list/beer-hub-copy';
import { START_BEER_CRATES_SHEET } from '../start-sheets';
import { BeerCratesSheetBody } from './BeerCratesSheetBody';

const CLOSE_LABEL = 'Schließen';

interface BeerCratesSheetProps {
  beerPotId: number;
}

export const BeerCratesSheet: FC<BeerCratesSheetProps> = ({ beerPotId }) => (
  <KkSheet id={START_BEER_CRATES_SHEET} title={FORM_TITLES.crates} closeLabel={CLOSE_LABEL}>
    <KkSheet.Body>
      <BeerCratesSheetBody beerPotId={beerPotId} />
    </KkSheet.Body>
  </KkSheet>
);
