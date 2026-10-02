import { KkDensePanel } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import { useToDosPanel } from '../hooks/use-to-dos-panel';
import type { StartPanelOf } from '../start-board';

const HEAD_ID = 'start-to-dos-head';
const LABEL = 'ZU ERLEDIGEN';

interface ToDosPanelProps {
  panel: StartPanelOf<'toDos'>;
  board: StartBoard;
}

export const ToDosPanel: FC<ToDosPanelProps> = ({ panel, board }) => {
  const cells = useToDosPanel(panel, board).map((cell) => (
    <KkDensePanel.Cell
      key={cell.key}
      value={cell.value}
      label={cell.label}
      component={Link}
      to={cell.to}
      search={cell.search}
      dimmed={cell.dimmed}
    />
  ));

  return (
    <KkDensePanel material="club" labelledBy={HEAD_ID}>
      <KkDensePanel.Head id={HEAD_ID} label={LABEL} />
      <KkDensePanel.Cells>{cells}</KkDensePanel.Cells>
    </KkDensePanel>
  );
};
