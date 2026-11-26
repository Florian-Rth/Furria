import type { BeerPane } from './beer-pane';

export type BeerHubHelpTopic =
  | 'head'
  | 'payment'
  | 'crates'
  | 'stock'
  | 'roster'
  | 'person'
  | 'journal'
  | 'setup'
  | 'drinks'
  | 'handover'
  | 'pots'
  | 'openPot';

const OPEN_TOPICS: readonly BeerHubHelpTopic[] = [
  'head',
  'payment',
  'crates',
  'stock',
  'roster',
  'person',
  'journal',
  'setup',
  'drinks',
  'handover',
  'pots',
];

const EMPTY_TOPICS: readonly BeerHubHelpTopic[] = ['openPot', 'pots'];

const PANE_TOPICS: Record<BeerPane['kind'], BeerHubHelpTopic> = {
  stock: 'stock',
  drink: 'drinks',
  payment: 'payment',
  crates: 'crates',
  settings: 'setup',
  drinks: 'drinks',
  enrollments: 'setup',
  handover: 'handover',
  code: 'setup',
  pots: 'pots',
  person: 'person',
  closedPot: 'pots',
};

export const beerHubHelpTopicsOf = (
  potOpen: boolean,
  pane: BeerPane | null,
): readonly BeerHubHelpTopic[] => {
  const topics = potOpen ? OPEN_TOPICS : EMPTY_TOPICS;

  if (pane === null) {
    return topics;
  }

  const first = PANE_TOPICS[pane.kind];

  if (!topics.includes(first)) {
    return topics;
  }

  return [first, ...topics.filter((topic) => topic !== first)];
};
