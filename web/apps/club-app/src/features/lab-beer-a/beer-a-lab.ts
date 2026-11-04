import { LAB_EMPTY_STOCK, LAB_VIEWER_LABELS } from './beer-a-copy';
import type { BeerAHubSearch, BeerAMemberSearch, BeerAMemberViewer } from './schemas';
import { BEER_A_HUB_VIEWERS, BEER_A_MEMBER_VIEWERS } from './schemas';

export const EMPTY_STOCK_CHOICE = 'stock-empty';
export const DEFAULT_MEMBER_VIEWER: BeerAMemberViewer = 'openTab';

export interface BeerALabSwitchChoice {
  id: string;
  label: string;
}

export const memberLabChoices: readonly BeerALabSwitchChoice[] = [
  ...BEER_A_MEMBER_VIEWERS.map((viewer) => ({ id: viewer, label: LAB_VIEWER_LABELS[viewer] })),
  { id: EMPTY_STOCK_CHOICE, label: LAB_EMPTY_STOCK },
];

const isMemberViewer = (id: string): id is BeerAMemberViewer =>
  BEER_A_MEMBER_VIEWERS.some((viewer) => viewer === id);

export const memberLabValueOf = (search: BeerAMemberSearch): string =>
  search.stock === 'empty' ? EMPTY_STOCK_CHOICE : (search.as ?? DEFAULT_MEMBER_VIEWER);

export const memberSearchOf = (choice: string, current: BeerAMemberSearch): BeerAMemberSearch => {
  if (choice === EMPTY_STOCK_CHOICE) {
    return { as: current.as, stock: 'empty' };
  }

  return { as: isMemberViewer(choice) ? choice : DEFAULT_MEMBER_VIEWER, stock: undefined };
};

export const hubLabChoices: readonly BeerALabSwitchChoice[] = BEER_A_HUB_VIEWERS.map((viewer) => ({
  id: viewer,
  label: LAB_VIEWER_LABELS[viewer],
}));

export const hubSearchOf = (choice: string): BeerAHubSearch => ({
  as: BEER_A_HUB_VIEWERS.find((viewer) => viewer === choice) ?? 'owner',
});
