import { KkButton, KkFieldRow, KkIcon, KkMeta, KkNote, KkWriteScreen } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useState } from 'react';
import { AppRecordHeaderCard } from '@/features/session';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  ARCHIVE_OFFICE_BLOCKED_NOTE,
  ARCHIVED_OFFICE_NOTE,
  IMPLIED_ROLE_LABEL,
  isOfficeArchivable,
  OFFICE_EYEBROW,
  toArchivedOfficeMeta,
  toImpliedRoleStatement,
} from '../manage-board-labels';
import { ArchiveBoardOfficeDialog } from './ArchiveBoardOfficeDialog';
import { BoardOfficeChips } from './BoardOfficeChips';
import { BoardPastSeatsPanel } from './BoardPastSeatsPanel';
import { BoardSeatsPanel } from './BoardSeatsPanel';
import { RestoreBoardOfficeDialog } from './RestoreBoardOfficeDialog';

const BLOCK_GAP = 1.5;
const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Vorstandsfunktion bearbeiten';
const RESTORE_LABEL = 'Aktivieren';
const EDIT_ROUTE = '/manage/board/$boardOfficeId/edit';
const ARCHIVE_LABEL = 'Vorstandsfunktion archivieren';

interface BoardOfficeSectionProps {
  entry: BoardOfficeEntry;
  highlightedKey: string | null;
}

export const BoardOfficeSection: FC<BoardOfficeSectionProps> = ({ entry, highlightedKey }) => {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const openArchive = (): void => {
    setArchiveOpen(true);
  };

  const closeArchive = (): void => {
    setArchiveOpen(false);
  };

  const openRestore = (): void => {
    setRestoreOpen(true);
  };

  const closeRestore = (): void => {
    setRestoreOpen(false);
  };

  const archivedMeta = toArchivedOfficeMeta(entry.archivedOn);
  const hasChips = entry.isArchived || entry.isVacant;
  const chips = hasChips ? (
    <BoardOfficeChips isArchived={entry.isArchived} isVacant={entry.isVacant} />
  ) : undefined;

  const note =
    archivedMeta === undefined ? undefined : (
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>
        <KkMeta>{archivedMeta}</KkMeta>
        <KkNote>{ARCHIVED_OFFICE_NOTE}</KkNote>
      </Stack>
    );

  const description = (
    <KkFieldRow label={IMPLIED_ROLE_LABEL} value={toImpliedRoleStatement(entry.impliedRoleName)} />
  );

  const actions = entry.isArchived ? (
    <KkButton size="small" variant="outlined" onClick={openRestore}>
      {RESTORE_LABEL}
    </KkButton>
  ) : (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="edit" size="small" />}
      ariaLabel={EDIT_ACTION_LABEL}
      component={Link}
      to={EDIT_ROUTE}
      params={{ boardOfficeId: String(entry.boardOfficeId) }}
    >
      {EDIT_LABEL}
    </KkButton>
  );

  const archivableFoot = isOfficeArchivable(entry) ? (
    <KkWriteScreen.Danger label={ARCHIVE_LABEL} onSelect={openArchive} />
  ) : (
    <KkNote>{ARCHIVE_OFFICE_BLOCKED_NOTE}</KkNote>
  );
  const danger = entry.isArchived ? null : archivableFoot;

  return (
    <Stack sx={{ gap: BLOCK_GAP, minWidth: 0 }}>
      <AppRecordHeaderCard
        eyebrow={OFFICE_EYEBROW}
        title={entry.name}
        chips={chips}
        description={description}
        note={note}
        actions={actions}
        dimmed={entry.isArchived}
      />
      <BoardSeatsPanel entry={entry} highlightedKey={highlightedKey} />
      <BoardPastSeatsPanel seats={entry.pastSeats} />
      {danger}
      <ArchiveBoardOfficeDialog office={archiveOpen ? entry : null} onClose={closeArchive} />
      <RestoreBoardOfficeDialog office={restoreOpen ? entry : null} onClose={closeRestore} />
    </Stack>
  );
};
