import { KkDensePanel } from '@furria/ui';
import type { FC } from 'react';
import { useMinePanel } from '../hooks/use-line-panels';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';
import { StartLine } from './StartLine';

const HEAD_ID = 'start-mine-head';
const LABEL = 'DU';

interface MinePanelProps {
  panel: StartPanelOf<'mine'>;
  board: StartBoard;
}

export const MinePanel: FC<MinePanelProps> = ({ panel, board }) => {
  const { rows, foot } = useMinePanel(panel, board);

  const lines = rows.map((row) => (
    <StartLine
      key={row.line.key}
      line={row.line}
      dimmed={row.dimmed}
      onTouch={board.touch}
      onQuiet={board.quiet}
    />
  ));

  const footLine =
    foot === null ? null : <KkDensePanel.Foot label={foot.label} onClick={foot.open} />;

  return (
    <KkDensePanel material="own" labelledBy={HEAD_ID}>
      <KkDensePanel.Head id={HEAD_ID} label={LABEL} />
      <KkDensePanel.Lines>{lines}</KkDensePanel.Lines>
      {footLine}
    </KkDensePanel>
  );
};
