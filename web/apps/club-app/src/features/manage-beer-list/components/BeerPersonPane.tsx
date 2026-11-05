import type { FC } from 'react';
import { openHubOf, useBeerHubContext } from '../beer-hub-context';
import { BeerPersonPaneOpen } from './BeerPersonPaneOpen';

interface BeerPersonPaneProps {
  personId: number;
}

export const BeerPersonPane: FC<BeerPersonPaneProps> = ({ personId }) => {
  const open = openHubOf(useBeerHubContext());

  if (open === null) {
    return null;
  }

  return <BeerPersonPaneOpen open={open} personId={personId} />;
};
