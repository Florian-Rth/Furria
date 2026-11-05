import { createContext, useContext } from 'react';
import type { HallBuilder } from './hooks/use-hall-builder';

export const HallBuilderContext = createContext<HallBuilder | null>(null);

export const useHallBuilderContext = (): HallBuilder => {
  const builder = useContext(HallBuilderContext);
  if (builder === null) {
    throw new Error('useHallBuilderContext must be used inside HallBuilderContext.');
  }

  return builder;
};
