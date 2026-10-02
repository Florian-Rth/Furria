export type GreetingDeck = 'carnival' | 'cheer' | 'backwards' | 'none';

export const CARNIVAL_DECK: string[] = [
  'GROSS',
  'FURRIA',
  'ELFERRAT',
  'GARDE',
  'ORDEN',
  'BÜTT',
  'KAPPE',
  'BESEN',
  'SESSION',
];

export const CHEER_DECK: string[] = ['HOCH', 'HOCH', 'HOCH'];

export const BACKWARDS_DECK: string[] = ['DIENSTAG', 'MONTAG', 'WEIBER'];

export interface HeadlineDecks {
  deck: string[];
  nameDeck: string[] | undefined;
}

export const HEADLINE_DECKS: Record<GreetingDeck, HeadlineDecks> = {
  carnival: { deck: CARNIVAL_DECK, nameDeck: undefined },
  cheer: { deck: CHEER_DECK, nameDeck: CHEER_DECK },
  backwards: { deck: BACKWARDS_DECK, nameDeck: undefined },
  none: { deck: [], nameDeck: undefined },
};
