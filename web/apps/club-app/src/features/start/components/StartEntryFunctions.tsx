import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import { toFunctionItems } from '../owed-items';
import type { StartEntry } from '../schemas';
import { OwedItem } from './OwedItem';

interface StartEntryFunctionsProps {
  entry: StartEntry;
  board: StartBoard;
}

export const StartEntryFunctions: FC<StartEntryFunctionsProps> = ({ entry, board }) => {
  const items = toFunctionItems(entry).map((item) => (
    <OwedItem key={item.key} item={item} board={board} />
  ));

  return <Stack sx={{ gap: 3, minWidth: 0 }}>{items}</Stack>;
};
