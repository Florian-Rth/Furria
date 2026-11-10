import { KkOfficeMark } from '@furria/ui/KkOfficeMark';
import { KkSinceRow } from '@furria/ui/KkSinceRow';
import type { FC } from 'react';
import type { BoardTermRow } from '../hooks/use-board-term-rows';

interface MemberBoardTermRowProps {
  row: BoardTermRow;
}

export const MemberBoardTermRow: FC<MemberBoardTermRowProps> = ({ row }) => {
  const markState = row.isCurrent ? 'held' : 'archived';
  const mark = <KkOfficeMark icon={row.icon} state={markState} size="small" />;

  return (
    <KkSinceRow
      avatar={mark}
      title={row.office}
      sinceLabel={row.sinceLabel}
      sinceValue={row.sinceValue}
      dimmed={!row.isCurrent}
    />
  );
};
