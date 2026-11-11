import { KkAnswerRow } from '@furria/ui/KkAnswerRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import type { OwedGroup } from '../owed-items';
import { toOwedRowHead } from '../owed-row-head';
import { OwedItem } from './OwedItem';

interface OwedEntryProps {
  group: OwedGroup;
  board: StartBoard;
}

export const OwedEntry: FC<OwedEntryProps> = ({ group, board }) => {
  const head = toOwedRowHead(group.entry);

  const items = group.items.map((item) => <OwedItem key={item.key} item={item} board={board} />);

  return (
    <KkAnswerRow
      title={head.title}
      when={head.when}
      image={head.image}
      tone={head.tone}
      icon={head.icon}
    >
      <Stack sx={{ gap: 2, minWidth: 0 }}>{items}</Stack>
    </KkAnswerRow>
  );
};
