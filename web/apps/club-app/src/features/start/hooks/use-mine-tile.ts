import type { KkStartTileReach } from '@furria/ui/reach';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import { usePersonalMe } from '@/features/session/hooks/use-personal-me';
import type { PersonFunction } from '@/lib/api/schemas';
import type { MineCoin } from '../mine-tile';
import { needsAttention, tileFactsOf, toMineCoin } from '../mine-tile';
import type { StartPanelOf } from '../start-board';
import { toMineLine } from '../start-lines';
import { START_MINE_SHEET } from '../start-sheets';
import type { StartBoard } from './use-start-view';

export interface MineFact {
  key: string;
  coin: MineCoin;
  title: string;
  meta: string | undefined;
  label: string;
}

export interface MineTileView {
  reach: KkStartTileReach;
  facts: MineFact[];
  further: string | null;
  attention: boolean;
}

const NO_FUNCTIONS: readonly PersonFunction[] = [];
const META_SEPARATOR = ' · ';

export const useMineTile = (panel: StartPanelOf<'mine'>, board: StartBoard): MineTileView => {
  const sheet = useKkSheetCommands();
  const functions = usePersonalMe().data?.honours.functions ?? NO_FUNCTIONS;
  const facts = tileFactsOf(panel.mine);
  const shown = facts.slice(0, panel.shownCount);
  const context = {
    today: board.start.today,
    canReadClub: board.canReadClub,
    memberSince: board.memberSince,
  };

  return {
    reach: {
      label: 'Alles zu dir öffnen',
      onClick: () => {
        sheet.open(START_MINE_SHEET);
      },
    },
    facts: shown.map((item) => {
      const line = toMineLine(item, context);

      return {
        key: line.key,
        coin: toMineCoin(item, functions),
        title: line.title,
        meta: line.meta.length === 0 ? undefined : line.meta.join(META_SEPARATOR),
        label: line.accessibleName,
      };
    }),
    further: facts.length > shown.length ? `+${facts.length - shown.length} weitere` : null,
    attention: needsAttention(panel.mine),
  };
};
