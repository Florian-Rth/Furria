import type { KkSheetAction } from '@furria/ui';
import { useKkSheet } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ANNOUNCEMENTS_PATH } from '@/features/session';
import { toInitials } from '@/lib/initials';
import type { StartAnnouncement } from '../schemas';
import { toAnnouncementByline } from '../start-lines';
import {
  announcementsOf,
  focusedAnnouncementOf,
  isAnnouncementsSheet,
  newestFirst,
  START_ANNOUNCEMENTS_SHEET,
} from '../start-sheets';
import type { StartBoard } from './use-start-view';

export interface AnnouncementSheetBlock {
  announcement: StartAnnouncement;
  byline: string;
  initials: string;
  portrait: string | undefined;
  focused: boolean;
  ruled: boolean;
}

export interface AnnouncementsSheetView {
  sheetId: string;
  blocks: AnnouncementSheetBlock[];
  action: KkSheetAction;
}

const ALL_LABEL = 'Alle Aushänge';

export const useAnnouncementsSheet = (board: StartBoard): AnnouncementsSheetView => {
  const { openSheetId } = useKkSheet();
  const [sheetId, setSheetId] = useState<string>(START_ANNOUNCEMENTS_SHEET);

  if (openSheetId !== null && openSheetId !== sheetId && isAnnouncementsSheet(openSheetId)) {
    setSheetId(openSheetId);
  }

  const focusedId = focusedAnnouncementOf(sheetId);

  return {
    sheetId,
    blocks: newestFirst(announcementsOf(board.start)).map((announcement, index) => ({
      announcement,
      byline: toAnnouncementByline(announcement, board.now),
      initials: toInitials(announcement.author.firstName, announcement.author.lastName),
      portrait: announcement.author.portraitUrl ?? undefined,
      focused: announcement.announcementId === focusedId,
      ruled: index > 0,
    })),
    action: { label: ALL_LABEL, component: Link, to: ANNOUNCEMENTS_PATH },
  };
};
