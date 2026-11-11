import type { FC } from 'react';
import { EntrySheetBody } from '@/features/entry-sheet/components/EntrySheetBody';
import { useEntrySheet } from '../hooks/use-entry-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartEntry } from '../schemas';
import { StartEntryFunctions } from './StartEntryFunctions';

interface StartEntrySheetProps {
  entry: StartEntry;
  board: StartBoard;
}

export const StartEntrySheet: FC<StartEntrySheetProps> = ({ entry, board }) => {
  const sheet = useEntrySheet(entry, board);

  return (
    <EntrySheetBody sheet={sheet}>
      <StartEntryFunctions entry={entry} board={board} />
    </EntrySheetBody>
  );
};
