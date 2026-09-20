import { useKkSheet } from '@furria/ui';
import { useState } from 'react';
import { ANNOUNCEMENT_FORM_SHEET_ID } from '@/lib/announcements';
import { useAnnouncementsQuery } from '../api';
import type { Announcement } from '../schemas';

export interface AnnouncementSheet {
  isOpen: boolean;
  edited: Announcement | null;
  openPost: () => void;
  openEdit: (announcementId: number) => void;
  close: () => void;
}

export const useAnnouncementSheet = (): AnnouncementSheet => {
  const sheet = useKkSheet();
  const announcements = useAnnouncementsQuery();
  const [editedId, setEditedId] = useState<number | null>(null);

  const edited =
    announcements.data?.announcements.find(
      (announcement) => announcement.announcementId === editedId,
    ) ?? null;

  return {
    isOpen: sheet.openSheetId === ANNOUNCEMENT_FORM_SHEET_ID,
    edited,
    openPost: () => {
      setEditedId(null);
      sheet.open(ANNOUNCEMENT_FORM_SHEET_ID);
    },
    openEdit: (announcementId: number) => {
      setEditedId(announcementId);
      sheet.open(ANNOUNCEMENT_FORM_SHEET_ID);
    },
    close: sheet.close,
  };
};
