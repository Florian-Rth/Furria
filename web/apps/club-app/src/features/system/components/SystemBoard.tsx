import { KkDiagonalStamp } from '@furria/ui/KkDiagonalStamp';
import { KkFlapBoard } from '@furria/ui/KkFlapBoard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useBrokenStamp } from '../hooks/use-broken-stamp';
import type { SystemStatus } from '../schemas';
import { BOARD_LABEL, STAMP_LABEL } from '../system-copy';
import type { SystemMoment } from '../system-view';
import { boardViewOf } from '../system-view';

interface SystemBoardProps {
  status: SystemStatus;
  moment: SystemMoment;
  offline: string | null;
}

export const SystemBoard: FC<SystemBoardProps> = ({ status, moment, offline }) => {
  const board = boardViewOf(status, moment);
  const stampKey = useBrokenStamp(board.verdictLevel === 'broken');
  const notice = offline === null ? null : <KkFlapBoard.Notice text={offline} />;
  const rows = board.rows.map((row, order) => (
    <KkFlapBoard.Row
      key={row.key}
      level={row.level}
      label={row.label}
      figure={row.figure}
      word={row.word}
      to={row.to}
      component={Link}
      order={order}
      accessibleLabel={row.accessibleLabel}
    />
  ));

  return (
    <>
      <KkFlapBoard label={BOARD_LABEL}>
        <KkFlapBoard.Masthead facts={board.facts} />
        {notice}
        <KkFlapBoard.Rows dimmed={!moment.isConnected}>{rows}</KkFlapBoard.Rows>
        <KkFlapBoard.Verdict
          label={BOARD_LABEL}
          word={board.verdictWord}
          level={board.verdictLevel}
          after={board.rows.length}
        />
        <KkFlapBoard.Reasons reasons={board.reasons} component={Link} />
      </KkFlapBoard>
      <KkDiagonalStamp label={STAMP_LABEL} fireKey={stampKey} />
    </>
  );
};
