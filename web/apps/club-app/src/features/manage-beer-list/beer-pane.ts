import { BeerPaneSearchSchema } from './pane-search';

const ROUTE_PREFIX = '/_app/beer-list_/manage/';
const NO_PANE_KEY = 'none';

export type BeerPane =
  | { kind: 'stock' }
  | { kind: 'payment'; personId: number | null }
  | { kind: 'crates'; personId: number | null }
  | { kind: 'settings' }
  | { kind: 'enrollments' }
  | { kind: 'handover' }
  | { kind: 'code' }
  | { kind: 'pots' }
  | { kind: 'person'; personId: number }
  | { kind: 'closedPot'; beerPotId: number };

export interface BeerPaneMatch {
  routeId: string;
  params: Partial<Record<string, string>>;
  search: object;
}

const idOf = (text: string | undefined): number | null => {
  const id = Number(text);

  return Number.isInteger(id) && id > 0 ? id : null;
};

const searchPersonOf = (search: object): number | null =>
  BeerPaneSearchSchema.parse(search).person ?? null;

const withPersonOf = (personId: number | null): BeerPane | null =>
  personId === null ? null : { kind: 'person', personId };

const withPotOf = (beerPotId: number | null): BeerPane | null =>
  beerPotId === null ? null : { kind: 'closedPot', beerPotId };

export const beerPaneOf = (match: BeerPaneMatch | undefined): BeerPane | null => {
  if (match === undefined) {
    return null;
  }

  switch (match.routeId.replace(ROUTE_PREFIX, '')) {
    case 'stock':
      return { kind: 'stock' };
    case 'payment':
      return { kind: 'payment', personId: searchPersonOf(match.search) };
    case 'crates':
      return { kind: 'crates', personId: searchPersonOf(match.search) };
    case 'settings':
      return { kind: 'settings' };
    case 'enrollments':
      return { kind: 'enrollments' };
    case 'handover':
      return { kind: 'handover' };
    case 'code':
      return { kind: 'code' };
    case 'pots':
      return { kind: 'pots' };
    case 'persons/$personId':
      return withPersonOf(idOf(match.params.personId));
    case 'pots_/$beerPotId':
      return withPotOf(idOf(match.params.beerPotId));
    default:
      return null;
  }
};

export const beerPaneKeyOf = (pane: BeerPane | null): string => {
  if (pane === null) {
    return NO_PANE_KEY;
  }

  switch (pane.kind) {
    case 'payment':
    case 'crates':
      return `${pane.kind}:${pane.personId ?? 0}`;
    case 'person':
      return `${pane.kind}:${pane.personId}`;
    case 'closedPot':
      return `${pane.kind}:${pane.beerPotId}`;
    default:
      return pane.kind;
  }
};
