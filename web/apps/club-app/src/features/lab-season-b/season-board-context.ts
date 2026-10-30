import { createContext, useContext } from 'react';
import type { SeasonBoard } from './hooks/use-season-board';

export const SeasonBoardContext = createContext<SeasonBoard | null>(null);

export const useSeasonBoardContext = (): SeasonBoard => {
  const board = useContext(SeasonBoardContext);

  if (board === null) {
    throw new Error('useSeasonBoardContext must be used inside the season board.');
  }

  return board;
};
