import { useState } from 'react';
import { useSetOfficePublicationMutation } from '../api';
import type { OfficeSeatGroups, PrimaryAction } from '../board-hub';
import {
  canSeatOffice,
  isOfficeVacant,
  lastSeatOf,
  primaryActionOf,
  toOfficeSeatGroups,
  toQueueItems,
} from '../board-hub';
import { toVacantDetail } from '../board-hub-copy';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { toBoardEntries } from '../manage-board-labels';
import { toPublicationErrorMessage } from '../manage-board-messages';
import type { BoardOffice, OfficePaneSection } from '../schemas';

export interface OfficePublicationControl {
  toggle: (isPublic: boolean) => void;
  isSaving: boolean;
  error: string | undefined;
}

export interface OfficePaneControl {
  entry: BoardOfficeEntry | null;
  groups: OfficeSeatGroups;
  isArchived: boolean;
  isVacant: boolean;
  needsWork: boolean;
  vacantFact: string;
  canSeat: boolean;
  canArchive: boolean;
  primary: PrimaryAction | null;
  tab: OfficePaneSection;
  chooseTab: (tab: OfficePaneSection) => void;
  publication: OfficePublicationControl;
  archiveOpen: boolean;
  restoreOpen: boolean;
  openArchive: () => void;
  openRestore: () => void;
  closeDialogs: () => void;
}

export const useOfficePane = (
  office: BoardOffice,
  today: string,
  canManageRoles: boolean,
): OfficePaneControl => {
  const [dialog, setDialog] = useState<'archive' | 'restore' | null>(null);
  const [tab, setTab] = useState<OfficePaneSection>('seats');
  const publication = useSetOfficePublicationMutation(office.boardOfficeId);
  const isArchived = office.archivedOn !== null;
  const canSeat = canSeatOffice(office, canManageRoles);
  const groups = toOfficeSeatGroups(office, today);

  return {
    entry: toBoardEntries([office], today)[0] ?? null,
    groups,
    isArchived,
    isVacant: isOfficeVacant(office, today),
    vacantFact: toVacantDetail(lastSeatOf(office.pastSeats)),
    needsWork: toQueueItems([office], today).some((item) => item.kind !== 'handover'),
    canSeat,
    canArchive: !isArchived && office.seats.length === 0,
    primary: primaryActionOf(office, today, canSeat),
    tab,
    chooseTab: setTab,
    publication: {
      toggle: (isPublic) => {
        publication.mutate({ officeName: office.name, isPublic });
      },
      isSaving: publication.isPending,
      error: toPublicationErrorMessage(publication.error) ?? undefined,
    },
    archiveOpen: dialog === 'archive',
    restoreOpen: dialog === 'restore',
    openArchive: () => {
      setDialog('archive');
    },
    openRestore: () => {
      setDialog('restore');
    },
    closeDialogs: () => {
      setDialog(null);
    },
  };
};
