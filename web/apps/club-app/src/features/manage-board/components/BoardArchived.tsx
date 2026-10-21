import { KkQuietFold, KkRoster } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  ARCHIVED_FOLD,
  ARCHIVED_LABEL,
  ARCHIVED_LIST_ID,
  HIDE_LABEL,
  SHOW_LABEL,
} from '../board-hub-copy';
import { useFold } from '../hooks/use-fold';
import type { BoardOffice } from '../schemas';
import { BoardArchivedLine } from './BoardArchivedLine';

interface BoardArchivedProps {
  offices: readonly BoardOffice[];
  compact: boolean;
  selectedId: number | null;
  highlightedKey: string | null;
  onOpen: (boardOfficeId: number) => void;
}

export const BoardArchived: FC<BoardArchivedProps> = ({
  offices,
  compact,
  selectedId,
  highlightedKey,
  onOpen,
}) => {
  const fold = useFold();

  if (offices.length === 0) {
    return null;
  }

  const lines = offices.flatMap((office) =>
    office.archivedOn === null
      ? []
      : [
          <BoardArchivedLine
            highlightedKey={highlightedKey}
            key={office.boardOfficeId}
            office={office}
            archivedOn={office.archivedOn}
            selected={selectedId === office.boardOfficeId}
            compact={compact}
            onOpen={onOpen}
          />,
        ],
  );
  const toggleLabel = fold.open ? HIDE_LABEL : SHOW_LABEL;
  const roster = fold.open ? (
    <KkRoster label={ARCHIVED_LABEL} id={ARCHIVED_LIST_ID} compact={compact}>
      {lines}
    </KkRoster>
  ) : null;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkQuietFold
        label={ARCHIVED_FOLD}
        count={offices.length}
        toggleLabel={toggleLabel}
        open={fold.open}
        controls={ARCHIVED_LIST_ID}
        onToggle={fold.toggle}
      />
      {roster}
    </Stack>
  );
};
