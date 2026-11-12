import { createContext, useContext } from 'react';
import type { MentionCards } from './mention-cards';

export const MentionCardsContext = createContext<MentionCards | null>(null);

export const useMentionCards = (): MentionCards => {
  const cards = useContext(MentionCardsContext);
  if (cards === null) {
    throw new Error('useMentionCards must be used inside MentionCardsContext');
  }
  return cards;
};
