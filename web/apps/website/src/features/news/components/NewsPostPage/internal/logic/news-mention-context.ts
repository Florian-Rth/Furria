import { createContext, useContext } from 'react';
import type { NewsMentionCards } from '@/features/news/news-mentions';

export const NewsMentionContext = createContext<NewsMentionCards | null>(null);

export const useNewsMentionCards = (): NewsMentionCards => {
  const cards = useContext(NewsMentionContext);
  if (cards === null) {
    throw new Error('useNewsMentionCards must be used inside NewsMentionContext');
  }
  return cards;
};
