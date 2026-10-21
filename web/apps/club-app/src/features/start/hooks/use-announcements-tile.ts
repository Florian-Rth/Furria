import type { KkImageSource, KkStartTileReach } from '@furria/ui';
import { toImageSource, useKkSheetCommands } from '@furria/ui';
import { authorGroupsOf, isUnread } from '../announcement-authors';
import type { StartPanelOf } from '../start-board';
import { hiddenCountOf, shownItemsOf } from '../start-board';
import { toAnnouncementLine, toAuthorInitials } from '../start-lines';
import { newestFirst, START_ANNOUNCEMENTS_SHEET } from '../start-sheets';
import { useAnnouncementsSeen } from './use-announcements-seen';
import type { StartBoard } from './use-start-view';

export interface AnnouncementTileLine {
  key: string;
  title: string;
  stamp: string | undefined;
  unread: boolean;
  label: string;
  open: () => void;
}

export interface AnnouncementByline {
  name: string;
  initials: string;
  portrait: KkImageSource | null;
  office: string | undefined;
}

export interface AnnouncementAuthorBlock {
  key: string;
  byline: AnnouncementByline | null;
  lines: AnnouncementTileLine[];
}

export interface AnnouncementsTileView {
  reach: KkStartTileReach;
  blocks: AnnouncementAuthorBlock[];
  further: string | null;
}

const UNREAD_SPOKEN = 'neu';

export const useAnnouncementsTile = (
  panel: StartPanelOf<'announcements'>,
  board: StartBoard,
): AnnouncementsTileView => {
  const sheet = useKkSheetCommands();
  const read = useAnnouncementsSeen(panel.announcements, board.lastSeenAnnouncementAt);
  const shown = shownItemsOf(newestFirst(panel.announcements), panel.shownCount);
  const hidden = hiddenCountOf(panel);

  return {
    reach: {
      label: 'Aushänge öffnen',
      onClick: () => {
        sheet.open(START_ANNOUNCEMENTS_SHEET);
      },
    },
    blocks: authorGroupsOf(shown).map((group) => ({
      key: group.key,
      byline:
        group.author === null
          ? null
          : {
              name: `${group.author.firstName} ${group.author.lastName}`,
              initials: toAuthorInitials(group.author),
              portrait: toImageSource(group.author.portrait, 'portrait'),
              office: group.author.officeName ?? undefined,
            },
      lines: group.announcements.map((announcement) => {
        const line = toAnnouncementLine(announcement, board.now);
        const unread = !read && isUnread(announcement, board.lastSeenAnnouncementAt);

        return {
          key: line.key,
          title: line.title,
          stamp: line.meta[0],
          unread,
          label: unread ? `${line.accessibleName}, ${UNREAD_SPOKEN}` : line.accessibleName,
          open: () => {
            sheet.open(line.sheetId);
          },
        };
      }),
    })),
    further: hidden > 0 ? `+${hidden} weitere` : null,
  };
};
