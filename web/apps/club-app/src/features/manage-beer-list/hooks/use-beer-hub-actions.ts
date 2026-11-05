import type { KkPourQuickPlacement } from '@furria/ui/KkPourQuickBar';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { POTS_TITLE, SETTINGS_TITLE } from '../beer-hub-copy';
import type { BeerHub, BeerPanePath } from './use-beer-hub';

const QUICK_PATHS: Partial<Record<string, BeerPanePath>> = {
  payment: '/beer-list/manage/payment',
  crates: '/beer-list/manage/crates',
  stock: '/beer-list/manage/stock',
};

export type BeerQuickSlot = 'tools' | 'foot' | null;

export interface BeerHubActions {
  actions: KkScreenActions | undefined;
  quickSlot: BeerQuickSlot;
  quickPlacement: KkPourQuickPlacement;
  chooseQuick: (id: string) => void;
}

const quickSlotOf = (isOpen: boolean, isWide: boolean): BeerQuickSlot => {
  if (!isOpen) {
    return null;
  }

  return isWide ? 'tools' : 'foot';
};

export const useBeerHubActions = (hub: BeerHub): BeerHubActions => {
  const isOpen = hub.state.kind === 'open';
  const potsAction = {
    id: 'pots',
    label: POTS_TITLE,
    icon: 'archive',
    onSelect: () => {
      hub.openPane('/beer-list/manage/pots');
    },
  } as const;
  const settingsAction = {
    id: 'settings',
    label: SETTINGS_TITLE,
    icon: 'settings',
    onSelect: () => {
      hub.openPane('/beer-list/manage/settings');
    },
  } as const;
  const openActions: KkScreenActions = isOpen ? [settingsAction, potsAction] : [potsAction];

  return {
    actions: hub.allowed ? openActions : undefined,
    quickSlot: quickSlotOf(isOpen, hub.isWide),
    quickPlacement: hub.isWide ? 'top' : 'foot',
    chooseQuick: (id) => {
      const path = QUICK_PATHS[id];

      if (path !== undefined) {
        hub.openPane(path);
      }
    },
  };
};
