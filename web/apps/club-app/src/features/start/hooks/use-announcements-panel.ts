import type { KkDenseFacet, KkDenseLineState } from '@furria/ui';
import { useKkSheetCommands } from '@furria/ui';
import type { StartPanelOf } from '../start-board';
import { hiddenCountOf, shownItemsOf } from '../start-board';
import type { AnnouncementLineView } from '../start-lines';
import { toAnnouncementLine, toAnnouncementLineState, toFacets } from '../start-lines';
import { START_ANNOUNCEMENTS_SHEET } from '../start-sheets';
import { useAnnouncementsSeen } from './use-announcements-seen';
import type { PanelFoot } from './use-panel-foot';
import { usePanelFoot } from './use-panel-foot';
import type { StartBoard } from './use-start-view';

export interface AnnouncementRow {
  line: AnnouncementLineView;
  meta: KkDenseFacet[];
  state: KkDenseLineState;
  open: () => void;
}

export interface AnnouncementsPanelView {
  rows: AnnouncementRow[];
  receipt: string | undefined;
  foot: PanelFoot | null;
}

const RECEIPT_WORD = 'gelesen';

export const useAnnouncementsPanel = (
  panel: StartPanelOf<'announcements'>,
  board: StartBoard,
): AnnouncementsPanelView => {
  const sheet = useKkSheetCommands();
  const read = useAnnouncementsSeen(panel.announcements, board.lastSeenAnnouncementAt);
  const foot = usePanelFoot(START_ANNOUNCEMENTS_SHEET, hiddenCountOf(panel));

  const rows = shownItemsOf(panel.announcements, panel.shownCount).map(
    (announcement): AnnouncementRow => {
      const line = toAnnouncementLine(announcement, board.now);

      return {
        line,
        meta: toFacets(line.meta),
        state: toAnnouncementLineState(read, board.dimmedKeys.has(line.key)),
        open: () => {
          sheet.open(line.sheetId);
        },
      };
    },
  );

  return {
    rows,
    receipt: read ? RECEIPT_WORD : undefined,
    foot,
  };
};
