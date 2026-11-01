import { createContext, useContext } from 'react';
import type { ReadNewsMentionCards } from './read-news';

export const ReadNewsMentionContext = createContext<ReadNewsMentionCards | null>(null);

export const useReadNewsMentionCards = (): ReadNewsMentionCards => {
  const cards = useContext(ReadNewsMentionContext);
  if (cards === null) {
    throw new Error('useReadNewsMentionCards must be used inside ReadNewsMentionContext');
  }
  return cards;
};
