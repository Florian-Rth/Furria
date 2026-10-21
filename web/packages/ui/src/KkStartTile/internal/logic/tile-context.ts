import { createContext, useContext } from 'react';

export interface TileLanding {
  order: number;
}

export const TileLandingContext = createContext<TileLanding | null>(null);

export const useTileLanding = (): TileLanding => {
  const landing = useContext(TileLandingContext);

  if (landing === null) {
    throw new Error('A tile part was rendered outside KkStartTile.');
  }

  return landing;
};
