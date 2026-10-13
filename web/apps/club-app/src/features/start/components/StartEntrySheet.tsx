import type { FC } from 'react';
import { EntrySheetBody } from '@/features/entry-sheet';
import { useEntrySheet } from '../hooks/use-entry-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartEntry } from '../schemas';

interface StartEntrySheetProps {
  entry: StartEntry;
  board: StartBoard;
}

export const StartEntrySheet: FC<StartEntrySheetProps> = ({ entry, board }) => {
  const sheet = useEntrySheet(entry, board);

  return <EntrySheetBody sheet={sheet} />;
};
