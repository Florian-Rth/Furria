import type { KkGroupTone } from '@furria/ui/group-tone';
import type { KkStartTileReach } from '@furria/ui/reach';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { Link } from '@tanstack/react-router';
import { toGroupTone } from '@/features/groups/group-identity';
import type { StartPanelOf } from '../start-board';
import { START_GROUPS_SHEET } from '../start-sheets';

export interface JubileeView {
  key: number;
  years: number;
  name: string;
  meta: string;
  tone: KkGroupTone;
  reach: KkStartTileReach;
}

export interface GroupsTileView {
  reach: KkStartTileReach | undefined;
  jubilees: JubileeView[];
}

const GROUP_ROUTE = '/groups/$groupId';

export const useGroupsTile = (panel: StartPanelOf<'groups'>): GroupsTileView => {
  const sheet = useKkSheetCommands();
  const shown = panel.groupMoments.slice(0, panel.shownCount);

  return {
    reach:
      panel.groupMoments.length > shown.length
        ? {
            label: 'Alle Gruppen-Jubiläen öffnen',
            onClick: () => {
              sheet.open(START_GROUPS_SHEET);
            },
          }
        : undefined,
    jubilees: shown.map((moment) => ({
      key: moment.groupId,
      years: moment.years,
      name: moment.name,
      meta: `${moment.years} Jahre · gegründet ${moment.foundedYear}`,
      tone: toGroupTone(moment.groupId, moment.tone),
      reach: {
        label: `${moment.years} Jahre ${moment.name}`,
        component: Link,
        to: GROUP_ROUTE,
        params: { groupId: String(moment.groupId) },
      },
    })),
  };
};
