import type { FC } from 'react';
import { useEntryPeek } from '../hooks/use-entry-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import { EntrySheetBody } from './EntrySheetBody';

interface EntrySheetProps {
  board: StartBoard;
}

export const EntrySheet: FC<EntrySheetProps> = ({ board }) => {
  const entry = useEntryPeek(board);

  if (entry === null) {
    return null;
  }

  return <EntrySheetBody key={entry.calendarEntryId} entry={entry} board={board} />;
};
