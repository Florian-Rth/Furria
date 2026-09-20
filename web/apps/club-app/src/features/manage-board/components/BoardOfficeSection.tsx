import { KkMeta, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppRecordHeaderCard } from '@/features/session';
import type { BoardDialog } from '../hooks/use-board-dialogs';
import type { BoardOfficeEntry } from '../manage-board-labels';
import {
  ARCHIVED_OFFICE_NOTE,
  isOfficeArchivable,
  OFFICE_EYEBROW,
  toArchivedOfficeMeta,
} from '../manage-board-labels';
import { BoardOfficeActions } from './BoardOfficeActions';
import { BoardOfficeChips } from './BoardOfficeChips';
import { BoardOfficeRoleField } from './BoardOfficeRoleField';
import { BoardPastSeatsPanel } from './BoardPastSeatsPanel';
import { BoardSeatsPanel } from './BoardSeatsPanel';

const BLOCK_GAP = 1.5;

interface BoardOfficeSectionProps {
  entry: BoardOfficeEntry;
  onOpen: (dialog: BoardDialog, boardOfficeId: number) => void;
  onEndSeat: (boardOfficeId: number, boardSeatId: number) => void;
}

export const BoardOfficeSection: FC<BoardOfficeSectionProps> = ({ entry, onOpen, onEndSeat }) => {
  const rename = (): void => {
    onOpen('rename', entry.boardOfficeId);
  };

  const archive = (): void => {
    onOpen('archive', entry.boardOfficeId);
  };

  const restore = (): void => {
    onOpen('restore', entry.boardOfficeId);
  };

  const openSeat = (): void => {
    onOpen('open-seat', entry.boardOfficeId);
  };

  const endSeat = (boardSeatId: number): void => {
    onEndSeat(entry.boardOfficeId, boardSeatId);
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

  return (
    <Stack sx={{ gap: BLOCK_GAP, minWidth: 0 }}>
      <AppRecordHeaderCard
        eyebrow={OFFICE_EYEBROW}
        title={entry.name}
        chips={chips}
        description={<BoardOfficeRoleField entry={entry} />}
        note={note}
        actions={
          <BoardOfficeActions
            isArchived={entry.isArchived}
            canArchive={isOfficeArchivable(entry)}
            onOpenSeat={openSeat}
            onRename={rename}
            onArchive={archive}
            onRestore={restore}
          />
        }
        dimmed={entry.isArchived}
      />
      <BoardSeatsPanel entry={entry} onEnd={endSeat} />
      <BoardPastSeatsPanel seats={entry.pastSeats} />
    </Stack>
  );
};
