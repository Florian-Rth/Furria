import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { useState } from 'react';
import { LAB_BEER_VIEWERS } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import { emptyLabStock } from '../lab-stock';
import type { HubFilter, HubHealth, HubSort, PersonLine } from '../ledger-hub';
import { hubHealthOf, peopleOf, tableOf } from '../ledger-hub';
import type { LedgerViewer } from '../schemas';

export type HubPane =
  | { kind: 'person'; personId: number }
  | { kind: 'stock' }
  | { kind: 'settings' };

export type HubTile = 'stock' | 'open' | 'overdue' | 'running';

const SORTS: readonly HubSort[] = ['open', 'oldest', 'name'];

export interface LedgerHub {
  beer: LabBeerWorldState;
  operatorId: number;
  isWide: boolean;
  health: HubHealth;
  rows: readonly PersonLine[];
  filter: HubFilter;
  sort: HubSort;
  pane: HubPane | null;
  selected: PersonLine | null;
  chooseTile: (tile: HubTile) => void;
  clearFilter: () => void;
  sortBy: (sort: string) => void;
  openPerson: (personId: number) => void;
  openStock: () => void;
  openSettings: () => void;
  close: () => void;
  emptyStock: () => void;
}

export const useLedgerHub = (viewer: LedgerViewer): LedgerHub => {
  const beer = useLabBeerWorld();
  const isWide = useIsWideScreen();
  const operatorId = LAB_BEER_VIEWERS[viewer];
  const [filter, setFilter] = useState<HubFilter>('all');
  const [sort, setSort] = useState<HubSort>('open');
  const [chosenPane, setPane] = useState<HubPane | null | 'auto'>('auto');
  const lines = peopleOf(beer.world);
  const firstOverdue = tableOf(lines, 'overdue', 'oldest')[0] ?? null;
  const pane: HubPane | null =
    chosenPane === 'auto'
      ? isWide && firstOverdue !== null
        ? { kind: 'person', personId: firstOverdue.person.id }
        : null
      : chosenPane;
  const personId = pane?.kind === 'person' ? pane.personId : null;

  const chooseTile = (tile: HubTile): void => {
    if (tile === 'stock') {
      setPane(pane?.kind === 'stock' ? null : { kind: 'stock' });

      return;
    }

    setFilter(filter === tile ? 'all' : tile);
  };

  const sortBy = (next: string): void => {
    const known = SORTS.find((candidate) => candidate === next);

    if (known !== undefined) {
      setSort(known);
    }
  };

  return {
    beer,
    operatorId,
    isWide,
    health: hubHealthOf(beer.world),
    rows: tableOf(lines, filter, sort),
    filter,
    sort,
    pane,
    selected: lines.find((line) => line.person.id === personId) ?? null,
    chooseTile,
    clearFilter: () => {
      setFilter('all');
    },
    sortBy,
    openPerson: (id) => {
      setPane({ kind: 'person', personId: id });
    },
    openStock: () => {
      setPane({ kind: 'stock' });
    },
    openSettings: () => {
      setPane({ kind: 'settings' });
    },
    close: () => {
      setPane(null);
    },
    emptyStock: () => {
      emptyLabStock(beer, operatorId);
    },
  };
};
