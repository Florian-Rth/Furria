import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { BeerCratesForm } from '@/features/manage-beer-list/components/BeerCratesForm';
import { BeerLoadError } from '@/features/manage-beer-list/components/BeerLoadError';
import { START_PATH } from '@/features/session/app-sections';
import type { WriteLanding } from '@/features/write/landing-target';
import { useBeerCratesSheet } from '../hooks/use-beer-crates-sheet';

const START_LANDING: WriteLanding = { to: START_PATH };
const LOADING_LINES = 4;

interface BeerCratesSheetBodyProps {
  beerPotId: number;
}

export const BeerCratesSheetBody: FC<BeerCratesSheetBodyProps> = ({ beerPotId }) => {
  const sheet = useBeerCratesSheet(beerPotId);

  if (sheet.kind === 'failed') {
    return <BeerLoadError error={sheet.error} onRetry={sheet.retry} />;
  }
  if (sheet.kind === 'loading') {
    return <KkSkeletonBlock lines={LOADING_LINES} />;
  }

  return (
    <BeerCratesForm
      beerPotId={beerPotId}
      bookable={sheet.bookable}
      initialPersonId={null}
      stock={sheet.stock}
      landing={START_LANDING}
    />
  );
};
