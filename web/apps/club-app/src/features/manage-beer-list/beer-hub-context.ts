import { createContext, useContext } from 'react';
import type { BeerHub, BeerOpenHub } from './hooks/use-beer-hub';

export const BeerHubContext = createContext<BeerHub | null>(null);

export const useBeerHubContext = (): BeerHub => {
  const hub = useContext(BeerHubContext);
  if (hub === null) {
    throw new Error('useBeerHubContext must be used inside BeerHubContext');
  }
  return hub;
};

export const openHubOf = (hub: BeerHub): BeerOpenHub | null =>
  hub.state.kind === 'open' ? hub.state.open : null;
